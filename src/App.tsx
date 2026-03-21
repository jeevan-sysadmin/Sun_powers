import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const isDevelopment = import.meta.env.DEV;

// Type for authentication state
interface AuthState {
  isLoggedIn: boolean;
  role: string;
  userData: any | null;
  isLoading: boolean;
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        // For development/testing, you can bypass auth check temporarily
        // Remove this in production
        const bypassAuth = isDevelopment && localStorage.getItem('bypassAuth') === 'true';
        
        if ((token && userData) || bypassAuth) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #3b82f6',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

// Public Route Component (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          setIsAuthenticated(true);
          navigate('/dashboard', { replace: true });
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #3b82f6',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : null;
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              Something went wrong
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '16px' }}>
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            {isDevelopment && this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#fee2e2',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  fontSize: '12px',
                  color: '#991b1b',
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              style={{
                padding: '10px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onClick={() => window.location.reload()}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check initial auth state from localStorage
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : null;
      
      return {
        isLoggedIn: !!(token && userData),
        role: parsedUserData?.role || 'user',
        userData: parsedUserData,
        isLoading: false
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('userData');
      return {
        isLoggedIn: false,
        role: 'user',
        userData: null,
        isLoading: false
      };
    }
  });

  // Handle login success
  const handleLoginSuccess = (role: string, userData: any = null, token: string = '') => {
    try {
      // Store auth data
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      if (userData) {
        const safeUserData = {
          id: userData.id || '',
          email: userData.email || '',
          name: userData.name || userData.full_name || '',
          role: userData.role || 'user',
          // Add other safe properties as needed
        };
        localStorage.setItem('userData', JSON.stringify(safeUserData));
      }
      
      setAuthState({
        isLoggedIn: true,
        role: role || userData?.role || 'user',
        userData: userData,
        isLoading: false
      });
      
      // Dispatch custom event for components that might be listening
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { isLoggedIn: true, userData }
      }));
      
    } catch (error) {
      console.error('Login success handling failed:', error);
      alert('Login successful but failed to save session. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Store the current URL for potential redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Clear session storage if needed
      sessionStorage.removeItem('redirectAfterLogin');
      
      setAuthState({
        isLoggedIn: false,
        role: 'user',
        userData: null,
        isLoading: false
      });
      
      // Dispatch storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authToken',
        oldValue: 'exists',
        newValue: null,
        url: window.location.href,
        storageArea: localStorage
      }));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { isLoggedIn: false, userData: null }
      }));
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear localStorage as fallback
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Handle global errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // You can log this to an error reporting service
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can log this to an error reporting service
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Add a development mode bypass button (remove in production)
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    // Add dev tools toggle on double Ctrl press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && isDevelopment) {
        if (e.key === 'd' || e.key === 'D') {
          setShowDevTools(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Development tools - remove in production */}
          {isDevelopment && showDevTools && (
            <div style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              zIndex: 9999,
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                  onClick={() => {
                    localStorage.setItem('bypassAuth', 'true');
                    window.location.reload();
                  }}
                  style={{
                    padding: '5px 10px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Bypass Auth
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('bypassAuth');
                    window.location.reload();
                  }}
                  style={{
                    padding: '5px 10px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Clear Bypass
                </button>
              </div>
              <div>Auth State: {authState.isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
              <div>Role: {authState.role}</div>
              <button
                onClick={() => setShowDevTools(false)}
                style={{
                  marginTop: '10px',
                  padding: '3px 6px',
                  background: '#6b7280',
                  border: 'none',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                Hide
              </button>
            </div>
          )}

          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login 
                    onLoginSuccess={handleLoginSuccess}
                  />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard 
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/" 
              element={
                <Navigate to="/dashboard" replace />
              } 
            />
            
            {/* 404 Page */}
            <Route 
              path="*" 
              element={
                <div style={{
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '16px'
                    }}>
                      404
                    </h1>
                    <p style={{ 
                      color: '#4b5563', 
                      marginBottom: '24px',
                      fontSize: '18px'
                    }}>
                      Page not found
                    </p>
                    <a 
                      href="/dashboard" 
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        display: 'inline-block',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                      Go to Dashboard
                    </a>
                    <div style={{ marginTop: '24px' }}>
                      <button
                        onClick={() => window.history.back()}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
