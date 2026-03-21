import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiX, 
  FiCalendar, 
  FiUser, 
  FiPhone, 
  FiTag, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiPackage,
  FiTool,
  FiShoppingBag,
  FiBriefcase,
  FiDollarSign,
  FiInfo,
  FiMapPin,
  FiShield,
  FiTruck,
  FiBox,
  FiAlertTriangle,
  FiCpu,
  FiCheck,
  FiXCircle
} from "react-icons/fi";

interface ShopClaim {
  id: string;
  claim_code: string;
  battery_id: string;
  battery_model: string;
  battery_serial: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_code: string;
  issue_description: string;
  claim_type: string;
  priority: string;
  status: string;
  claim_date: string;
  expected_resolution_date: string;
  resolved_date: string | null;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  capacity?: string;
  voltage?: string;
  battery_type?: string;
}

interface ShopClaimDetailModalProps {
  claim: ShopClaim;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
  getPriorityColor: (priority: string) => string;
}

const ShopClaimDetailModal: React.FC<ShopClaimDetailModalProps> = ({
  claim,
  onClose,
  getStatusColor,
  getTypeColor,
  getPriorityColor
}) => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved':
        return FiCheckCircle;
      case 'pending':
        return FiClock;
      case 'escalated':
        return FiAlertCircle;
      case 'in_progress':
        return FiTool;
      case 'cancelled':
        return FiXCircle;
      default:
        return FiClock;
    }
  };

  const getPriorityIcon = () => {
    switch(claim.priority?.toLowerCase()) {
      case 'high':
        return FiAlertTriangle;
      case 'medium':
        return FiClock;
      case 'low':
        return FiCheckCircle;
      default:
        return FiInfo;
    }
  };

  const getClaimIcon = () => {
    switch(claim.claim_type?.toLowerCase()) {
      case 'warranty':
        return FiShield;
      case 'service':
        return FiTool;
      case 'replacement':
        return FiPackage;
      default:
        return FiShoppingBag;
    }
  };

  const StatusIcon = getStatusIcon(claim.status);
  const PriorityIcon = getPriorityIcon();
  const ClaimIcon = getClaimIcon();
  
  const statusColor = getStatusColor(claim.status);
  const typeColor = getTypeColor(claim.claim_type);
  const priorityColor = getPriorityColor(claim.priority);

  // Modal styles based on screen size
  const modalContentStyle = {
    maxWidth: isMobile ? "95%" : isTablet ? "90%" : "800px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    margin: isMobile ? "10px" : "0",
    width: "100%",
    backgroundColor: "white",
    borderRadius: isMobile ? "16px 16px 0 0" : "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  };

  // Mobile tabs
  const renderMobileTabs = () => (
    <div className="modal-mobile-tabs" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '4px',
      padding: '12px 16px',
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc'
    }}>
      <button
        className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
        onClick={() => setActiveTab('details')}
        style={{
          padding: '8px 4px',
          border: 'none',
          background: activeTab === 'details' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500',
          color: activeTab === 'details' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        <FiPackage size={16} />
        <span>Details</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'timeline' ? 'active' : ''}`}
        onClick={() => setActiveTab('timeline')}
        style={{
          padding: '8px 4px',
          border: 'none',
          background: activeTab === 'timeline' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500',
          color: activeTab === 'timeline' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        <FiClock size={16} />
        <span>Timeline</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
        style={{
          padding: '8px 4px',
          border: 'none',
          background: activeTab === 'notes' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500',
          color: activeTab === 'notes' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        <FiInfo size={16} />
        <span>Notes</span>
      </button>
    </div>
  );

  // Desktop tabs
  const renderDesktopTabs = () => (
    <div className="modal-desktop-tabs" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '16px 24px',
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc'
    }}>
      <button
        className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
        onClick={() => setActiveTab('details')}
        style={{
          padding: '10px 16px',
          border: 'none',
          background: activeTab === 'details' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeTab === 'details' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <FiPackage size={18} />
        <span>Claim Details</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'timeline' ? 'active' : ''}`}
        onClick={() => setActiveTab('timeline')}
        style={{
          padding: '10px 16px',
          border: 'none',
          background: activeTab === 'timeline' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeTab === 'timeline' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <FiClock size={18} />
        <span>Timeline</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
        style={{
          padding: '10px 16px',
          border: 'none',
          background: activeTab === 'notes' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeTab === 'notes' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <FiInfo size={18} />
        <span>Resolution Notes</span>
      </button>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="modal-tab-content">
            {/* Status Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '8px' : '12px',
              marginBottom: '16px'
            }}>
              <div className="status-card" style={{
                padding: isMobile ? '10px' : '12px',
                background: `${typeColor}10`,
                borderLeft: `4px solid ${typeColor}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClaimIcon size={isMobile ? 16 : 20} style={{ color: typeColor }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Claim Type</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: typeColor }}>
                      {claim.claim_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="status-card" style={{
                padding: isMobile ? '10px' : '12px',
                background: `${priorityColor}10`,
                borderLeft: `4px solid ${priorityColor}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PriorityIcon size={isMobile ? 16 : 20} style={{ color: priorityColor }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Priority</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: priorityColor }}>
                      {claim.priority?.toUpperCase() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="status-card" style={{
                padding: isMobile ? '10px' : '12px',
                background: `${statusColor}10`,
                borderLeft: `4px solid ${statusColor}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusIcon size={isMobile ? 16 : 20} style={{ color: statusColor }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Status</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: statusColor }}>
                      {claim.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="detail-section" style={{ marginBottom: '16px' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #3b82f6'
              }}>
                <FiUser size={isMobile ? 16 : 18} /> Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Customer Name:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{claim.customer_name}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Phone Number:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiPhone size={12} style={{ color: '#3b82f6' }} /> {claim.customer_phone}
                  </span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Customer ID:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' }}>{claim.customer_id}</span>
                </div>
              </div>
            </div>

            {/* Battery Details */}
            <div className="detail-section" style={{ marginBottom: '16px' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #3b82f6'
              }}>
                <FiPackage size={isMobile ? 16 : 18} /> Battery Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Battery Model:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{claim.battery_model}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Serial Number:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' }}>{claim.battery_serial}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Battery ID:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' }}>{claim.battery_id}</span>
                </div>
                {claim.brand && (
                  <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Brand:</span>
                    <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{claim.brand}</span>
                  </div>
                )}
                {claim.capacity && claim.voltage && (
                  <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Specifications:</span>
                    <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{claim.capacity} / {claim.voltage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Information */}
            <div className="detail-section" style={{ marginBottom: '16px' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #3b82f6'
              }}>
                <FiTool size={isMobile ? 16 : 18} /> Service Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Service Code:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{claim.service_code || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Service ID:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' }}>{claim.service_id || 'N/A'}</span>
                </div>
              </div>
              <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Issue Description:</span>
                <span style={{ 
                  color: '#1e293b', 
                  fontSize: '14px',
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginTop: '4px',
                  display: 'block',
                  border: '1px solid #e2e8f0'
                }}>
                  {claim.issue_description}
                </span>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="modal-tab-content">
            <div className="detail-section">
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #3b82f6'
              }}>
                <FiClock size={isMobile ? 16 : 18} /> Claim Timeline
              </h3>
              
              <div style={{ position: 'relative', paddingLeft: '30px' }}>
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: '#e2e8f0'
                }}></div>
                
                <div style={{ position: 'relative', paddingBottom: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    zIndex: 1
                  }}>
                    <FiCalendar />
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginLeft: '16px'
                  }}>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      {formatDateTime(claim.claim_date)}
                    </span>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      Claim Created
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                      Shop claim was registered in the system
                    </span>
                  </div>
                </div>

                <div style={{ position: 'relative', paddingBottom: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    zIndex: 1
                  }}>
                    <FiClock />
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginLeft: '16px'
                  }}>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      Expected: {formatDateOnly(claim.expected_resolution_date)}
                    </span>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      Expected Resolution
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                      Estimated completion date for this claim
                    </span>
                  </div>
                </div>

                {claim.resolved_date && (
                  <div style={{ position: 'relative', paddingBottom: '24px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-30px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      zIndex: 1
                    }}>
                      <FiCheckCircle />
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginLeft: '16px'
                    }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        {formatDateTime(claim.resolved_date)}
                      </span>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                        Claim Resolved
                      </span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                        Claim was successfully resolved
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ position: 'relative', paddingBottom: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    zIndex: 1
                  }}>
                    <FiClock />
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginLeft: '16px'
                  }}>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      {formatDateTime(claim.updated_at)}
                    </span>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      Last Updated
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                      Claim information was last modified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="modal-tab-content">
            {claim.resolution_notes ? (
              <div className="detail-section">
                <h3 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #3b82f6'
                }}>
                  <FiCheckCircle size={isMobile ? 16 : 18} /> Resolution Notes
                </h3>
                <div style={{
                  background: '#f8fafc',
                  padding: isMobile ? '16px' : '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: isMobile ? '14px' : '15px',
                  color: '#334155'
                }}>
                  {claim.resolution_notes}
                </div>
              </div>
            ) : (
              <div className="empty-notes" style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0'
              }}>
                <FiInfo size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h4 style={{ color: '#334155', marginBottom: '8px', fontSize: '16px' }}>No Resolution Notes</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Resolution notes have not been added for this claim yet.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? "0" : "20px",
        backdropFilter: "blur(4px)"
      }}
    >
      <motion.div 
        className="modal-content shop-claim-detail-modal"
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        onClick={(e) => e.stopPropagation()}
        style={modalContentStyle}
      >
        <style>
          {`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
            
            @media (max-width: 767px) {
              .modal-overlay {
                align-items: flex-end !important;
              }
              .modal-content {
                animation: slideUp 0.3s ease-out;
                border-radius: 16px 16px 0 0 !important;
              }
            }
            
            @media (min-width: 768px) and (max-width: 1023px) {
              .modal-content {
                max-width: 90% !important;
              }
            }
            
            @media (min-width: 1024px) {
              .modal-content {
                max-width: 800px !important;
              }
            }
            
            .detail-section {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              transition: all 0.2s;
            }
            
            .detail-section:hover {
              border-color: #cbd5e1;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 767px) {
              .detail-section {
                padding: 12px;
              }
            }
            
            .detail-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            
            .detail-item:last-child {
              border-bottom: none;
            }
            
            @media (max-width: 767px) {
              .detail-item {
                flex-direction: column;
                gap: 4px;
              }
              
              .detail-item span:first-child {
                font-size: 11px;
              }
              
              .detail-item span:last-child {
                font-size: 13px;
                text-align: left;
              }
            }
            
            .modal-tab.active {
              background: #3b82f6 !important;
              color: white !important;
            }
            
            .modal-tab.active svg {
              color: white !important;
            }
          `}
        </style>
        
        {/* Modal Header */}
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10,
          borderRadius: isMobile ? '16px 16px 0 0' : '16px 16px 0 0'
        }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="header-icon" style={{
              width: isMobile ? '44px' : '56px',
              height: isMobile ? '44px' : '56px',
              borderRadius: '16px',
              background: typeColor + '20',
              color: typeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '22px' : '28px'
            }}>
              <FiShoppingBag />
            </div>
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: '600', 
                margin: '0 0 4px 0',
                color: '#1f2937'
              }}>
                Shop Claim Details
              </h2>
              <p style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: '#6b7280', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FiTag size={isMobile ? 12 : 14} style={{ color: typeColor }} />
                Claim Code: {claim.claim_code}
              </p>
            </div>
          </div>
          <div className="header-right">
            <motion.button 
              className="close-btn"
              onClick={onClose}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: isMobile ? '20px' : '24px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '8px' : '4px',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              title="Close"
            >
              <FiX />
            </motion.button>
          </div>
        </div>

        {/* Claim Type Banner */}
        <div className="claim-banner" style={{
          background: typeColor,
          padding: isMobile ? '10px 16px' : '12px 24px',
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <FiShoppingBag size={isMobile ? 16 : 18} />
            <span style={{ fontWeight: '500' }}>SHOP CLAIM</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            color: 'white',
            fontSize: isMobile ? '11px' : '12px',
            fontWeight: '500'
          }}>
            {claim.priority?.toUpperCase() || 'NORMAL'} PRIORITY
          </div>
        </div>

        {/* Tabs */}
        {isMobile ? renderMobileTabs() : renderDesktopTabs()}

        {/* Modal Body */}
        <div className="modal-body" style={{
          padding: isMobile ? '16px' : '24px',
          maxHeight: isMobile ? 'calc(90vh - 200px)' : 'calc(90vh - 200px)',
          overflowY: 'auto'
        }}>
          {renderTabContent()}

          {/* System Information - Always visible at bottom */}
          <div className="detail-section" style={{ marginTop: '16px' }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '2px solid #3b82f6'
            }}>
              <FiInfo size={isMobile ? 16 : 18} /> System Information
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <FiCalendar size={12} />
                <span>Created: {formatDateTime(claim.created_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <FiClock size={12} />
                <span>Updated: {formatDateTime(claim.updated_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <FiTag size={12} />
                <span>ID: #{claim.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Only Close button */}
        <div className="modal-footer" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '16px' : '20px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          borderRadius: '0 0 16px 16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div className="footer-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <span>Claim ID: #{claim.id}</span>
            <span className="divider" style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: typeColor }}>Type: {claim.claim_type?.toUpperCase() || 'N/A'}</span>
          </div>
          <div className="footer-actions" style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
            <motion.button
              className="btn secondary"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '12px' : '10px 24px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                minWidth: isMobile ? 'auto' : '120px'
              }}
            >
              <FiX size={isMobile ? 18 : 16} /> Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShopClaimDetailModal;