import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCopy, FiCalendar, FiPackage, FiBattery, FiUser, FiPhone, FiDollarSign, FiFileText } from "react-icons/fi";

interface ReplacementBattery {
  id: string;
  service_order_id: string;
  battery_model: string;
  battery_serial: string;
  brand: string;
  capacity: string;
  voltage: string;
  battery_type: string;
  price: string;
  warranty_period: string;
  installation_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
  service_code: string;
  customer_id: string;
  service_status: string;
  customer_name: string;
  customer_phone: string;
  original_battery_model: string;
  original_battery_serial: string;
}

interface ReplacementDetailModalProps {
  replacement: ReplacementBattery;
  onClose: () => void;
  getStatusColor: (status: string) => string;
}

const ReplacementDetailModal: React.FC<ReplacementDetailModalProps> = ({
  replacement,
  onClose,
  getStatusColor
}) => {
  // Responsive state
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show a temporary success message
    const toast = document.createElement('div');
    toast.textContent = 'Copied to clipboard!';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#10b981';
    toast.style.color = 'white';
    toast.style.padding = '8px 16px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content replacement-detail-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Simplified */}
          <div className="modal-header" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '16px' : '0',
            padding: isMobile ? '20px' : '24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div className="header-left" style={{ width: isMobile ? '100%' : 'auto' }}>
              <div className="title-section" style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ 
                    fontSize: isMobile ? '1.25rem' : '1.5rem', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    Replacement Details
                  </h2>
                  <div className="code-badge" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    background: '#8b5cf6',
                    borderRadius: '30px',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    <FiPackage size={isMobile ? 12 : 14} />
                    <span>{replacement.service_code}</span>
                  </div>
                </div>
              </div>
              <div className="status-section" style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '8px' : '16px',
                marginTop: '8px'
              }}>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(replacement.service_status) + '20',
                    color: getStatusColor(replacement.service_status),
                    padding: '4px 12px',
                    borderRadius: '30px',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    fontWeight: '600',
                    border: `1px solid ${getStatusColor(replacement.service_status)}40`,
                    display: 'inline-block'
                  }}
                >
                  {replacement.service_status.charAt(0).toUpperCase() + replacement.service_status.slice(1)}
                </span>
                <span className="date-info" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '4px 12px',
                  borderRadius: '30px'
                }}>
                  <FiCalendar size={isMobile ? 12 : 14} color="#8b5cf6" />
                  {formatDate(replacement.installation_date)}
                </span>
              </div>
            </div>
            <div className="header-right">
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                title="Close"
                style={{
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#fee2e2',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '16px' : '18px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
                }}
              >
                <FiX />
              </motion.button>
            </div>
          </div>

          {/* Modal Body - Improved Layout */}
          <div className="modal-body" style={{
            padding: isMobile ? '20px' : '24px',
            maxHeight: 'calc(90vh - 140px)',
            overflowY: 'auto',
            background: '#f8fafc'
          }}>
            <div className="detail-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '16px' : '20px'
            }}>
              {/* Customer Information Card */}
              <div className="detail-card" style={{
                background: 'white',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div className="card-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '10px',
                    background: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    <FiUser />
                  </div>
                  <h3 style={{ 
                    fontSize: isMobile ? '1rem' : '1.125rem', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    Customer Information
                  </h3>
                </div>
                <div className="card-content">
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Name</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        {replacement.customer_name}
                      </span>
                      <button
                        onClick={() => copyToClipboard(replacement.customer_name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                      >
                        <FiCopy size={isMobile ? 12 : 14} />
                      </button>
                    </div>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Phone</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        {replacement.customer_phone}
                      </span>
                      <button
                        onClick={() => copyToClipboard(replacement.customer_phone)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                      >
                        <FiCopy size={isMobile ? 12 : 14} />
                      </button>
                    </div>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Customer ID</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.customer_id}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Service Order ID</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.service_order_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Original Battery Card */}
              <div className="detail-card" style={{
                background: 'white',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div className="card-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '10px',
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    <FiBattery />
                  </div>
                  <h3 style={{ 
                    fontSize: isMobile ? '1rem' : '1.125rem', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    Original Battery
                  </h3>
                </div>
                <div className="card-content">
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Model</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.original_battery_model || 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Serial Number</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        {replacement.original_battery_serial || 'Not specified'}
                      </span>
                      {replacement.original_battery_serial && (
                        <button
                          onClick={() => copyToClipboard(replacement.original_battery_serial)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                        >
                          <FiCopy size={isMobile ? 12 : 14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Replacement Battery Card */}
              <div className="detail-card" style={{
                background: 'white',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                gridColumn: isMobile ? 'auto' : 'span 1'
              }}>
                <div className="card-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '10px',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    <FiPackage />
                  </div>
                  <h3 style={{ 
                    fontSize: isMobile ? '1rem' : '1.125rem', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    Replacement Battery
                  </h3>
                </div>
                <div className="card-content">
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Model</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.battery_model || 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Serial Number</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        {replacement.battery_serial || 'Not specified'}
                      </span>
                      {replacement.battery_serial && (
                        <button
                          onClick={() => copyToClipboard(replacement.battery_serial)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                        >
                          <FiCopy size={isMobile ? 12 : 14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Brand</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.brand || 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Type</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.battery_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Capacity</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.capacity || 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Voltage</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.voltage || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information Card */}
              <div className="detail-card" style={{
                background: 'white',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div className="card-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div style={{
                    width: isMobile ? '32px' : '36px',
                    height: isMobile ? '32px' : '36px',
                    borderRadius: '10px',
                    background: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    <FiDollarSign />
                  </div>
                  <h3 style={{ 
                    fontSize: isMobile ? '1rem' : '1.125rem', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    Financial Information
                  </h3>
                </div>
                <div className="card-content">
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #e2e8f0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Price</span>
                    <span style={{ 
                      fontSize: isMobile ? '1rem' : '1.125rem', 
                      color: '#059669', 
                      fontWeight: '600',
                      background: '#d1fae5',
                      padding: '2px 10px',
                      borderRadius: '20px'
                    }}>
                      ₹{parseFloat(replacement.price || '0').toFixed(2)}
                    </span>
                  </div>
                  <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#64748b' }}>Warranty Period</span>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {replacement.warranty_period || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Card - Full Width */}
              {replacement.notes && (
                <div className="detail-card" style={{
                  gridColumn: isMobile ? 'auto' : '1 / -1',
                  background: 'white',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div className="card-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>
                    <div style={{
                      width: isMobile ? '32px' : '36px',
                      height: isMobile ? '32px' : '36px',
                      borderRadius: '10px',
                      background: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: isMobile ? '16px' : '18px'
                    }}>
                      <FiFileText />
                    </div>
                    <h3 style={{ 
                      fontSize: isMobile ? '1rem' : '1.125rem', 
                      fontWeight: '600', 
                      color: '#1f2937', 
                      margin: 0 
                    }}>
                      Notes
                    </h3>
                  </div>
                  <div className="card-content">
                    <div style={{
                      background: '#f8fafc',
                      padding: isMobile ? '12px' : '16px',
                      borderRadius: '12px',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      color: '#334155',
                      lineHeight: '1.6',
                      border: '1px solid #e2e8f0'
                    }}>
                      {replacement.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer - Simplified */}
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '16px 20px' : '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: 'white'
          }}>
            <div className="footer-left">
              <div style={{
                fontSize: isMobile ? '0.65rem' : '0.7rem',
                color: '#94a3b8',
                fontFamily: 'monospace'
              }}>
                ID: {replacement.id}
              </div>
            </div>
            <div className="footer-right">
              <motion.button 
                className="btn close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: isMobile ? '8px 24px' : '10px 32px',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          width: 100%;
          max-width: 1100px;
        }

        /* Hover effects */
        .detail-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }

        .close-btn:hover {
          background: #7c3aed !important;
          box-shadow: 0 6px 10px -2px rgba(139, 92, 246, 0.4) !important;
        }

        /* Tablet Styles */
        @media (min-width: 768px) and (max-width: 1024px) {
          .modal-content {
            max-width: 95%;
          }
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .modal-overlay {
            padding: 0.5rem;
            align-items: flex-end;
          }

          .modal-content {
            max-height: 95vh;
            border-radius: 24px 24px 0 0;
          }
        }

        /* Scrollbar Styles */
        .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Copy button hover */
        button:hover svg {
          color: #8b5cf6;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default ReplacementDetailModal;