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
  const [serialInput, setSerialInput] = useState("");
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

  const normalizeSerial = (value: string) => value.trim();

  const addSerial = (rawValue: string): boolean => {
    const normalized = normalizeSerial(rawValue);
    if (!normalized) return false;

    let wasAdded = false;
    setSerialNumbers(prev => {
      const exists = prev.some(
        serial => serial.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) {
        return prev;
      }
      wasAdded = true;
      return [...prev, normalized];
    });

    if (!wasAdded) {
      setErrors(prev => ({ ...prev, battery_serial: "Serial already added" }));
      return false;
    }

    setErrors(prev => ({ ...prev, battery_serial: "" }));
    return true;
  };

  const addSerialsFromText = (text: string) => {
    const tokens = text
      .split(/[\s,;]+/)
      .map(token => normalizeSerial(token))
      .filter(Boolean);

    if (tokens.length === 0) return;

    setSerialNumbers(prev => {
      const existing = new Set(prev.map(serial => serial.toLowerCase()));
      const next = [...prev];

      for (const token of tokens) {
        const key = token.toLowerCase();
        if (!existing.has(key)) {
          existing.add(key);
          next.push(token);
        }
      }

      return next;
    });
    setErrors(prev => ({ ...prev, battery_serial: "" }));
  };

  const addSerialInputValue = (value: string) => {
    if (!value.trim()) return false;
    if (/[\s,;]/.test(value)) {
      addSerialsFromText(value);
      return true;
    }
    return addSerial(value);
  };

  const handleSerialInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === 'Tab') {
      e.preventDefault();
      if (addSerialInputValue(serialInput)) {
        setSerialInput("");
      }
    }
  };

  const handleSerialInputBlur = () => {
    if (serialInput.trim()) {
      if (addSerialInputValue(serialInput)) {
        setSerialInput("");
      }
    }
  };

  const handleSerialPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (/[\s,;]/.test(pastedText)) {
      e.preventDefault();
      addSerialsFromText(pastedText);
      setSerialInput("");
    }
  };

  const removeSerial = (serialToRemove: string) => {
    setSerialNumbers(prev => prev.filter(serial => serial !== serialToRemove));
  };

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
      setSerialNumbers(battery.battery_serial ? [battery.battery_serial] : []);
      setSerialInput("");
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
      setSerialNumbers([]);
      setSerialInput("");
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

  const validateForm = (
    serialNumbersOverride?: string[],
    pendingSerialInputOverride?: string
  ): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Only battery_model is required now
    if (!formData.battery_model.trim()) {
      newErrors.battery_model = "Battery model is required";
    }
    
    // Remove validation for serial number and brand
    
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (!isEdit) {
      const effectiveSerials = serialNumbersOverride ?? serialNumbers;
      const pendingInput = pendingSerialInputOverride ?? serialInput;
      const hasPendingInput = !!normalizeSerial(pendingInput);
      if (effectiveSerials.length === 0 && !hasPendingInput) {
        newErrors.battery_serial = "Add at least one serial number";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPendingInput = normalizeSerial(serialInput);
    let mergedSerials = [...serialNumbers];
    if (!isEdit && normalizedPendingInput) {
      const pendingTokens = /[\s,;]/.test(serialInput)
        ? serialInput
            .split(/[\s,;]+/)
            .map(token => normalizeSerial(token))
            .filter(Boolean)
        : [normalizedPendingInput];

      const existing = new Set(mergedSerials.map(serial => serial.toLowerCase()));
      for (const token of pendingTokens) {
        const key = token.toLowerCase();
        if (!existing.has(key)) {
          existing.add(key);
          mergedSerials.push(token);
        }
      }
    }

    if (normalizedPendingInput) {
      setSerialInput("");
    }
    setSerialNumbers(mergedSerials);

    if (!validateForm(mergedSerials, "")) {
      return;
    }

    const batteryData: any = {
      battery_model: formData.battery_model.trim(),
      battery_serial: isEdit
        ? (formData.battery_serial.trim() || null)
        : (mergedSerials[0] || null),
      serial_numbers: isEdit ? undefined : mergedSerials,
      brand: formData.brand.trim() || null,
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
      is_spare: formData.is_spare,
      specifications: formData.specifications || "",
      purchase_date: formData.purchase_date || null,
      installation_date: formData.installation_date || null,
      last_service_date: formData.last_service_date || null
    };

    if (batteryData.purchase_date === "") batteryData.purchase_date = null;
    if (batteryData.installation_date === "") batteryData.installation_date = null;
    if (batteryData.last_service_date === "") batteryData.last_service_date = null;

    if (isEdit && battery) {
      batteryData.id = battery.id;
    }

    try {
      await onSave(batteryData, isEdit);
    } catch (error) {
      console.error("Error saving battery:", error);
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
        backgroundColor: "rgba(2, 6, 23, 0.64)",
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
          maxWidth: "1080px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #f7fbff 0%, #ffffff 22%)",
          borderRadius: isMobile ? "18px 18px 0 0" : "18px",
          border: "1px solid #dbeafe",
          boxShadow: "0 28px 48px rgba(15, 23, 42, 0.22)"
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
                border-radius: 18px 18px 0 0 !important;
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

            .modal-content input,
            .modal-content select,
            .modal-content textarea {
              border-color: #cbd5e1 !important;
              border-radius: 10px !important;
              transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }

            .modal-content input:focus,
            .modal-content select:focus,
            .modal-content textarea:focus {
              border-color: #0f6fff !important;
              box-shadow: 0 0 0 3px rgba(15, 111, 255, 0.14);
            }
          `}
        </style>
        
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 24px',
          borderBottom: '1px solid #bfdbfe',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          background: 'linear-gradient(120deg, #0f6fff 0%, #0284c7 55%, #38bdf8 100%)',
          zIndex: 10,
          borderRadius: isMobile ? '18px 18px 0 0' : '18px 18px 0 0'
        }}>
          <div className="modal-title">
            <h2 style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '1.2rem' : '1.5rem', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              color: '#f8fafc'
            }}>
              <FiBattery size={isMobile ? 20 : 24} />
              {isEdit ? 'Edit Battery' : 'Add Battery'}
            </h2>
            <p style={{ 
              fontSize: isMobile ? '0.75rem' : '0.875rem', 
              color: '#dbeafe', 
              margin: 0 
            }}>
              {isEdit ? 'Update battery information' : 'Add one or many batteries with serial bubbles'}
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
              color: '#e2e8f0',
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
              {isEdit ? (
                <>
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
                    placeholder="Enter serial number"
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
                </>
              ) : (
                <>
                  <label htmlFor="multi_battery_serial" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    fontWeight: '500',
                    color: '#4b5563',
                    marginBottom: '4px'
                  }}>
                    <FiTag size={isMobile ? 14 : 16} /> Serial Numbers *
                  </label>

                  <div style={{
                    border: `1px solid ${errors.battery_serial ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    padding: '8px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        id="multi_battery_serial"
                        value={serialInput}
                        onChange={(e) => {
                          setSerialInput(e.target.value);
                          if (errors.battery_serial) {
                            setErrors(prev => ({ ...prev, battery_serial: '' }));
                          }
                        }}
                        onKeyDown={handleSerialInputKeyDown}
                        onBlur={handleSerialInputBlur}
                        onPaste={handleSerialPaste}
                        placeholder="Type serial and press Enter (or paste many)"
                        style={{
                          width: '100%',
                          padding: isMobile ? '10px' : '12px',
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          outline: 'none',
                          background: '#fff'
                        }}
                      />
                    </div>

                    {serialNumbers.length > 0 && (
                      <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {serialNumbers.map(serial => (
                          <span
                            key={serial}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 10px',
                              borderRadius: '999px',
                              background: '#e0f2fe',
                              color: '#0f172a',
                              fontSize: '12px',
                              border: '1px solid #bae6fd'
                            }}
                          >
                            {serial}
                            <button
                              type="button"
                              onClick={() => removeSerial(serial)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                              }}
                              aria-label={`Remove ${serial}`}
                            >
                              <FiX size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="field-description">
                    Scanner auto-adds after a short pause. Space/comma/new line starts a new serial number. Added: {serialNumbers.length}
                  </div>
                </>
              )}
              {errors.battery_serial && <span className="error-text">{errors.battery_serial}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: isMobile ? '1' : 'span 1' }}>
              <label htmlFor="brand"  style={{
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
            borderTop: '1px solid #dbeafe',
            background: 'linear-gradient(180deg, #f8fbff, #eef6ff)',
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
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '600',
                color: '#334155',
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
                background: 'linear-gradient(120deg, #0f6fff, #0284c7)',
                border: 'none',
                borderRadius: '10px',
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '700',
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
              {isEdit ? 'Update Battery' : (serialNumbers.length > 1 ? `Add ${serialNumbers.length} Batteries` : 'Add Battery')}
              {loading && '...'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductFormModal;


