import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiUser,
  FiBattery,
  FiPower,
  FiInfo,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiEdit,
  FiPrinter,
  FiUsers,
  FiBox,
  FiBatteryCharging,
  FiPackage,
  FiCheckCircle
} from "react-icons/fi";

interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  battery_model: string;
  battery_serial: string;
  inverter_model: string;
  inverter_serial: string;
  issue_description: string;
  status: string;
  priority: string;
  payment_status: string;
  estimated_cost: string;
  final_cost: string;
  created_at: string;
  warranty_status: string;
  amc_status: string;
  estimated_completion_date: string;
  notes: string;
  customer_id?: number;
  battery_id?: number;
  inverter_id?: number;
  service_staff_id?: number;
  service_staff_name?: string;
  deposit_amount?: string;
  replacement_battery_serial?: string;
  replacement_battery_model?: string;
  replacement_battery_brand?: string;
  replacement_battery_capacity?: string;
  replacement_battery_type?: string;
  replacement_battery_voltage?: string;
  replacement_battery_price?: string;
  replacement_battery_warranty?: string;
  replacement_installation_date?: string;
  replacement_battery_notes?: string;
  customer_email?: string;
  customer_address?: string;
  battery_brand?: string;
  battery_capacity?: string;
  battery_type?: string;
  battery_purchase_date?: string;
  battery_warranty_period?: string;
  inverter_brand?: string;
  inverter_capacity?: string;
  inverter_type?: string;
  completed_date?: string;
  payment_method?: string;
  tax_amount?: string;
  discount_amount?: string;
  spare_battery_id?: number | null;
  spare_battery_model?: string;
  spare_battery_code?: string;
  spare_battery_manufacturer?: string;
  spare_battery_capacity?: string;
  spare_battery_type?: string;
  spare_battery_condition?: string;
  spare_battery_quantity?: number;
  use_spare_battery?: boolean;
  battery_source?: 'original' | 'spare' | 'both' | 'none';
  replacement_battery_details?: {
    id: number;
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
  } | null;
}

interface ServiceDetailModalProps {
  service: ServiceOrder;
  onClose: () => void;
  onEdit: () => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPaymentStatusColor: (status: string) => string;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onEdit,
  getStatusColor,
  getPriorityColor,
  getPaymentStatusColor
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [replacementBatteryDetails, setReplacementBatteryDetails] = useState<any>(null);
  const [loadingReplacement, setLoadingReplacement] = useState(false);

  // Responsive detection
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

  // Fetch replacement battery details if serial exists but model is missing
  useEffect(() => {
    const fetchReplacementBattery = async () => {
      // If we already have replacement_battery_model from props, use it
      if (service.replacement_battery_model) {
        setReplacementBatteryDetails({
          battery_model: service.replacement_battery_model,
          battery_serial: service.replacement_battery_serial,
          brand: service.replacement_battery_brand,
          capacity: service.replacement_battery_capacity,
          battery_type: service.replacement_battery_type,
          voltage: service.replacement_battery_voltage,
          price: service.replacement_battery_price,
          warranty_period: service.replacement_battery_warranty,
          installation_date: service.replacement_installation_date,
          notes: service.replacement_battery_notes
        });
        return;
      }

      // If we have replacement_battery_serial but no model, fetch from API
      if (service.replacement_battery_serial && !service.replacement_battery_model) {
        setLoadingReplacement(true);
        try {
          const API_BASE_URL = "http://localhost/sun_powers/api";
          
          // First try to get by service ID
          const response = await fetch(`${API_BASE_URL}/replacement_battery.php?service_order_id=${service.id}`);
          const data = await response.json();
          
          if (data.success && data.replacement_battery) {
            setReplacementBatteryDetails(data.replacement_battery);
          }
        } catch (error) {
          console.error('Error fetching replacement battery:', error);
        } finally {
          setLoadingReplacement(false);
        }
      }
    };

    fetchReplacementBattery();
  }, [service]);

