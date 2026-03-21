// @ts-nocheck
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiBattery,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiInfo,
  FiTool,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiShoppingBag,
  FiBriefcase,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiXCircle,
  FiTag,
  FiMapPin,
  FiShield,
  FiTruck,
  FiBox,
  FiAlertTriangle,
  FiCpu
} from "react-icons/fi";

interface Battery {
  id: number;
  battery_code: string;
  battery_model: string;
  battery_serial: string;
  brand: string;
  capacity: string;
  voltage: string;
  battery_type: string;
  category: string;
  price: string;
  warranty_period: string;
  amc_period: string;
  inverter_model: string;
  battery_condition: string;
  is_spare: boolean;
  spare_status?: string;
  created_at: string;
  total_services?: number;
  specifications?: string;
  purchase_date?: string;
  installation_date?: string;
  last_service_date?: string;
  stock_quantity?: string;
  claim_type?: string;
  status?: string;
  shop_stock_quantity?: string;
  company_stock_quantity?: string;
  tracking_status?: string;
}

interface CompclaimDetailModalProps {
  battery: Battery;
  onClose: () => void;
  getBatteryTypeColor: (type: string) => string;
  getConditionColor: (condition: string) => string;
  getClaimColor: (claim: string) => string;
  getTrackingStatusColor: (status: string) => string;
}

