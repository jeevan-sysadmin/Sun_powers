// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiSave,
  FiBattery,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiInfo,
  FiShoppingBag,
  FiBriefcase,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiTool,
  FiClock,
  FiTag,
  FiHome
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
  battery_condition: string;
  status: string;
  claim_type: string;
  is_spare: boolean | number | string;
  specifications?: string;
  purchase_date?: string;
  installation_date?: string;
  last_service_date?: string;
}

interface ProductFormModalProps {
  battery: Battery | null;
  onClose: () => void;
  onSave: (batteryData: any, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  battery,
  onClose,
  onSave,
  loading
}) => {
  const isEdit = !!battery;
  
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
  
  const [formData, setFormData] = useState({
    battery_model: "",
    battery_serial: "",
    brand: "",
    capacity: "",
    voltage: "12V",
    battery_type: "lead_acid",
    category: "inverter",
    claim_type: "shop",
    status: "active",
    price: "",
    warranty_period: "1 year",
    amc_period: "0",
    battery_condition: "good",
    is_spare: false,
    specifications: "",
    purchase_date: "",
    installation_date: "",
    last_service_date: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (battery) {
      console.log("📋 Editing battery data:", battery);
      
      // Convert is_spare from backend format
      let isSpare = false;
      if (battery.is_spare === true) {
        isSpare = true;
      } else if (battery.is_spare === 1) {
        isSpare = true;
      } else if (battery.is_spare === '1') {
        isSpare = true;
      } else if (battery.is_spare === 'true') {
        isSpare = true;
      }
      
      console.log("📋 Converted is_spare:", isSpare);
      
      setFormData({
        battery_model: battery.battery_model || "",
        battery_serial: battery.battery_serial || "",
        brand: battery.brand || "",
        capacity: battery.capacity || "",
        voltage: battery.voltage || "12V",
        battery_type: battery.battery_type || "lead_acid",
        category: battery.category || "inverter",
        claim_type: battery.claim_type || "shop",
        status: battery.status || "active",
        price: typeof battery.price === 'number' ? battery.price.toString() : (battery.price || "0"),
        warranty_period: battery.warranty_period || "1 year",
        amc_period: battery.amc_period || "0",
        battery_condition: battery.battery_condition || "good",
        is_spare: isSpare,
        specifications: battery.specifications || "",
        purchase_date: battery.purchase_date || "",
        installation_date: battery.installation_date || "",
        last_service_date: battery.last_service_date || ""
      });
    } else {
      // Reset form for new battery
      setFormData({
        battery_model: "",
        battery_serial: "",
        brand: "",
        capacity: "",
        voltage: "12V",
        battery_type: "lead_acid",
        category: "inverter",
        claim_type: "shop",
        status: "active",
        price: "",
        warranty_period: "1 year",
        amc_period: "0",
        battery_condition: "good",
        is_spare: false,
        specifications: "",
        purchase_date: "",
        installation_date: "",
        last_service_date: ""
      });
    }
  }, [battery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      console.log(`Checkbox ${name} changed to: ${checked}`);
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log(`Checkbox ${name} changed to: ${checked}`);
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Only battery_model is required now
    if (!formData.battery_model.trim()) {
      newErrors.battery_model = "Battery model is required";
    }
    
    // Remove validation for serial number and brand
    
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Form submission started");
    console.log("📝 Form data before submit:", formData);
    console.log("✅ Form validation check...");
    
    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors);
      return;
    }
    
    // Prepare battery data
    const batteryData: any = {
      battery_model: formData.battery_model.trim(),
      battery_serial: formData.battery_serial.trim() || null, // Allow empty
      brand: formData.brand.trim() || null, // Allow empty
      capacity: formData.capacity || "",
      voltage: formData.voltage,
      battery_type: formData.battery_type,
      category: formData.category,
      claim_type: formData.claim_type,
      status: formData.status,
      price: formData.price || "0",
      warranty_period: formData.warranty_period,
      amc_period: formData.amc_period,
      battery_condition: formData.battery_condition,
      is_spare: formData.is_spare, // Send as boolean
      specifications: formData.specifications || "",
      purchase_date: formData.purchase_date || null,
      installation_date: formData.installation_date || null,
      last_service_date: formData.last_service_date || null
    };
    
    // Convert empty strings to null for dates
    if (batteryData.purchase_date === "") batteryData.purchase_date = null;
    if (batteryData.installation_date === "") batteryData.installation_date = null;
    if (batteryData.last_service_date === "") batteryData.last_service_date = null;
    
    if (isEdit && battery) {
      batteryData.id = battery.id;
    }
    
    console.log("📤 Sending battery data to API:", {
      ...batteryData,
      is_spare_type: typeof batteryData.is_spare,
      is_spare_value: batteryData.is_spare
    });
    
    console.log("📤 JSON stringified:", JSON.stringify(batteryData));
    
    try {
      await onSave(batteryData, isEdit);
    } catch (error) {
      console.error("❌ Error saving battery:", error);
    }
  };

  const batteryTypes = [
    { value: "lead_acid", label: "Lead Acid" },
    { value: "lithium_ion", label: "Lithium Ion" },
    { value: "gel", label: "Gel" },
    { value: "agm", label: "AGM" },
    { value: "tubular", label: "Tubular" },
    { value: "other", label: "Other" }
  ];
  
  const categories = [
    { value: "inverter", label: "Inverter Battery" },
    { value: "solar", label: "Solar Battery" },
    { value: "ups", label: "UPS Battery" },
    { value: "automotive", label: "Automotive Battery" },
    { value: "other", label: "Other" }
  ];
  
  const statusOptions = [
    { value: "active", label: "Active", icon: FiCheckCircle, description: "Battery is active and in use" },
    { value: "in_service", label: "In Service", icon: FiTool, description: "Battery is currently in service" },
    { value: "discontinued", label: "Discontinued", icon: FiX, description: "Battery model is discontinued" },
    { value: "out_of_stock", label: "Out of Stock", icon: FiPackage, description: "Battery is out of stock" },
    { value: "replaced", label: "Replaced", icon: FiBattery, description: "Battery has been replaced" }
  ];
  
  const claimTypes = [
    { value: "shop", label: "Shop", icon: FiShoppingBag, description: "Shop claim" },
    { value: "company", label: "Company", icon: FiBriefcase, description: "Company claim" },
    { value: "suntocomp", label: "Sun to Company", icon: FiArrowRight, description: "Sun Powers to Company" },
    { value: "comptosun", label: "Company to Sun", icon: FiArrowLeft, description: "Company to Sun Powers" }
  ];
  
  const voltageOptions = ["12V", "24V", "48V", "other"];
  const conditions = ["excellent", "good", "fair", "poor", "dead"];
  const warrantyPeriods = ["6 months", "1 year", "2 years", "3 years", "5 years", "other"];
  const amcPeriods = ["0", "1 year", "2 years", "3 years", "5 years"];

  // Form grid styles based on screen size
  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
    gap: isMobile ? "12px" : "16px",
    padding: isMobile ? "12px" : "16px"
  };

  // Full width fields span all columns
  const fullWidthStyle = {
    gridColumn: isMobile ? "1" : isTablet ? "1 / -1" : "1 / -1"
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
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "90%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "white",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
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
            
            .error-text {
              color: #ef4444;
              font-size: 12px;
              margin-top: 4px;
              display: block;
            }
            
            .field-description {
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
            }
            
            input.error, select.error, textarea.error {
              border-color: #ef4444 !important;
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
              {isEdit ? 'Edit Battery' : 'Add New Battery'}
            </h2>
            <p style={{ 
              fontSize: isMobile ? '0.75rem' : '0.875rem', 
              color: '#6b7280', 
              margin: 0 
            }}>
              {isEdit ? 'Update battery information' : 'Add new battery to inventory'}
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
        
        <form onSubmit={handleSubmit} style={{ padding: isMobile ? '0' : '0' }}>
          <div style={formGridStyle}>
            {/* Basic Information */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="battery_model" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiPackage size={isMobile ? 14 : 16} /> Battery Model *
              </label>
              <input
                type="text"
                id="battery_model"
                name="battery_model"
                value={formData.battery_model}
                onChange={handleChange}
                placeholder="Enter battery model"
                className={errors.battery_model ? 'error' : ''}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: `1px solid ${errors.battery_model ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.battery_model && <span className="error-text">{errors.battery_model}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="battery_serial" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiTag size={isMobile ? 14 : 16} /> Serial Number
              </label>
              <input
                type="text"
                id="battery_serial"
                name="battery_serial"
                value={formData.battery_serial}
                onChange={handleChange}
                placeholder="Enter serial number (optional)"
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="brand" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiTag size={isMobile ? 14 : 16} /> Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand name (optional)"
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Battery Status */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="status" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiCheckCircle size={isMobile ? 14 : 16} /> Battery Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="field-description">
                {statusOptions.find(status => status.value === formData.status)?.description}
              </div>
            </div>

            {/* Specifications */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="capacity" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Capacity
              </label>
              <input
                type="text"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 150AH, 200AH"
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="voltage" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Voltage
              </label>
              <select
                id="voltage"
                name="voltage"
                value={formData.voltage}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {voltageOptions.map(voltage => (
                  <option key={voltage} value={voltage}>{voltage}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="battery_type" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Battery Type
              </label>
              <select
                id="battery_type"
                name="battery_type"
                value={formData.battery_type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {batteryTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="category" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Claim Type */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="claim_type" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiBriefcase size={isMobile ? 14 : 16} /> Claim Type
              </label>
              <select
                id="claim_type"
                name="claim_type"
                value={formData.claim_type}
                onChange={handleChange}
                className="claim-type-select"
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {claimTypes.map(claim => (
                  <option key={claim.value} value={claim.value}>
                    {claim.label}
                  </option>
                ))}
              </select>
              <div className="field-description">
                {claimTypes.find(claim => claim.value === formData.claim_type)?.description}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="price" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiDollarSign size={isMobile ? 14 : 16} /> Price (₹)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                className={errors.price ? 'error' : ''}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: `1px solid ${errors.price ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="warranty_period" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Warranty Period
              </label>
              <select
                id="warranty_period"
                name="warranty_period"
                value={formData.warranty_period}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {warrantyPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="amc_period" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                AMC Period
              </label>
              <select
                id="amc_period"
                name="amc_period"
                value={formData.amc_period}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {amcPeriods.map(period => (
                  <option key={period} value={period}>
                    {period === "0" ? "No AMC" : period}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="battery_condition" style={{
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px',
                display: 'block'
              }}>
                Battery Condition
              </label>
              <select
                id="battery_condition"
                name="battery_condition"
                value={formData.battery_condition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Spare Checkbox */}
            <div className="form-group" style={{ 
              gridColumn: isMobile ? '1' : 'span 1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <input
                  type="checkbox"
                  id="is_spare"
                  name="is_spare"
                  checked={formData.is_spare}
                  onChange={handleCheckboxChange}
                  style={{
                    marginRight: '8px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="is_spare" style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '500',
                  color: formData.is_spare ? '#10B981' : '#6B7280'
                }}>
                  <FiBattery style={{ marginRight: '6px' }} />
                  Mark as spare battery
                </label>
              </div>
              <div style={{
                fontSize: '12px',
                color: formData.is_spare ? '#10B981' : '#6B7280',
                fontStyle: 'italic',
                marginLeft: '26px'
              }}>
                {formData.is_spare 
                  ? "✓ This battery is marked as a spare battery" 
                  : "This is a regular battery (not a spare)"}
              </div>
            </div>

            {/* Dates */}
            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="purchase_date" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiCalendar size={isMobile ? 14 : 16} /> Purchase Date
              </label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="installation_date" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiCalendar size={isMobile ? 14 : 16} /> Installation Date
              </label>
              <input
                type="date"
                id="installation_date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="last_service_date" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiCalendar size={isMobile ? 14 : 16} /> Last Service Date
              </label>
              <input
                type="date"
                id="last_service_date"
                name="last_service_date"
                value={formData.last_service_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Specifications - Full Width */}
            <div className="form-group" style={fullWidthStyle}>
              <label htmlFor="specifications" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '4px'
              }}>
                <FiInfo size={isMobile ? 14 : 16} /> Specifications
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                placeholder="Enter battery specifications..."
                rows={isMobile ? 2 : 3}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'flex-end',
            gap: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '20px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            position: isMobile ? 'sticky' : 'static',
            bottom: 0,
            zIndex: 10
          }}>
            <motion.button
              type="button"
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '12px' : '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                cursor: 'pointer'
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '12px' : '10px 20px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FiSave size={isMobile ? 18 : 16} />
              {isEdit ? 'Update Battery' : 'Add Battery'}
              {loading && '...'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductFormModal;
