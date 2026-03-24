import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Float, Stars, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle, FiShield, FiTool } from "react-icons/fi";
import * as THREE from "three";

// Import your logo
import sunLogo from "../assets/sunlogo.png";

// Type definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  phone?: string;
  is_active?: number;
  last_login?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  role?: 'admin' | 'staff' | 'user';
  redirect?: string;
}

interface LoginProps {
  onLoginSuccess?: (role: string, userData: User) => void;
}

// 3D Background Component
function CosmicBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
    }
  });

  const particlesCount = 300;
  const particlesPositions = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i += 3) {
    particlesPositions[i] = (Math.random() - 0.5) * 20;
    particlesPositions[i + 1] = (Math.random() - 0.5) * 20;
    particlesPositions[i + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <>
      <Stars radius={300} depth={100} count={7000} factor={6} saturation={0.5} fade speed={2} />
      <fog attach="fog" args={['#0a0e17', 10, 50]} />
      
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.2, 64, 64]} position={[0, 0, -15]}>
          <meshStandardMaterial color="#FFD700" emissive="#FF6B00" emissiveIntensity={0.8} roughness={0.2} metalness={0.8} />
          <pointLight intensity={2} color="#FFD700" distance={30} />
        </Sphere>
        <Sphere args={[1.5, 32, 32]} position={[0, 0, -15]}>
          <meshBasicMaterial color="#FF9500" transparent opacity={0.2} side={THREE.BackSide} />
        </Sphere>
      </Float>

      <group ref={groupRef}>
        <Float speed={1.5} rotationIntensity={0.5}>
          <Sphere args={[0.4, 32, 32]} position={[5, 2, -10]}>
            <meshStandardMaterial color="#1cb3ff" emissive="#0088cc" emissiveIntensity={0.3} roughness={0.5} />
          </Sphere>
          <Ring args={[0.6, 0.65, 32]} position={[5, 2, -10]} rotation={[Math.PI / 4, 0, 0]}>
            <meshBasicMaterial color="#1cb3ff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </Ring>
        </Float>

        <Float speed={2} rotationIntensity={0.3}>
          <Sphere args={[0.6, 32, 32]} position={[-6, -1, -12]}>
            <meshStandardMaterial color="#ff6b8b" emissive="#ff2e5d" emissiveIntensity={0.2} roughness={0.6} />
          </Sphere>
        </Float>
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlesPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} sizeAttenuation={true} color="#FFFFFF" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