const CompclaimDetailModal: React.FC<CompclaimDetailModalProps> = ({
  battery,
  onClose,
  getBatteryTypeColor,
  getConditionColor,
  getClaimColor,
  getTrackingStatusColor
}) => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'history'>('details');
  
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

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    if (isNaN(num)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00' || dateString === '0000-00-00 00:00:00') return 'Not set';
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
    if (!dateString || dateString === '0000-00-00' || dateString === '0000-00-00 00:00:00') return 'Not set';
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

  // Get warranty status
  const getWarrantyStatus = () => {
    if (!battery.warranty_period || battery.warranty_period === '0' || battery.warranty_period === '0 year') {
      return 'no_warranty';
    }
    return 'active';
  };

  const warrantyStatus = getWarrantyStatus();
  const getWarrantyColor = () => {
    switch (warrantyStatus) {
      case 'active':
        return '#10B981';
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getWarrantyIcon = () => {
    switch (warrantyStatus) {
      case 'active':
        return FiCheckCircle;
      case 'expired':
        return FiXCircle;
      default:
        return FiAlertTriangle;
    }
  };

  const WarrantyIcon = getWarrantyIcon();

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return FiCheckCircle;
      case 'in_service':
        return FiTool;
      case 'discontinued':
        return FiXCircle;
      case 'out_of_stock':
        return FiPackage;
      default:
        return FiClock;
    }
  };

  const StatusIcon = getStatusIcon(battery.tracking_status || 'active');

  // Get claim type icon
  const getClaimIcon = () => {
    switch (battery.claim_type?.toLowerCase()) {
      case 'shop':
        return FiShoppingBag;
      case 'company':
        return FiBriefcase;
      case 'suntocomp':
        return FiArrowRight;
      case 'comptosun':
        return FiArrowLeft;
      default:
        return FiBriefcase;
    }
  };

  const ClaimIcon = getClaimIcon();
  const claimColor = getClaimColor(battery.claim_type || 'company');
  const batteryTypeColor = getBatteryTypeColor(battery.battery_type || 'lead_acid');
  const conditionColor = getConditionColor(battery.battery_condition || 'good');
  const trackingColor = getTrackingStatusColor(battery.tracking_status || 'active');

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
        className={`modal-tab ${activeTab === 'specs' ? 'active' : ''}`}
        onClick={() => setActiveTab('specs')}
        style={{
          padding: '8px 4px',
          border: 'none',
          background: activeTab === 'specs' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500',
          color: activeTab === 'specs' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        <FiCpu size={16} />
        <span>Specs</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
        style={{
          padding: '8px 4px',
          border: 'none',
          background: activeTab === 'history' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500',
          color: activeTab === 'history' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        <FiClock size={16} />
        <span>History</span>
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
        <span>Basic Details</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'specs' ? 'active' : ''}`}
        onClick={() => setActiveTab('specs')}
        style={{
          padding: '10px 16px',
          border: 'none',
          background: activeTab === 'specs' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeTab === 'specs' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <FiCpu size={18} />
        <span>Specifications</span>
      </button>
      <button
        className={`modal-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
        style={{
          padding: '10px 16px',
          border: 'none',
          background: activeTab === 'history' ? '#3b82f6' : 'transparent',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeTab === 'history' ? 'white' : '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <FiClock size={18} />
        <span>History & Audit</span>
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
                background: `${trackingColor}10`,
                borderLeft: `4px solid ${trackingColor}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusIcon size={isMobile ? 16 : 20} style={{ color: trackingColor }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Status</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: trackingColor }}>
                      {(battery.tracking_status || 'active').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="status-card" style={{
                padding: isMobile ? '10px' : '12px',
                background: `${conditionColor}10`,
                borderLeft: `4px solid ${conditionColor}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCheckCircle size={isMobile ? 16 : 20} style={{ color: conditionColor }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Condition</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: conditionColor }}>
                      {(battery.battery_condition || 'good').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="status-card" style={{
                padding: isMobile ? '10px' : '12px',
                background: `${getWarrantyColor()}10`,
                borderLeft: `4px solid ${getWarrantyColor()}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WarrantyIcon size={isMobile ? 16 : 20} style={{ color: getWarrantyColor() }} />
                  <div>
                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Warranty</div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: getWarrantyColor() }}>
                      {warrantyStatus === 'active' ? 'Active' : warrantyStatus === 'expired' ? 'Expired' : 'No Warranty'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
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
                <FiPackage size={isMobile ? 16 : 18} /> Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Battery Code:</span>
                  <span style={{ color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>{battery.battery_code || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Model:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{battery.battery_model || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Brand:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{battery.brand || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Serial Number:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' }}>{battery.battery_serial || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Battery Type:</span>
                  <span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: batteryTypeColor + '20',
                      color: batteryTypeColor,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {(battery.battery_type || 'N/A').replace('_', ' ').toUpperCase()}
                    </span>
                  </span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Category:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>{(battery.category || 'N/A').toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Claim Information */}
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
                <FiBriefcase size={isMobile ? 16 : 18} /> Claim Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Claim Type:</span>
                  <span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: claimColor + '20',
                      color: claimColor,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <ClaimIcon size={12} />
                      {(battery.claim_type || 'company').toUpperCase()}
                    </span>
                  </span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Spare Status:</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: battery.is_spare ? '#10B98120' : '#6B728020',
                    color: battery.is_spare ? '#10B981' : '#6B7280',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {battery.is_spare ? <FiCheck size={12} /> : <FiXCircle size={12} />}
                    {battery.is_spare ? 'SPARE' : 'REGULAR'}
                  </span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Total Services:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1e293b', fontWeight: '500' }}>
                    <FiTool size={12} style={{ color: '#3b82f6' }} />
                    {battery.total_services || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Information */}
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
                <FiBox size={isMobile ? 16 : 18} /> Stock Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Shop Stock:</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>{battery.shop_stock_quantity || '0'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Company Stock:</span>
                  <span style={{ color: '#3b82f6', fontWeight: '600' }}>{battery.company_stock_quantity || '0'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Total Stock:</span>
                  <span style={{ color: '#10B981', fontWeight: '600' }}>
                    {(parseInt(battery.shop_stock_quantity || '0') + parseInt(battery.company_stock_quantity || '0')).toString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates & Pricing */}
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
                <FiDollarSign size={isMobile ? 16 : 18} /> Dates & Pricing
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Purchase Date:</span>
                  <span style={{ color: '#1e293b' }}>{formatDate(battery.purchase_date || '')}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Installation Date:</span>
                  <span style={{ color: '#1e293b' }}>{formatDate(battery.installation_date || '')}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Last Service:</span>
                  <span style={{ color: '#1e293b' }}>{formatDate(battery.last_service_date || '')}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Price:</span>
                  <span style={{ color: '#059669', fontWeight: '600' }}>{formatCurrency(battery.price)}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Warranty Period:</span>
                  <span style={{ color: '#1e293b' }}>{battery.warranty_period || 'No warranty'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>AMC Period:</span>
                  <span style={{ color: '#1e293b' }}>{battery.amc_period || 'No AMC'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'specs':
        return (
          <div className="modal-tab-content">
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
                <FiCpu size={isMobile ? 16 : 18} /> Technical Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Capacity:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{battery.capacity || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Voltage:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{battery.voltage || 'N/A'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Inverter Model:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{battery.inverter_model || 'Not specified'}</span>
                </div>
                <div className="detail-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Stock Quantity:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{battery.stock_quantity || '0'}</span>
                </div>
              </div>
            </div>

            {battery.specifications && (
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
                  <FiInfo size={isMobile ? 16 : 18} /> Additional Specifications
                </h3>
                <div style={{
                  background: '#f8fafc',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '13px' : '14px',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap'
                }}>
                  {battery.specifications}
                </div>
              </div>
            )}
          </div>
        );

      case 'history':
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
                <FiClock size={isMobile ? 16 : 18} /> Timeline Information
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
                      {formatDateTime(battery.created_at)}
                    </span>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      Battery Added to System
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                      Company claim battery was registered in the inventory
                    </span>
                  </div>
                </div>

                {battery.purchase_date && battery.purchase_date !== '0000-00-00' && (
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
                      <FiDollarSign />
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginLeft: '16px'
                    }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        {formatDate(battery.purchase_date)}
                      </span>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                        Purchase Date
                      </span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                        Battery was purchased from supplier
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
                      {formatDateTime(battery.updated_at)}
                    </span>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      Last Updated
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                      Battery information was last modified
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
        className="modal-content compclaim-detail-modal"
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
              background: claimColor + '20',
              color: claimColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '22px' : '28px'
            }}>
              <FiBriefcase />
            </div>
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: '600', 
                margin: '0 0 4px 0',
                color: '#1f2937'
              }}>
                {battery.battery_code || 'N/A'}
              </h2>
              <p style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: '#6b7280', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ClaimIcon size={isMobile ? 12 : 14} style={{ color: claimColor }} />
                Company Claim Battery Details
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
          background: claimColor,
          padding: isMobile ? '10px 16px' : '12px 24px',
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <FiBriefcase size={isMobile ? 16 : 18} />
            <span style={{ fontWeight: '500' }}>COMPANY CLAIM</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            color: 'white',
            fontSize: isMobile ? '11px' : '12px',
            fontWeight: '500'
          }}>
            Claim Type: {(battery.claim_type || 'company').toUpperCase()}
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
                <span>Created: {formatDateTime(battery.created_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <FiClock size={12} />
                <span>Updated: {formatDateTime(battery.updated_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <FiTag size={12} />
                <span>ID: #{battery.id}</span>
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
            <span>Battery ID: #{battery.id}</span>
            <span className="divider" style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: claimColor }}>Claim: {(battery.claim_type || 'company').toUpperCase()}</span>
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

export default CompclaimDetailModal;
