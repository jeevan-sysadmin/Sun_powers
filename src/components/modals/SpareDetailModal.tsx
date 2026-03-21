import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiBattery,
  FiPackage,
  FiCalendar,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiXCircle,
  FiMapPin,
  FiBox,
  FiAlertTriangle,
  FiCpu,
  FiShield
} from "react-icons/fi";

interface SpareBattery {
    id: string;
    battery_type: string;
    battery_model: string;
    capacity: string;
    voltage: string;
    manufacturer: string;
    purchase_date: string;
    warranty_months: string;
    current_condition: string;
    quantity: string;
    min_quantity: string;
    location: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    battery_code: string;
    is_spare: number;
    warranty_status?: string;
    warranty_expiry_date?: string;
    is_low_quantity?: number;
}

interface SpareDetailModalProps {
    spare: SpareBattery;
    onClose: () => void;
    getBatteryTypeColor?: (type: string) => string;
    getConditionColor?: (condition: string) => string;
    getAllocationStatusColor?: (status: string) => string;
}

const SpareDetailModal: React.FC<SpareDetailModalProps> = ({
    spare,
    onClose,
    getBatteryTypeColor,
    getConditionColor,
    getAllocationStatusColor
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

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00') return 'N/A';
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
    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return 'N/A';
        try {
            return new Date(dateTimeString).toLocaleDateString('en-IN', {
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

    // Calculate warranty end date
    const calculateWarrantyEnd = () => {
        if (!spare.purchase_date || spare.purchase_date === '0000-00-00' || !spare.warranty_months) {
            return 'N/A';
        }
        try {
            const purchaseDate = new Date(spare.purchase_date);
            const warrantyMonths = parseInt(spare.warranty_months);
            const endDate = new Date(purchaseDate);
            endDate.setMonth(endDate.getMonth() + warrantyMonths);
            return endDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    // Calculate warranty status
    const calculateWarrantyStatus = () => {
        if (!spare.purchase_date || spare.purchase_date === '0000-00-00' || !spare.warranty_months) {
            return 'unknown';
        }
        try {
            const purchaseDate = new Date(spare.purchase_date);
            const warrantyMonths = parseInt(spare.warranty_months);
            const endDate = new Date(purchaseDate);
            endDate.setMonth(endDate.getMonth() + warrantyMonths);
            const today = new Date();
            return today <= endDate ? 'active' : 'expired';
        } catch {
            return 'unknown';
        }
    };

    // Get warranty color
    const getWarrantyColor = () => {
        const status = calculateWarrantyStatus();
        switch (status) {
            case 'active':
                return '#10B981';
            case 'expired':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    // Get warranty icon
    const getWarrantyIcon = () => {
        const status = calculateWarrantyStatus();
        switch (status) {
            case 'active':
                return FiCheckCircle;
            case 'expired':
                return FiXCircle;
            default:
                return FiAlertTriangle;
        }
    };

    // Get condition icon
    const getConditionIcon = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'excellent':
            case 'good':
            case 'new':
                return FiCheckCircle;
            case 'fair':
                return FiClock;
            case 'poor':
            case 'damaged':
            case 'defective':
                return FiAlertCircle;
            default:
                return FiPackage;
        }
    };

    // Get low stock status
    const getLowStockStatus = () => {
        const quantity = parseInt(spare.quantity) || 0;
        const minQuantity = parseInt(spare.min_quantity) || 0;
        return quantity <= minQuantity;
    };

    // Get battery age
    const calculateBatteryAge = () => {
        if (!spare.purchase_date || spare.purchase_date === '0000-00-00') return 'N/A';
        
        try {
            const purchaseDate = new Date(spare.purchase_date);
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

    const warrantyStatus = calculateWarrantyStatus();
    const WarrantyIcon = getWarrantyIcon();
    const isLowStock = getLowStockStatus();
    const batteryAge = calculateBatteryAge();
    const conditionColor = getConditionColor ? getConditionColor(spare.current_condition) : '#6B7280';
    const ConditionIcon = getConditionIcon(spare.current_condition);
    const batteryTypeColor = getBatteryTypeColor ? getBatteryTypeColor(spare.battery_type) : '#3B82F6';

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
                padding: isMobile ? "0" : "20px",
                backdropFilter: "blur(4px)"
            }}
        >
            <motion.div 
                className="modal-content spare-detail-modal"
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
                        
                        .status-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 4px;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            white-space: nowrap;
                        }
                        
                        @media (max-width: 767px) {
                            .status-badge {
                                padding: 4px 8px;
                                font-size: 11px;
                            }
                        }
                        
                        .type-badge {
                            display: inline-block;
                            padding: 4px 12px;
                            border-radius: 20px;
                            color: white;
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                        }
                        
                        @media (max-width: 767px) {
                            .type-badge {
                                padding: 4px 8px;
                                font-size: 11px;
                            }
                        }
                        
                        .inventory-indicator {
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            display: inline-block;
                            margin-right: 6px;
                        }
                        
                        .inventory-indicator.good {
                            background: #10B981;
                            box-shadow: 0 0 0 2px #10B98120;
                        }
                        
                        .inventory-indicator.low {
                            background: #EF4444;
                            box-shadow: 0 0 0 2px #EF444420;
                        }
                        
                        .progress-bar {
                            height: 8px;
                            background: #e2e8f0;
                            border-radius: 4px;
                            overflow: hidden;
                            margin: 8px 0;
                        }
                        
                        .progress-bar-fill {
                            height: 100%;
                            border-radius: 4px;
                            transition: width 0.3s ease;
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
                            <FiBattery size={isMobile ? 20 : 24} style={{ color: batteryTypeColor }} />
                            Spare Battery Details
                        </h2>
                        <p style={{ 
                            fontSize: isMobile ? '0.75rem' : '0.875rem', 
                            color: '#6b7280', 
                            margin: 0 
                        }}>
                            Battery Code: <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#10B981' }}>{spare.battery_code}</span>
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
                            padding: isMobile ? '8px' : '4px',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                        title="Close"
                    >
                        <FiX />
                    </motion.button>
                </div>

                {/* Status Cards */}
                <div style={{ 
                    padding: isMobile ? '12px 12px 0 12px' : '16px 24px 0 24px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: isMobile ? '8px' : '12px',
                        marginBottom: isMobile ? '12px' : '16px'
                    }}>
                        {/* Condition Card */}
                        <div className="detail-section" style={{ 
                            padding: isMobile ? '10px' : '12px',
                            background: `${conditionColor}10`,
                            borderLeft: `4px solid ${conditionColor}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ConditionIcon size={isMobile ? 16 : 20} style={{ color: conditionColor }} />
                                <div>
                                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Condition</div>
                                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: conditionColor }}>
                                        {spare.current_condition || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Card */}
                        <div className="detail-section" style={{ 
                            padding: isMobile ? '10px' : '12px',
                            background: `${getWarrantyColor()}10`,
                            borderLeft: `4px solid ${getWarrantyColor()}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <WarrantyIcon size={isMobile ? 16 : 20} style={{ color: getWarrantyColor() }} />
                                <div>
                                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Warranty</div>
                                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: getWarrantyColor() }}>
                                        {warrantyStatus === 'active' ? 'Active' : warrantyStatus === 'expired' ? 'Expired' : 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Card */}
                        <div className="detail-section" style={{ 
                            padding: isMobile ? '10px' : '12px',
                            background: isLowStock ? '#EF444410' : '#10B98110',
                            borderLeft: `4px solid ${isLowStock ? '#EF4444' : '#10B981'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isLowStock ? <FiAlertTriangle size={isMobile ? 16 : 20} style={{ color: '#EF4444' }} /> 
                                          : <FiCheckCircle size={isMobile ? 16 : 20} style={{ color: '#10B981' }} />}
                                <div>
                                    <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b' }}>Stock Status</div>
                                    <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: isLowStock ? '#EF4444' : '#10B981' }}>
                                        {isLowStock ? 'Low Stock' : 'In Stock'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="order-detail-content" style={{ 
                    padding: isMobile ? '0 12px 12px 12px' : '0 24px 24px 24px'
                }}>
                    <div className="order-detail-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                        gap: isMobile ? '12px' : '16px'
                    }}>
                        {/* Basic Information */}
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
                                borderBottom: '2px solid #10b981'
                            }}>
                                <FiPackage size={isMobile ? 16 : 18} /> Basic Information
                            </h3>
                            <div className="detail-item">
                                <span className="detail-label">Battery Code:</span>
                                <span className="detail-value" style={{ color: '#10b981', fontWeight: '600' }}>
                                    {spare.battery_code}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Model:</span>
                                <span className="detail-value">{spare.battery_model}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Type:</span>
                                <span className="detail-value">
                                    <span 
                                        className="type-badge"
                                        style={{ 
                                            backgroundColor: batteryTypeColor,
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            color: 'white',
                                            fontSize: isMobile ? '11px' : '12px'
                                        }}
                                    >
                                        {spare.battery_type}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Condition:</span>
                                <span className="detail-value">
                                    <span 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: `${conditionColor}20`,
                                            color: conditionColor,
                                            border: `1px solid ${conditionColor}30`
                                        }}
                                    >
                                        <ConditionIcon size={isMobile ? 12 : 14} />
                                        {spare.current_condition || 'Unknown'}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Location:</span>
                                <span className="detail-value">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                                        <FiMapPin size={12} style={{ color: '#64748b' }} />
                                        {spare.location || 'N/A'}
                                    </span>
                                </span>
                            </div>
                        </div>
                        
                        {/* Specifications */}
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
                                borderBottom: '2px solid #10b981'
                            }}>
                                <FiCpu size={isMobile ? 16 : 18} /> Specifications
                            </h3>
                            <div className="detail-item">
                                <span className="detail-label">Capacity:</span>
                                <span className="detail-value">{spare.capacity || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Voltage:</span>
                                <span className="detail-value">{spare.voltage || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Manufacturer:</span>
                                <span className="detail-value">{spare.manufacturer || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Battery Age:</span>
                                <span className="detail-value" style={{ fontWeight: '600' }}>
                                    {batteryAge}
                                </span>
                            </div>
                        </div>
                        
                        {/* Inventory Information */}
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
                                borderBottom: '2px solid #10b981'
                            }}>
                                <FiBox size={isMobile ? 16 : 18} /> Inventory
                            </h3>
                            <div className="detail-item">
                                <span className="detail-label">Current Stock:</span>
                                <span className="detail-value" style={{ 
                                    fontWeight: '600',
                                    color: isLowStock ? '#EF4444' : '#10B981'
                                }}>
                                    {spare.quantity || '0'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Minimum Quantity:</span>
                                <span className="detail-value">{spare.min_quantity || '0'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Stock Level:</span>
                                <span className="detail-value">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                                        <span 
                                            className={`inventory-indicator ${isLowStock ? 'low' : 'good'}`}
                                            style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%',
                                                background: isLowStock ? '#EF4444' : '#10B981'
                                            }}
                                        ></span>
                                        {isLowStock ? 'Reorder Needed' : 'Sufficient'}
                                    </div>
                                </span>
                            </div>
                            
                            {/* Stock Progress Bar */}
                            {!isLowStock && (
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                                        <span>Stock Level</span>
                                        <span>{Math.min(100, Math.round((parseInt(spare.quantity) / parseInt(spare.min_quantity)) * 100))}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-bar-fill"
                                            style={{ 
                                                width: `${Math.min(100, Math.round((parseInt(spare.quantity) / parseInt(spare.min_quantity)) * 100))}%`,
                                                background: isLowStock ? '#EF4444' : '#10B981'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Warranty Information */}
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
                                borderBottom: '2px solid #10b981'
                            }}>
                                <FiShield size={isMobile ? 16 : 18} /> Warranty
                            </h3>
                            <div className="detail-item">
                                <span className="detail-label">Purchase Date:</span>
                                <span className="detail-value">{formatDate(spare.purchase_date)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Warranty Period:</span>
                                <span className="detail-value">{spare.warranty_months || 'N/A'} months</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Warranty Ends:</span>
                                <span className="detail-value" style={{ color: getWarrantyColor(), fontWeight: '600' }}>
                                    {calculateWarrantyEnd()}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Warranty Status:</span>
                                <span className="detail-value">
                                    <span 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: `${getWarrantyColor()}20`,
                                            color: getWarrantyColor(),
                                            border: `1px solid ${getWarrantyColor()}30`
                                        }}
                                    >
                                        <WarrantyIcon size={isMobile ? 12 : 14} />
                                        {warrantyStatus === 'active' ? 'Active' : warrantyStatus === 'expired' ? 'Expired' : 'Unknown'}
                                    </span>
                                </span>
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
                                <span className="detail-value">{formatDateTime(spare.created_at)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Last Updated:</span>
                                <span className="detail-value">{formatDateTime(spare.updated_at)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Database ID:</span>
                                <span className="detail-value" style={{ fontFamily: 'monospace' }}>#{spare.id}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Spare Status:</span>
                                <span className="detail-value">
                                    <span 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: spare.is_spare ? '#10B98120' : '#6B728020',
                                            color: spare.is_spare ? '#10B981' : '#6B7280',
                                            border: `1px solid ${spare.is_spare ? '#10B98130' : '#6B728030'}`
                                        }}
                                    >
                                        {spare.is_spare ? <FiCheck size={12} /> : <FiXCircle size={12} />}
                                        {spare.is_spare ? 'Yes' : 'No'}
                                    </span>
                                </span>
                            </div>
                        </div>
                        
                        {/* Additional Notes */}
                        {spare.notes && (
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
                                    <FiInfo size={isMobile ? 16 : 18} /> Additional Notes
                                </h3>
                                <div className="notes-content" style={{
                                    background: '#f8fafc',
                                    padding: isMobile ? '12px' : '16px',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#334155',
                                    border: '1px solid #e2e8f0',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {spare.notes}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons - Only Close button remains */}
                    <div className="order-detail-actions" style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
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
                                padding: isMobile ? '12px 20px' : '10px 24px',
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

export default SpareDetailModal;