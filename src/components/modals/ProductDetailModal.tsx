import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiEdit,
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
  FiHome,
  FiMapPin
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
  status: string;
  claim_type: string;
  price: string;
  warranty_period: string;
  amc_period: string;
  battery_condition: string;
  is_spare: any;
  created_at: string;
  updated_at: string;
  total_services?: number;
  specifications?: string;
  purchase_date?: string;
  installation_date?: string;
  last_service_date?: string;
}

interface ProductDetailModalProps {
  battery: Battery;
  onClose: () => void;
  onEdit: () => void;
  getBatteryTypeColor: (type: string) => string;
  getConditionColor: (condition: string) => string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  battery,
  onClose,
  onEdit,
  getBatteryTypeColor,
  getConditionColor
}) => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
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

  // Debug: Log the battery data when component mounts
  useEffect(() => {
    console.log('🔍 DEBUG - Battery data received in modal:', {
      id: battery.id,
      code: battery.battery_code,
      is_spare_raw: battery.is_spare,
      is_spare_type: typeof battery.is_spare,
      is_spare_stringified: JSON.stringify(battery.is_spare),
      full_battery: battery
    });
  }, [battery]);

  // Format price with Indian Rupees
  const formatPrice = (price: string) => {
    if (!price) return '₹0.00';
    return `₹${parseFloat(price || '0').toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format date with time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Calculate battery age if purchase date exists
  const calculateBatteryAge = () => {
    if (!battery.purchase_date) return 'N/A';
    
    try {
      const purchaseDate = new Date(battery.purchase_date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - purchaseDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
      }
    } catch {
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#10B98120', color: '#10B981', icon: FiCheckCircle };
      case 'in_service':
        return { bg: '#F59E0B20', color: '#F59E0B', icon: FiTool };
      case 'discontinued':
        return { bg: '#6B728020', color: '#6B7280', icon: FiX };
      case 'out_of_stock':
        return { bg: '#EF444420', color: '#EF4444', icon: FiPackage };
      case 'replaced':
        return { bg: '#8B5CF620', color: '#8B5CF6', icon: FiBattery };
      default:
        return { bg: '#6B728020', color: '#6B7280', icon: FiAlertCircle };
    }
  };

  // Get claim type details
  const getClaimTypeDetails = (claimType: string) => {
    switch (claimType?.toLowerCase()) {
      case 'shop':
        return { label: 'Shop', icon: FiShoppingBag, description: 'Shop claim', color: '#3B82F6' };
      case 'company':
        return { label: 'Company', icon: FiBriefcase, description: 'Company claim', color: '#8B5CF6' };
      case 'suntocomp':
        return { label: 'Sun to Company', icon: FiArrowRight, description: 'Sun Powers to Company', color: '#10B981' };
      case 'comptosun':
        return { label: 'Company to Sun', icon: FiArrowLeft, description: 'Company to Sun Powers', color: '#F59E0B' };
      default:
        return { label: claimType, icon: FiInfo, description: 'Unknown claim type', color: '#6B7280' };
    }
  };

  // ULTIMATE FIX: Get spare battery status - handles all edge cases
  const getSpareStatus = () => {
    const spareValue = battery.is_spare;
    
    console.log('🔄 Processing spare value:', {
      raw: spareValue,
      type: typeof spareValue,
      string: String(spareValue),
      number: Number(spareValue),
      boolean: Boolean(spareValue),
      json: JSON.stringify(spareValue)
    });
    
    // If value is undefined or null, return false
    if (spareValue === undefined || spareValue === null) {
      console.log('⚠️ Spare value is undefined/null, returning false');
      return false;
    }
    
    // Handle boolean values directly
    if (typeof spareValue === 'boolean') {
      console.log('🔘 Boolean value detected:', spareValue);
      return spareValue;
    }
    
    // Convert to string first for consistent checking
    const stringValue = String(spareValue).toLowerCase().trim();
    
    console.log('📝 Stringified value for checking:', stringValue);
    
    // Check for TRUE values (more comprehensive list)
    const trueValues = ['true', '1', 'yes', 'y', 'on', 't', 'active', 'enabled', 'checked', 'selected'];
    if (trueValues.includes(stringValue)) {
      console.log('✅ Matched true value, returning TRUE');
      return true;
    }
    
    // Check for FALSE values
    const falseValues = ['false', '0', 'no', 'n', 'off', 'f', 'inactive', 'disabled', 'unchecked', 'deselected'];
    if (falseValues.includes(stringValue)) {
      console.log('❌ Matched false value, returning FALSE');
      return false;
    }
    
    // For numbers, check if it's truthy (non-zero)
    if (!isNaN(Number(spareValue))) {
      const isTruthy = Number(spareValue) !== 0;
      console.log('🔢 Numeric value detected:', spareValue, 'isTruthy:', isTruthy);
      return isTruthy;
    }
    
    // Default fallback - check if it's truthy
    const isTruthy = Boolean(spareValue);
    console.log('⚡ Default truthy check:', isTruthy);
    return isTruthy;
  };

  // Get status details
  const statusDetails = getStatusColor(battery.status || 'active');
  const StatusIcon = statusDetails.icon;
  
  // Get claim type details
  const claimTypeDetails = getClaimTypeDetails(battery.claim_type || 'shop');
  const ClaimTypeIcon = claimTypeDetails.icon;

  // Get spare status - using the ultimate fix function
  const isSpare = getSpareStatus();

  // Final debug log
  console.log('🎯 FINAL RESULT - Battery:', {
    id: battery.id,
    code: battery.battery_code,
    raw_is_spare: battery.is_spare,
    computed_is_spare: isSpare
  });

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
        padding: isMobile ? "0" : "20px"
      }}
    >
      <motion.div 
        className="modal-content order-detail-modal"
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
              
              .detail-label {
                font-size: 11px;
              }
              
              .detail-value {
                font-size: 13px;
              }
            }
            
            .detail-label {
              color: #64748b;
              font-size: 13px;
              font-weight: 500;
            }
            
            .detail-value {
              color: #1e293b;
              font-size: 14px;
              font-weight: 500;
              text-align: right;
            }
            
            @media (max-width: 767px) {
              .detail-value {
                text-align: left;
              }
            }
          `}
        </style>
        
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
          <div className="modal-title">
            <h2 style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '1.2rem' : '1.5rem', 
              fontWeight: '600', 
              margin: '0 0 4px 0',
              color: '#1f2937'
            }}>
              <FiBattery size={isMobile ? 20 : 24} />
              Battery Details
            </h2>
            <p style={{ 
              fontSize: isMobile ? '0.75rem' : '0.875rem', 
              color: '#6b7280', 
              margin: 0 
            }}>
              Battery Code: {battery.battery_code}
            </p>
          </div>
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
              padding: isMobile ? '8px' : '4px'
            }}
          >
            <FiX />
          </motion.button>
        </div>
        
        <div className="order-detail-content" style={{ 
          padding: isMobile ? '12px' : '24px'
        }}>
          <div className="order-detail-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: isMobile ? '12px' : '16px'
          }}>
            {/* Basic Information */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiPackage size={isMobile ? 16 : 18} /> Basic Information
              </h3>
              <div className="detail-item">
                <span className="detail-label">Battery Code:</span>
                <span className="detail-value" style={{ color: '#10b981', fontWeight: '600' }}>
                  {battery.battery_code}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Model:</span>
                <span className="detail-value">{battery.battery_model}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Serial Number:</span>
                <span className="detail-value">{battery.battery_serial || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Brand:</span>
                <span className="detail-value">{battery.brand || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: statusDetails.bg,
                      color: statusDetails.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: isMobile ? '4px' : '6px',
                      padding: isMobile ? '4px 8px' : '4px 12px',
                      borderRadius: '20px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '600',
                      border: `1px solid ${statusDetails.color}30`
                    }}
                  >
                    <StatusIcon size={isMobile ? 12 : 14} />
                    {battery.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Spare Battery:</span>
                <span className="detail-value">
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                    {isSpare ? (
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: '#10B98120',
                          color: '#10B981',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: isMobile ? '4px' : '6px',
                          padding: isMobile ? '4px 8px' : '4px 12px',
                          borderRadius: '20px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: '600',
                          border: '1px solid #10B98130'
                        }}
                      >
                        <FiCheck size={isMobile ? 12 : 14} /> YES
                      </span>
                    ) : (
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: '#6B728020',
                          color: '#6B7280',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: isMobile ? '4px' : '6px',
                          padding: isMobile ? '4px 8px' : '4px 12px',
                          borderRadius: '20px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: '600',
                          border: '1px solid #6B728030'
                        }}
                      >
                        <FiXCircle size={isMobile ? 12 : 14} /> NO
                      </span>
                    )}
                    {!isMobile && (
                      <small style={{ color: '#6B7280', fontSize: '10px' }}>
                        (Raw: {JSON.stringify(battery.is_spare)})
                      </small>
                    )}
                  </div>
                </span>
              </div>
            </div>
            
            {/* Specifications */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiTool size={isMobile ? 16 : 18} /> Specifications
              </h3>
              <div className="detail-item">
                <span className="detail-label">Battery Type:</span>
                <span 
                  className="detail-value"
                  style={{ 
                    color: getBatteryTypeColor(battery.battery_type),
                    fontWeight: '600'
                  }}
                >
                  {battery.battery_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{battery.category?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capacity:</span>
                <span className="detail-value">{battery.capacity || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Voltage:</span>
                <span className="detail-value">{battery.voltage || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Battery Condition:</span>
                <span 
                  className="detail-value"
                  style={{ 
                    color: getConditionColor(battery.battery_condition),
                    fontWeight: '600'
                  }}
                >
                  {battery.battery_condition?.replace('_', ' ').toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Services:</span>
                <span className="detail-value" style={{ fontWeight: '600' }}>
                  {battery.total_services || 0}
                </span>
              </div>
            </div>
            
            {/* Warranty & Pricing */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiDollarSign size={isMobile ? 16 : 18} /> Warranty & Pricing
              </h3>
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value" style={{ fontWeight: '600', color: '#059669' }}>
                  {formatPrice(battery.price)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Warranty Period:</span>
                <span className="detail-value">{battery.warranty_period || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">AMC Period:</span>
                <span className="detail-value">
                  {battery.amc_period === "0" || battery.amc_period === "0 year" ? "No AMC" : battery.amc_period || 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Claim & Ownership */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiBriefcase size={isMobile ? 16 : 18} /> Claim & Ownership
              </h3>
              <div className="detail-item">
                <span className="detail-label">Claim Type:</span>
                <span className="detail-value">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${claimTypeDetails.color}20`,
                      color: claimTypeDetails.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: isMobile ? '4px' : '6px',
                      padding: isMobile ? '4px 8px' : '4px 12px',
                      borderRadius: '20px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '600',
                      border: `1px solid ${claimTypeDetails.color}30`
                    }}
                  >
                    <ClaimTypeIcon size={isMobile ? 12 : 14} />
                    {claimTypeDetails.label}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Claim Description:</span>
                <span className="detail-value">
                  <small style={{ color: '#6B7280', fontSize: isMobile ? '11px' : '12px' }}>
                    {claimTypeDetails.description}
                  </small>
                </span>
              </div>
            </div>
            
            {/* Dates Information */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiCalendar size={isMobile ? 16 : 18} /> Dates Information
              </h3>
              <div className="detail-item">
                <span className="detail-label">Purchase Date:</span>
                <span className="detail-value">{formatDate(battery.purchase_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Installation Date:</span>
                <span className="detail-value">{formatDate(battery.installation_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Service Date:</span>
                <span className="detail-value">{formatDate(battery.last_service_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Battery Age:</span>
                <span className="detail-value">{calculateBatteryAge()}</span>
              </div>
            </div>
            
            {/* System Information */}
            <div className="detail-section" style={{
              gridColumn: isMobile ? '1' : 'span 1'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #10b981'
              }}>
                <FiInfo size={isMobile ? 16 : 18} /> System Information
              </h3>
              <div className="detail-item">
                <span className="detail-label">Created Date:</span>
                <span className="detail-value">{formatDateTime(battery.created_at)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">{formatDateTime(battery.updated_at)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Database ID:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace' }}>#{battery.id}</span>
              </div>
            </div>
            
            {/* Specifications Details */}
            {battery.specifications && (
              <div className="detail-section" style={{
                gridColumn: isMobile ? '1' : 'span 2'
              }}>
                <h3 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #10b981'
                }}>
                  <FiInfo size={isMobile ? 16 : 18} /> Specifications Details
                </h3>
                <div className="specifications-content" style={{
                  background: '#f8fafc',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '13px' : '14px',
                  color: '#334155',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: 0 }}>{battery.specifications}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="order-detail-actions" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'flex-end',
            gap: isMobile ? '12px' : '16px',
            marginTop: isMobile ? '20px' : '24px',
            paddingTop: isMobile ? '16px' : '0',
            borderTop: isMobile ? '1px solid #e2e8f0' : 'none'
          }}>
            <motion.button 
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '12px' : '10px 20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                cursor: 'pointer'
              }}
            >
              Close
            </motion.button>
            <motion.button 
              className="btn primary"
              onClick={() => {
                onClose();
                onEdit();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '12px' : '10px 20px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FiEdit size={isMobile ? 18 : 16} /> Edit Battery
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailModal;