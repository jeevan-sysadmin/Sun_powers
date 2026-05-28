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

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
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

    const customerData = new FormData();
    customerData.append("full_name", formData.full_name.trim());
    customerData.append("phone", formData.phone.trim());

    if (formData.email) customerData.append("email", formData.email.trim());
    if (formData.address) customerData.append("address", formData.address.trim());
    if (formData.city) customerData.append("city", formData.city.trim());
    if (formData.state) customerData.append("state", formData.state.trim());
    if (formData.zip_code) customerData.append("zip_code", formData.zip_code.trim());
    if (formData.notes) customerData.append("notes", formData.notes.trim());
    if (customer) customerData.append("id", customer.id.toString());

    await onSave(customerData, !!customer);
  };

  const modalContentStyle = {
    maxWidth: isMobile ? "96%" : isTablet ? "84%" : "780px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    margin: isMobile ? "10px" : "0",
    width: "100%"
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: isMobile ? "12px" : "16px"
  };

  const inputBaseStyle = {
    width: "100%",
    padding: isMobile ? "11px 12px" : "12px 14px",
    fontSize: isMobile ? "0.9rem" : "0.98rem",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#0f172a"
  };

  const sectionCardStyle = {
    background: "linear-gradient(180deg, #ffffff, #f8fbff)",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    padding: isMobile ? "12px" : "16px"
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
        initial={{ opacity: 0, scale: 0.94, y: isMobile ? 50 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: isMobile ? 50 : 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalContentStyle,
          background: "linear-gradient(180deg, #f7fbff 0%, #ffffff 20%)",
          borderRadius: isMobile ? "18px 18px 0 0" : "18px",
          border: "1px solid #dbeafe",
          boxShadow: "0 26px 44px rgba(15, 23, 42, 0.2)"
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "16px" : "20px 24px",
            borderBottom: "1px solid #bfdbfe",
            position: isMobile ? "sticky" : "static",
            top: 0,
            background: "linear-gradient(120deg, #0f6fff 0%, #0284c7 60%, #38bdf8 100%)",
            zIndex: 10,
            borderRadius: isMobile ? "18px 18px 0 0" : "18px 18px 0 0"
          }}
        >
          <div className="modal-title">
            <h2
              style={{
                fontSize: isMobile ? "1.25rem" : "1.5rem",
                fontWeight: "700",
                margin: "0 0 4px 0",
                color: "#f8fafc"
              }}
            >
              {customer ? "Edit Client" : "New Client"}
            </h2>
            <p
              style={{
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                color: "#dbeafe",
                margin: 0
              }}
            >
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
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "8px" : "4px"
            }}
          >
            <FiX />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: isMobile ? "16px" : "24px" }}>
          <div style={sectionCardStyle}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: isMobile ? "0.92rem" : "1rem", color: "#0369a1" }}>
              Basic Information
            </h3>
            <div style={formGridStyle}>
              <div style={{ gridColumn: isMobile ? "1" : "span 2" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  <FiUser size={isMobile ? 14 : 16} /> Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter client full name"
                  required
                  style={{ ...inputBaseStyle, border: `1px solid ${errors.full_name ? "#ef4444" : "#cbd5e1"}` }}
                />
                {errors.full_name && <span style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.full_name}</span>}
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  <FiPhone size={isMobile ? 14 : 16} /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  required
                  style={{ ...inputBaseStyle, border: `1px solid ${errors.phone ? "#ef4444" : "#cbd5e1"}` }}
                />
                {errors.phone && <span style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.phone}</span>}
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  <FiMail size={isMobile ? 14 : 16} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  style={{ ...inputBaseStyle, border: `1px solid ${errors.email ? "#ef4444" : "#cbd5e1"}` }}
                />
                {errors.email && <span style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.email}</span>}
              </div>

              <div>
                <label style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" style={inputBaseStyle} />
              </div>
              <div>
                <label style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" style={inputBaseStyle} />
              </div>
              <div>
                <label style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" }}>Zip Code</label>
                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleInputChange} placeholder="Enter zip code" style={inputBaseStyle} />
              </div>
            </div>
          </div>

          <div style={{ ...sectionCardStyle, marginTop: isMobile ? "12px" : "14px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: isMobile ? "0.92rem" : "1rem", color: "#0369a1" }}>
              Address & Notes
            </h3>
            <div style={formGridStyle}>
              <div style={{ gridColumn: isMobile ? "1" : "span 2" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  <FiMapPin size={isMobile ? 14 : 16} /> Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows={isMobile ? 2 : 3}
                  style={{ ...inputBaseStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ gridColumn: isMobile ? "1" : "span 2" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: isMobile ? "0.8rem" : "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  <FiFileText size={isMobile ? 14 : 16} /> Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any notes about the client..."
                  rows={isMobile ? 2 : 3}
                  style={{ ...inputBaseStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column-reverse" : "row",
              justifyContent: "flex-end",
              gap: isMobile ? "12px" : "16px",
              marginTop: isMobile ? "20px" : "24px",
              paddingTop: isMobile ? "16px" : "0",
              borderTop: isMobile ? "1px solid #e2e8f0" : "none"
            }}
          >
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              style={{
                flex: isMobile ? "1" : "none",
                padding: isMobile ? "12px" : "10px 20px",
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: isMobile ? "1rem" : "0.875rem",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer"
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              style={{
                flex: isMobile ? "1" : "none",
                padding: isMobile ? "12px" : "10px 20px",
                background: "linear-gradient(120deg, #0f6fff, #0284c7)",
                border: "none",
                borderRadius: "10px",
                fontSize: isMobile ? "1rem" : "0.875rem",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FiSave size={isMobile ? 18 : 16} />
              {customer ? "Update Client" : "Create Client"}
              {loading && "..."}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CustomerFormModal;