  const formatCurrency = (amount: string) => {
    if (!amount || amount === '0.00' || amount === '0') return '₹0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00') return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateBalance = () => {
    const final = parseFloat(service.final_cost || '0');
    const deposit = parseFloat(service.deposit_amount || '0');
    return formatCurrency((final - deposit).toString());
  };

  const getWarrantyColor = (status: string) => {
    const colors: Record<string, string> = {
      'in_warranty': '#10b981',
      'extended_warranty': '#f59e0b',
      'out_of_warranty': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Check if there's a spare battery
  const hasSpareBattery = service.spare_battery_id || service.use_spare_battery || service.spare_battery_model;
  
  // Check if there's a replacement battery (using fetched details or props)
  const hasReplacementBattery = !!(service.replacement_battery_serial || 
    (replacementBatteryDetails && replacementBatteryDetails.battery_serial));

  // Check if there's an original battery
  const hasOriginalBattery = service.battery_id || service.battery_model;

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Service Receipt - ${service.service_code}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: 'Arial', sans-serif; 
                padding: 20px; 
                background: #fff;
                color: #333;
                line-height: 1.6;
              }
              .receipt { 
                max-width: 500px; 
                margin: 0 auto;
                padding: 25px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background: #fff;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              }
              .header { 
                text-align: center; 
                margin-bottom: 25px;
                border-bottom: 2px solid #10b981;
                padding-bottom: 15px;
              }
              .header h2 {
                color: #10b981;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .header h3 {
                color: #1e293b;
                margin: 10px 0 5px;
                font-size: 18px;
              }
              .header p {
                color: #64748b;
                margin: 5px 0;
              }
              .section { 
                margin: 20px 0; 
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #10b981;
              }
              .battery-section {
                margin: 15px 0;
                padding: 12px;
                background: #f0f9ff;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
              }
              .spare-section {
                margin: 15px 0;
                padding: 12px;
                background: #fef3c7;
                border-radius: 8px;
                border-left: 4px solid #f59e0b;
              }
              .replacement-section {
                margin: 15px 0;
                padding: 12px;
                background: #f1f5f9;
                border-radius: 8px;
                border-left: 4px solid #8b5cf6;
              }
              .section h4 {
                color: #475569;
                margin: 0 0 12px 0;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .section p {
                margin: 8px 0;
                font-size: 14px;
                color: #334155;
              }
              .section strong {
                color: #0f172a;
                font-weight: 600;
              }
              .badge { 
                display: inline-block; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                margin: 2px 4px 2px 0;
                font-weight: 500;
              }
              .staff-info {
                background: #f0f9ff;
                border-left: 4px solid #10b981;
                padding: 15px;
                margin: 15px 0;
                border-radius: 8px;
              }
              .financial-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-top: 10px;
              }
              .financial-item {
                background: white;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
              }
              .footer {
                text-align: center;
                margin-top: 25px;
                color: #64748b;
                font-size: 12px;
                border-top: 1px dashed #e2e8f0;
                padding-top: 15px;
              }
              @media print {
                body { padding: 0; margin: 0; }
                .receipt { border: none; box-shadow: none; }
                @page { margin: 15mm; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>Sun Powers Battery Service</h2>
                <h3>Service Order Receipt</h3>
                <p><strong>Service Code:</strong> ${service.service_code}</p>
                <p><strong>Date:</strong> ${formatDateTime(service.created_at)}</p>
              </div>
              
              <div class="section">
                <h4>👤 Customer Information</h4>
                <p><strong>Name:</strong> ${service.customer_name}</p>
                <p><strong>Phone:</strong> ${service.customer_phone}</p>
                ${service.customer_email ? `<p><strong>Email:</strong> ${service.customer_email}</p>` : ''}
                ${service.customer_address ? `<p><strong>Address:</strong> ${service.customer_address}</p>` : ''}
              </div>
              
              <div class="section">
                <h4>🔧 Service Details</h4>
                <p><strong>Issue:</strong> ${service.issue_description || 'No description provided'}</p>
                <div style="margin-top: 10px;">
                  <span class="badge" style="background: ${getStatusColor(service.status)}20; color: ${getStatusColor(service.status)}; border: 1px solid ${getStatusColor(service.status)}40;">
                    ${service.status.toUpperCase()}
                  </span>
                  <span class="badge" style="background: ${getPriorityColor(service.priority)}20; color: ${getPriorityColor(service.priority)}; border: 1px solid ${getPriorityColor(service.priority)}40;">
                    ${service.priority?.toUpperCase() || 'MEDIUM'}
                  </span>
                  <span class="badge" style="background: ${getPaymentStatusColor(service.payment_status)}20; color: ${getPaymentStatusColor(service.payment_status)}; border: 1px solid ${getPaymentStatusColor(service.payment_status)}40;">
                    ${service.payment_status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              
              ${service.service_staff_name ? `
              <div class="staff-info">
                <h4 style="margin: 0 0 8px 0; color: #0f172a;">👥 Service Staff</h4>
                <p><strong>Name:</strong> ${service.service_staff_name}</p>
                ${service.service_staff_id ? `<p><strong>Staff ID:</strong> ${service.service_staff_id}</p>` : ''}
              </div>
              ` : ''}
              
              ${hasOriginalBattery ? `
              <div class="battery-section">
                <h4 style="color: #2563eb;">🔋 Selected Original Battery</h4>
                <p><strong>Model:</strong> ${service.battery_model || 'N/A'}</p>
                ${service.battery_serial ? `<p><strong>Serial:</strong> ${service.battery_serial}</p>` : ''}
                ${service.battery_brand ? `<p><strong>Brand:</strong> ${service.battery_brand}</p>` : ''}
                ${service.battery_capacity ? `<p><strong>Capacity:</strong> ${service.battery_capacity}</p>` : ''}
                ${service.battery_type ? `<p><strong>Type:</strong> ${service.battery_type.replace(/_/g, ' ').toUpperCase()}</p>` : ''}
                ${service.battery_purchase_date ? `<p><strong>Purchase Date:</strong> ${formatDate(service.battery_purchase_date)}</p>` : ''}
                ${service.battery_warranty_period ? `<p><strong>Warranty:</strong> ${service.battery_warranty_period}</p>` : ''}
              </div>
              ` : ''}
              
              ${hasSpareBattery ? `
              <div class="spare-section">
                <h4 style="color: #d97706;">📦 Selected from Spare Inventory</h4>
                <p><strong>Model:</strong> ${service.spare_battery_model || 'N/A'}</p>
                ${service.spare_battery_code ? `<p><strong>Code:</strong> ${service.spare_battery_code}</p>` : ''}
                ${service.spare_battery_manufacturer ? `<p><strong>Manufacturer:</strong> ${service.spare_battery_manufacturer}</p>` : ''}
                ${service.spare_battery_capacity ? `<p><strong>Capacity:</strong> ${service.spare_battery_capacity}</p>` : ''}
                ${service.spare_battery_type ? `<p><strong>Type:</strong> ${service.spare_battery_type.replace(/_/g, ' ').toUpperCase()}</p>` : ''}
                ${service.spare_battery_condition ? `<p><strong>Condition:</strong> ${service.spare_battery_condition}</p>` : ''}
                <p style="color: #059669; margin-top: 8px;"><strong>✓ This battery will be removed from spare inventory</strong></p>
              </div>
              ` : ''}
              
              ${hasReplacementBattery && !hasSpareBattery ? `
              <div class="replacement-section">
                <h4 style="color: #7c3aed;">⚡ Replacement Battery</h4>
                <p><strong>Model:</strong> ${replacementBatteryDetails?.battery_model || service.replacement_battery_model || 'N/A'}</p>
                <p><strong>Serial:</strong> ${replacementBatteryDetails?.battery_serial || service.replacement_battery_serial || 'N/A'}</p>
                ${(replacementBatteryDetails?.brand || service.replacement_battery_brand) ? `<p><strong>Brand:</strong> ${replacementBatteryDetails?.brand || service.replacement_battery_brand}</p>` : ''}
                ${(replacementBatteryDetails?.capacity || service.replacement_battery_capacity) ? `<p><strong>Capacity:</strong> ${replacementBatteryDetails?.capacity || service.replacement_battery_capacity}</p>` : ''}
                ${(replacementBatteryDetails?.voltage) ? `<p><strong>Voltage:</strong> ${replacementBatteryDetails?.voltage}</p>` : ''}
                ${(replacementBatteryDetails?.battery_type || service.replacement_battery_type) ? `<p><strong>Type:</strong> ${(replacementBatteryDetails?.battery_type || service.replacement_battery_type || '').replace(/_/g, ' ').toUpperCase()}</p>` : ''}
                ${(replacementBatteryDetails?.price) ? `<p><strong>Price:</strong> ${formatCurrency(replacementBatteryDetails.price.toString())}</p>` : ''}
                ${(replacementBatteryDetails?.warranty_period) ? `<p><strong>Warranty Period:</strong> ${replacementBatteryDetails?.warranty_period}</p>` : ''}
                ${(replacementBatteryDetails?.installation_date) ? `<p><strong>Installation Date:</strong> ${formatDate(replacementBatteryDetails?.installation_date)}</p>` : ''}
                ${(replacementBatteryDetails?.notes) ? `<p><strong>Notes:</strong> ${replacementBatteryDetails?.notes}</p>` : ''}
              </div>
              ` : ''}
              
              ${service.inverter_model ? `
              <div class="section">
                <h4>⚡ Inverter Details</h4>
                <p><strong>Model:</strong> ${service.inverter_model}</p>
                ${service.inverter_serial ? `<p><strong>Serial:</strong> ${service.inverter_serial}</p>` : ''}
                ${service.inverter_brand ? `<p><strong>Brand:</strong> ${service.inverter_brand}</p>` : ''}
                ${service.inverter_capacity ? `<p><strong>Capacity:</strong> ${service.inverter_capacity}</p>` : ''}
                ${service.inverter_type ? `<p><strong>Type:</strong> ${service.inverter_type.replace(/_/g, ' ').toUpperCase()}</p>` : ''}
              </div>
              ` : ''}
              
              <div class="section">
                <h4>📊 Warranty Information</h4>
                <p><strong>Warranty Status:</strong> 
                  <span style="color: ${getWarrantyColor(service.warranty_status)}; font-weight: 600;">
                    ${service.warranty_status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                  </span>
                </p>
                <p><strong>AMC Status:</strong> ${service.amc_status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</p>
              </div>
              
              <div class="section">
                <h4>💰 Financial Details</h4>
                <div class="financial-grid">
                  <div class="financial-item">
                    <span style="display: block; color: #64748b; font-size: 11px;">Estimated</span>
                    <span style="font-size: 16px; font-weight: 600; color: #f59e0b;">${formatCurrency(service.estimated_cost)}</span>
                  </div>
                  <div class="financial-item">
                    <span style="display: block; color: #64748b; font-size: 11px;">Final</span>
                    <span style="font-size: 16px; font-weight: 600; color: #10b981;">${formatCurrency(service.final_cost)}</span>
                  </div>
                  <div class="financial-item">
                    <span style="display: block; color: #64748b; font-size: 11px;">Deposit</span>
                    <span style="font-size: 16px; font-weight: 600; color: #3b82f6;">${formatCurrency(service.deposit_amount || '0')}</span>
                  </div>
                  <div class="financial-item">
                    <span style="display: block; color: #64748b; font-size: 11px;">Balance</span>
                    <span style="font-size: 16px; font-weight: 600; color: #ef4444;">${calculateBalance()}</span>
                  </div>
                </div>
                ${service.payment_method ? `<p style="margin-top: 10px;"><strong>Payment Method:</strong> ${service.payment_method}</p>` : ''}
              </div>
              
              <div class="section">
                <h4>📅 Dates</h4>
                <p><strong>Created:</strong> ${formatDateTime(service.created_at)}</p>
                <p><strong>Est. Completion:</strong> ${formatDate(service.estimated_completion_date)}</p>
                ${service.completed_date ? `<p><strong>Completed:</strong> ${formatDate(service.completed_date)}</p>` : ''}
              </div>
              
              ${service.notes ? `
              <div class="section">
                <h4>📝 Additional Notes</h4>
                <p style="white-space: pre-line; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${service.notes}</p>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>Thank you for choosing Sun Powers Battery Service</p>
                <p>For queries: +91 9876543210 | support@sunpowers.com</p>
                <p style="margin-top: 10px; font-style: italic; color: #94a3b8;">This is a computer generated receipt</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div 
        className="modal-content order-detail-modal"
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          width: isMobile ? '100%' : '90%',
          maxWidth: isMobile ? '100%' : '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          margin: isMobile ? 0 : '0 auto'
        }}
      >
        <div className="modal-header" style={{
          padding: isMobile ? '16px 20px' : '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div className="modal-title">
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#0f172a' }}>
              Service Order Details
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>
              Service Code: {service.service_code}
            </p>
            <div className="modal-subtitle" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <span className="status-badge" style={{ 
                display: 'inline-block',
                padding: isMobile ? '3px 8px' : '4px 12px',
                borderRadius: '20px',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 500,
                backgroundColor: getStatusColor(service.status) + '20',
                color: getStatusColor(service.status),
                marginRight: '8px',
                border: `1px solid ${getStatusColor(service.status)}40`
              }}>
                {service.status.toUpperCase()}
              </span>
              <span className="priority-badge" style={{ 
                display: 'inline-block',
                padding: isMobile ? '3px 8px' : '4px 12px',
                borderRadius: '20px',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 500,
                backgroundColor: getPriorityColor(service.priority) + '20',
                color: getPriorityColor(service.priority),
                border: `1px solid ${getPriorityColor(service.priority)}40`
              }}>
                {service.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </div>
          </div>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: isMobile ? '20px' : '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: isMobile ? '4px' : '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={isMobile ? 20 : 24} />
          </motion.button>
        </div>
        
        <div className="order-detail-content" style={{
          padding: isMobile ? '16px' : '24px',
          overflowY: 'auto',
          maxHeight: isMobile ? 'calc(90vh - 70px)' : 'calc(90vh - 140px)',
          WebkitOverflowScrolling: 'touch'
        }}>
          {loadingReplacement && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner" style={{
                width: '30px',
                height: '30px',
                border: '3px solid #f3f3f3',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              <p>Loading replacement battery details...</p>
            </div>
          )}
          
          <div className="order-detail-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'),
            gap: isMobile ? '16px' : '20px'
          }}>
            {/* Customer Information */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiUser color="#10b981" size={isMobile ? 16 : 18} /> Customer Information
              </h3>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Name:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_name}</span>
              </div>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Phone:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_phone}</span>
              </div>
              {service.customer_email && (
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Email:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_email}</span>
                </div>
              )}
              {service.customer_address && (
                <div className="detail-item">
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Address:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_address}</span>
                </div>
              )}
            </div>
            
            {/* Service Staff */}
            {service.service_staff_name && (
              <div className="detail-section" style={{
                background: '#f0f9ff',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiUsers color="#10b981" size={isMobile ? 16 : 18} /> Service Staff Details
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Name:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 600, color: '#0369a1', fontSize: isMobile ? '13px' : '14px' }}>{service.service_staff_name}</span>
                </div>
                {service.service_staff_id && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Staff ID:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.service_staff_id}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selected Original Battery */}
            {hasOriginalBattery && (
              <div className="detail-section" style={{
                background: '#eff6ff',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBattery color="#2563eb" size={isMobile ? 16 : 18} /> Selected Original Battery
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_model || 'N/A'}</span>
                </div>
                {service.battery_serial && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Serial:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_serial}</span>
                  </div>
                )}
                {service.battery_brand && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_brand}</span>
                  </div>
                )}
                {service.battery_capacity && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_capacity}</span>
                  </div>
                )}
                {service.battery_type && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selected from Spare Inventory */}
            {hasSpareBattery && (
              <div className="detail-section" style={{
                background: '#fef3c7',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #fde68a',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiPackage color="#d97706" size={isMobile ? 16 : 18} /> Selected from Spare Inventory
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_model || 'N/A'}</span>
                </div>
                {service.spare_battery_code && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Code:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_code}</span>
                  </div>
                )}
                {service.spare_battery_manufacturer && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Manufacturer:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_manufacturer}</span>
                  </div>
                )}
                {service.spare_battery_capacity && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_capacity}</span>
                  </div>
                )}
                {service.spare_battery_type && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                )}
                {service.spare_battery_condition && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Condition:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_condition}</span>
                  </div>
                )}
                {service.spare_battery_quantity !== undefined && (
                  <div style={{ marginTop: '10px', padding: '6px 10px', background: '#05966920', borderRadius: '6px', border: '1px solid #05966940' }}>
                    <span style={{ color: '#059669', fontSize: isMobile ? '12px' : '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiCheckCircle size={14} /> Quantity left in stock: {service.spare_battery_quantity}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Replacement Battery - Fixed to show all data */}
            {hasReplacementBattery && !hasSpareBattery && (
              <div className="detail-section" style={{
                background: '#f1f5f9',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#4c1d95',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBatteryCharging color="#7c3aed" size={isMobile ? 16 : 18} /> Replacement Battery
                </h3>
                
                {/* Model - Using fetched details or props */}
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {replacementBatteryDetails?.battery_model || service.replacement_battery_model || 'N/A'}
                  </span>
                </div>
                
                {/* Serial Number */}
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Serial:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {replacementBatteryDetails?.battery_serial || service.replacement_battery_serial || 'N/A'}
                  </span>
                </div>
                
                {/* Brand */}
                {(replacementBatteryDetails?.brand || service.replacement_battery_brand) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails?.brand || service.replacement_battery_brand}
                    </span>
                  </div>
                )}
                
                {/* Capacity */}
                {(replacementBatteryDetails?.capacity || service.replacement_battery_capacity) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails?.capacity || service.replacement_battery_capacity}
                    </span>
                  </div>
                )}
                
                {/* Voltage */}
                {replacementBatteryDetails?.voltage && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Voltage:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails.voltage}
                    </span>
                  </div>
                )}
                
                {/* Battery Type */}
                {(replacementBatteryDetails?.battery_type || service.replacement_battery_type) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {(replacementBatteryDetails?.battery_type || service.replacement_battery_type || '').replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Price */}
                {replacementBatteryDetails?.price && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Price:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {formatCurrency(replacementBatteryDetails.price.toString())}
                    </span>
                  </div>
                )}
                
                {/* Warranty Period */}
                {replacementBatteryDetails?.warranty_period && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Warranty:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails.warranty_period}
                    </span>
                  </div>
                )}
                
                {/* Installation Date */}
                {replacementBatteryDetails?.installation_date && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Installation Date:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {formatDate(replacementBatteryDetails.installation_date)}
                    </span>
                  </div>
                )}
                
                {/* Notes */}
                {replacementBatteryDetails?.notes && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px', display: 'block', marginBottom: '4px' }}>Notes:</span>
                    <span className="detail-value" style={{ 
                      background: 'white',
                      padding: isMobile ? '8px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'block',
                      color: '#0f172a',
                      fontSize: isMobile ? '12px' : '13px'
                    }}>
                      {replacementBatteryDetails.notes}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Inverter Information */}
            {service.inverter_model && (
              <div className="detail-section" style={{
                background: '#f8fafc',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiPower color="#10b981" size={isMobile ? 16 : 18} /> Inverter Information
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_model}</span>
                </div>
                {service.inverter_serial && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Serial:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_serial}</span>
                  </div>
                )}
                {service.inverter_brand && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_brand}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Service Details - Full Width */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              gridColumn: isMobile ? 'span 1' : 'span 2'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiInfo color="#10b981" size={isMobile ? 16 : 18} /> Service Details
              </h3>
              <div className="detail-item" style={{ marginBottom: '12px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px', display: 'block', marginBottom: '4px' }}>Issue Description:</span>
                <span className="detail-value" style={{ 
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'block',
                  color: '#0f172a',
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {service.issue_description || 'No description provided'}
                </span>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: isMobile ? '8px' : '12px' 
              }}>
                <div>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Warranty Status:</span>
                  <span className="detail-value" style={{ 
                    marginLeft: '8px', 
                    fontWeight: 500,
                    color: getWarrantyColor(service.warranty_status),
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    {service.warranty_status?.replace(/_/g, ' ').toUpperCase() || 'OUT OF WARRANTY'}
                  </span>
                </div>
                <div>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>AMC Status:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {service.amc_status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Financial Details - Full Width */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              gridColumn: isMobile ? 'span 1' : 'span 2'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiDollarSign color="#10b981" size={isMobile ? 16 : 18} /> Financial Details
              </h3>
              <div className="financial-details" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
                gap: isMobile ? '10px' : '16px'
              }}>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Estimated Cost</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(service.estimated_cost)}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Final Cost</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#10b981' }}>{formatCurrency(service.final_cost)}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Deposit</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#3b82f6' }}>{formatCurrency(service.deposit_amount || '0')}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Balance</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#ef4444' }}>{calculateBalance()}</span>
                </div>
              </div>
              {service.payment_method && (
                <div style={{ marginTop: '12px', padding: isMobile ? '6px 10px' : '8px 12px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Payment Method:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.payment_method}</span>
                </div>
              )}
            </div>
            
            {/* Dates */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiCalendar color="#10b981" size={isMobile ? 16 : 18} /> Dates
              </h3>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Created:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDateTime(service.created_at)}</span>
              </div>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Est. Completion:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDate(service.estimated_completion_date)}</span>
              </div>
              {service.completed_date && (
                <div className="detail-item">
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Completed:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDate(service.completed_date)}</span>
                </div>
              )}
            </div>
            
            {/* Additional Notes */}
            {service.notes && (
              <div className="detail-section" style={{
                background: '#f8fafc',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                gridColumn: isMobile ? 'span 1' : 'span 2'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiFileText color="#10b981" size={isMobile ? 16 : 18} /> Additional Notes
                </h3>
                <div className="detail-item full-width">
                  <span className="detail-value" style={{
                    background: 'white',
                    padding: isMobile ? '10px' : '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'block',
                    color: '#0f172a',
                    whiteSpace: 'pre-line',
                    fontSize: isMobile ? '13px' : '14px'
                  }}>{service.notes}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="order-detail-actions" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'flex-end',
            gap: isMobile ? '10px' : '12px',
            marginTop: isMobile ? '20px' : '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <motion.button 
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#64748b',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Close
            </motion.button>
            <motion.button 
              className="btn primary"
              onClick={onEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <FiEdit size={isMobile ? 16 : 18} /> Edit
            </motion.button>
            <motion.button 
              className="btn secondary"
              onClick={printReceipt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <FiPrinter size={isMobile ? 16 : 18} /> Print
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceDetailModal;