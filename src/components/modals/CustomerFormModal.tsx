import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiSave } from "react-icons/fi";

interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  created_at: string;
}

interface CustomerFormModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (customerData: any, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  customer,
  onClose,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  
  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        zip_code: customer.zip_code || "",
        notes: customer.notes || ""
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        notes: ""
      });
    }
  }, [customer]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create the customer data object
    const customerData = new FormData();
    
    // Add fields to FormData
    customerData.append('full_name', formData.full_name.trim());
    customerData.append('phone', formData.phone.trim());
    
    if (formData.email) {
      customerData.append('email', formData.email.trim());
    }
    if (formData.address) {
      customerData.append('address', formData.address.trim());
    }
    if (formData.city) {
      customerData.append('city', formData.city.trim());
    }
    if (formData.state) {
      customerData.append('state', formData.state.trim());
    }
    if (formData.zip_code) {
      customerData.append('zip_code', formData.zip_code.trim());
    }
    if (formData.notes) {
      customerData.append('notes', formData.notes.trim());
    }
    
    // If editing, add the ID
    if (customer) {
      customerData.append('id', customer.id.toString());
    }
    
    await onSave(customerData, !!customer);
  };
  
  // Styles for responsive modal content
  const modalContentStyle = {
    maxWidth: isMobile ? "95%" : isTablet ? "80%" : "600px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    margin: isMobile ? "10px" : "0",
    width: "100%"
  };
  
  // Styles for form grid
  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: isMobile ? "12px" : "16px"
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
          ...modalContentStyle,
          backgroundColor: "white",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          animation: isMobile ? "slideUp 0.3s ease-out" : "none"
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
            }
            
            @media (min-width: 768px) and (max-width: 1023px) {
              .modal-content {
                max-width: 80% !important;
              }
            }
            
            @media (min-width: 1024px) {
              .modal-content {
                max-width: 600px !important;
              }
            }
          `}
        </style>
        
        <div className="modal-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "16px" : "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          position: isMobile ? "sticky" : "static",
          top: 0,
          backgroundColor: "white",
          zIndex: 10,
          borderRadius: isMobile ? "16px 16px 0 0" : "16px 16px 0 0"
        }}>
          <div className="modal-title">
            <h2 style={{ 
              fontSize: isMobile ? "1.25rem" : "1.5rem", 
              fontWeight: "600", 
              margin: "0 0 4px 0",
              color: "#1f2937"
            }}>
              {customer ? "Edit Client" : "New Client"}
            </h2>
            <p style={{ 
              fontSize: isMobile ? "0.75rem" : "0.875rem", 
              color: "#6b7280", 
              margin: 0 
            }}>
              {customer ? "Update client information" : "Add a new client to the system"}
            </p>
          </div>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? "20px" : "24px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "8px" : "4px"
            }}
          >
            <FiX />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit} className="service-form" style={{
          padding: isMobile ? "16px" : "24px"
        }}>
          <div className="form-grid" style={formGridStyle}>
            <div className="form-group full-width" style={{ 
              gridColumn: isMobile ? "1" : "span 2"
            }}>
              <label htmlFor="full_name" style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px"
              }}>
                <FiUser size={isMobile ? 14 : 16} /> Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter client full name"
                required
                className={errors.full_name ? "error" : ""}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: `1px solid ${errors.full_name ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
              {errors.full_name && (
                <span className="error-message" style={{
                  color: "#ef4444",
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  marginTop: "4px",
                  display: "block"
                }}>
                  {errors.full_name}
                </span>
              )}
            </div>

            <div className="form-group" style={{
              gridColumn: isMobile ? "1" : "auto"
            }}>
              <label htmlFor="phone" style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px"
              }}>
                <FiPhone size={isMobile ? 14 : 16} /> Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit phone number"
                required
                className={errors.phone ? "error" : ""}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: `1px solid ${errors.phone ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
              {errors.phone && (
                <span className="error-message" style={{
                  color: "#ef4444",
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  marginTop: "4px",
                  display: "block"
                }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-group" style={{
              gridColumn: isMobile ? "1" : "auto"
            }}>
              <label htmlFor="email" style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px"
              }}>
                <FiMail size={isMobile ? 14 : 16} /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={errors.email ? "error" : ""}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: `1px solid ${errors.email ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
              {errors.email && (
                <span className="error-message" style={{
                  color: "#ef4444",
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  marginTop: "4px",
                  display: "block"
                }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group" style={{
              gridColumn: isMobile ? "1" : "auto"
            }}>
              <label htmlFor="city" style={{
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px",
                display: "block"
              }}>
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <div className="form-group" style={{
              gridColumn: isMobile ? "1" : "auto"
            }}>
              <label htmlFor="state" style={{
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px",
                display: "block"
              }}>
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <div className="form-group" style={{
              gridColumn: isMobile ? "1" : "auto"
            }}>
              <label htmlFor="zip_code" style={{
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px",
                display: "block"
              }}>
                Zip Code
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                placeholder="Enter zip code"
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <div className="form-group full-width" style={{ 
              gridColumn: isMobile ? "1" : "span 2"
            }}>
              <label htmlFor="address" style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px"
              }}>
                <FiMapPin size={isMobile ? 14 : 16} /> Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows={isMobile ? 2 : 3}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div className="form-group full-width" style={{ 
              gridColumn: isMobile ? "1" : "span 2"
            }}>
              <label htmlFor="notes" style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "4px"
              }}>
                <FiFileText size={isMobile ? 14 : 16} /> Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any notes about the client..."
                rows={isMobile ? 2 : 3}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>

          <div className="form-actions" style={{
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            justifyContent: "flex-end",
            gap: isMobile ? "12px" : "16px",
            marginTop: isMobile ? "20px" : "24px",
            paddingTop: isMobile ? "16px" : "0",
            borderTop: isMobile ? "1px solid #e2e8f0" : "none"
          }}>
            <motion.button
              type="button"
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              style={{
                flex: isMobile ? "1" : "none",
                padding: isMobile ? "12px" : "10px 20px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: isMobile ? "1rem" : "0.875rem",
                fontWeight: "500",
                color: "#4b5563",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
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
                flex: isMobile ? "1" : "none",
                padding: isMobile ? "12px" : "10px 20px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                fontSize: isMobile ? "1rem" : "0.875rem",
                fontWeight: "500",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FiSave size={isMobile ? 18 : 16} />
              {customer ? 'Update Client' : 'Create Client'}
              {loading && '...'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CustomerFormModal;