// API login function
async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const loginData = { email, password };

  console.log("Attempting login with:", { email });
  
  try {
    // Use the correct endpoint
    const endpoint = "http://localhost/sun_powers/api/login.php";
    
    console.log(`Connecting to: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(loginData),
      credentials: "omit"
    });

    const text = await response.text();
    console.log("Raw response:", text.substring(0, 200));
    
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error("Failed to parse JSON. Server returned HTML/PHP error.");
      throw new Error("Server error. Please check if PHP is configured correctly.");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Connection failed. Make sure XAMPP is running.");
  }
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    setShake(false);
    
    if (!email || !password) {
      setLoginError("Please enter both email and password");
      setShake(true);
      setIsLoading(false);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError("Please enter a valid email address");
      setShake(true);
      setIsLoading(false);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const data = await apiLogin(email, password);
      
      if (data.success && data.token) {
        setSuccess(true);
        
        const user = data.user;
        const role = data.role || user?.role || 'user';
        
        setUserData(user || null);
        setRedirectingTo(role);
        
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        
        // Store complete user data
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userName', user.name);
          localStorage.setItem('userEmail', user.email);
        }
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        if (onLoginSuccess && user) {
          onLoginSuccess(role, user);
        }
        
        const redirectUrl = data.redirect || '/dashboard';
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      } else {
        setLoginError(data.message || "Invalid email or password");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <FiShield />;
      case 'staff': return <FiTool />;
      default: return <FiUser />;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return '#667eea';
      case 'staff': return '#52dd38';
      default: return '#FFD700';
    }
  };

  return (
    <div className="login-container">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={["#0a0e17"]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
          <pointLight position={[-10, -10, 5]} intensity={0.5} color="#1cb3ff" />
          <CosmicBackground />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      <div className="login-card-wrapper">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        >
          <motion.div 
            className="logo-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <img src={sunLogo} alt="Sun Powers" className="logo-image" />
            <motion.div 
              className="logo-glow"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1 className="title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="company-name">Sun Powers</span>
          </motion.h1>
          
          <motion.p className="login-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Sign in to your account
          </motion.p>

          <form onSubmit={handleLogin} className={`login-form ${shake ? 'shake' : ''}`}>
            <motion.div className="input-group" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                  required
                  className="login-input"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div className="input-group" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                  required
                  className="login-input"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>

            {loginError && (
              <motion.div 
                className="login-error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <FiAlertCircle className="error-icon" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <motion.div className="form-options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                  disabled={isLoading}
                />
                <span className="checkbox-custom">
                  {rememberMe && <div className="checkbox-checkmark" />}
                </span>
                <span className="checkbox-label">Remember me</span>
              </label>
            </motion.div>

            <AnimatePresence>
              {success ? (
                <motion.div className="success-container" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <div className="success-icon">{redirectingTo && getRoleIcon(redirectingTo)}</div>
                  <div className="success-text">
                    <h3>Welcome, {userData?.name || 'User'}!</h3>
                    <p>{userData?.email}</p>
                    <p>Login Successful!</p>
                    <p>Redirecting to Dashboard...</p>
                    {redirectingTo && (
                      <div className="role-badge" style={{ backgroundColor: getRoleColor(redirectingTo) }}>
                        {redirectingTo.toUpperCase()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  type="submit"
                  className="btn-login"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      <span className="btn-text">Signing In...</span>
                    </>
                  ) : (
                    <>
                      <FiLogIn className="btn-icon" />
                      <span className="btn-text">Sign In</span>
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </form>

          <motion.div className="footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <p className="footer-text">© 2026 Sun Powers. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .login-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0a0e17;
        }

        .canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .login-card-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          width: 100%;
          max-width: 450px;
          padding: 0 20px;
        }

        .login-card {
          background: rgba(10, 14, 23, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px 35px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 25px;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
          position: relative;
          z-index: 2;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%);
          border-radius: 50%;
          z-index: 1;
        }

        .title {
          text-align: center;
          margin-bottom: 15px;
          color: #ffffff;
          font-weight: 700;
          font-size: 2.5rem;
          letter-spacing: 1px;
        }

        .company-name {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          text-align: center;
          color: #aaa;
          margin-bottom: 35px;
          font-size: 1rem;
          letter-spacing: 0.5px;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #FFD700;
          font-size: 1.2rem;
          z-index: 1;
        }

        .login-input {
          width: 100%;
          padding: 16px 16px 16px 50px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .login-input:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
          background: rgba(255, 255, 255, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 5px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: #FFD700;
        }

        .login-error-message {
          color: #ff4757;
          font-size: 0.9rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: rgba(255, 71, 87, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(255, 71, 87, 0.2);
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 25px;
        }

        .checkbox-input {
          display: none;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: transparent;
        }

        .checkbox-checkmark {
          width: 10px;
          height: 10px;
          background-color: #FFD700;
          border-radius: 2px;
        }

        .checkbox-container input:checked + .checkbox-custom {
          background: rgba(255, 215, 0, 0.1);
          border-color: #FFD700;
        }

        .btn-login {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
          border: none;
          border-radius: 12px;
          color: #000;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(255, 215, 0, 0.3);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 0, 0, 0.2);
          border-top: 3px solid black;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .success-container {
          background: rgba(82, 221, 56, 0.1);
          border: 1px solid rgba(82, 221, 56, 0.3);
          border-radius: 15px;
          padding: 25px;
          text-align: center;
          margin-bottom: 20px;
        }

        .success-icon {
          font-size: 3rem;
          color: #52dd38;
          margin-bottom: 15px;
        }

        .success-text h3 {
          margin: 0 0 5px 0;
          color: #52dd38;
          font-size: 1.3rem;
        }

        .success-text p {
          margin: 5px 0;
          color: #fff;
          font-size: 0.9rem;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 15px;
          border-radius: 20px;
          color: white;
          font-size: 0.85rem;
          font-weight: bold;
          margin-top: 10px;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}