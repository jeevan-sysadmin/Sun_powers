import React from "react";
import { motion } from "framer-motion";
import { 
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiTruck,
  FiPackage,
  FiBatteryCharging,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiShieldOff,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut
} from "react-icons/fi";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

interface SidebarProps {
  user: User;
  activeTab: string;
  onNavItemClick: (id: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  activeTab, 
  onNavItemClick, 
  onLogout,
  onClose 
}) => {
  const [navItems] = React.useState<NavItem[]>([
    { icon: <FiHome />, label: 'Dashboard', id: 'dashboard' },
    { icon: <FiShoppingBag />, label: 'Service Orders', id: 'services' },
    { icon: <FiUsers />, label: 'Clients Management', id: 'customers' },
    { icon: <FiBox />, label: 'Products Management', id: 'batteries' },
    { icon: <FiTruck />, label: 'Deliveries', id: 'delivery' },
    { icon: <FiPackage />, label: 'Replacement Batteries', id: 'replacement' },
    { icon: <FiBatteryCharging />, label: 'Spare Battery', id: 'spare_batteries' },
    { icon: <FiArrowRight />, label: 'Sun Powers → Company', id: 'sun_powers_to_company' },
    { icon: <FiArrowLeft />, label: 'Company → Sun Powers', id: 'company_to_sun_powers' },
    { icon: <FiShield />, label: 'Shop Claims', id: 'shop_claims' },
    { icon: <FiShieldOff />, label: 'Company Claims', id: 'company_claims' }
  ]);

  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo">
            <div className="logo-circle" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
              <span>SP</span>
            </div>
            <div className="brand-info">
              <h2 className="sidebar-brand-text">Sun Powers</h2>
              <p className="sidebar-subtext">Inverter & Battery Service</p>
            </div>
          </div>
        </div>
        <button 
          className="sidebar-toggle close"
          onClick={onClose}
        >
          <FiChevronLeft className="sidebar-icon" />
        </button>
      </div>

      <div className="sidebar-content">
        <div className="user-profile">
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.role}</p>
            <span className="user-email">{user.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onNavItemClick(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-arrow">
                <FiChevronRight />
              </span>
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <motion.button 
            className="logout-btn"
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut className="logout-icon" />
            <span className="logout-text">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;