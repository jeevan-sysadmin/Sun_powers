import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiSearch, FiCalendar, FiPackage, FiBattery, FiUser, FiPhone, FiDollarSign, FiShield, FiFileText } from "react-icons/fi";

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

interface ReplacementFormModalProps {
  replacement: ReplacementBattery | null;
  onClose: () => void;
  onSave: (data: any, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const ReplacementFormModal: React.FC<ReplacementFormModalProps> = ({
  replacement,
  onClose,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    // Customer Information
    service_order_id: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    
    // Original Battery
    original_battery_model: '',
    original_battery_serial: '',
    
    // Replacement Battery
    battery_model: '',
    battery_serial: '',
    brand: '',
    capacity: '',
    voltage: '12V',
    battery_type: 'lead_acid',
    
    // Details
    price: '',
    warranty_period: '',
    installation_date: new Date().toISOString().split('T')[0],
    service_status: 'pending',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  useEffect(() => {
    if (replacement) {
      setFormData({
        service_order_id: replacement.service_order_id || '',
        customer_id: replacement.customer_id || '',
        customer_name: replacement.customer_name || '',
        customer_phone: replacement.customer_phone || '',
        original_battery_model: replacement.original_battery_model || '',
        original_battery_serial: replacement.original_battery_serial || '',
        battery_model: replacement.battery_model || '',
        battery_serial: replacement.battery_serial || '',
        brand: replacement.brand || '',
        capacity: replacement.capacity || '',
        voltage: replacement.voltage || '12V',
        battery_type: replacement.battery_type || 'lead_acid',
        price: replacement.price || '',
        warranty_period: replacement.warranty_period || '',
        installation_date: replacement.installation_date || new Date().toISOString().split('T')[0],
        service_status: replacement.service_status || 'pending',
        notes: replacement.notes || ''
      });
    }
  }, [replacement]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Customer phone is required';
    } else if (!/^\d{10}$/.test(formData.customer_phone.replace(/\D/g, ''))) {
      newErrors.customer_phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.battery_serial.trim()) {
      newErrors.battery_serial = 'Battery serial number is required';
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const isEdit = !!replacement;
    const submitData = {
      ...formData,
      id: replacement?.id || '',
      price: formData.price || '0.00'
    };

    try {
      await onSave(submitData, isEdit);
    } catch (error) {
      console.error('Error saving replacement:', error);
    }
  };

  const batteryTypes = [
    { value: 'lead_acid', label: 'Lead Acid' },
    { value: 'lithium_ion', label: 'Lithium Ion' },
    { value: 'gel', label: 'GEL' },
    { value: 'agm', label: 'AGM' },
    { value: 'tubular', label: 'Tubular' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const voltageOptions = [
    { value: '6V', label: '6V' },
    { value: '12V', label: '12V' },
    { value: '24V', label: '24V' },
    { value: '48V', label: '48V' }
  ];

  const capacityOptions = [
    { value: '50AH', label: '50AH' },
    { value: '75AH', label: '75AH' },
    { value: '100AH', label: '100AH' },
    { value: '120AH', label: '120AH' },
    { value: '150AH', label: '150AH' },
    { value: '200AH', label: '200AH' },
    { value: '250AH', label: '250AH' }
  ];

  const warrantyOptions = [
    { value: '6_months', label: '6 Months' },
    { value: '1_year', label: '1 Year' },
    { value: '2_years', label: '2 Years' },
    { value: '3_years', label: '3 Years' },
    { value: '5_years', label: '5 Years' }
  ];

  const handleCustomerSelect = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone
    }));
    setShowCustomerSearch(false);
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
          className="modal-content replacement-form-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-left">
              <h2>
                {replacement ? 'Edit Replacement Battery' : 'New Replacement Battery'}
              </h2>
              {replacement && (
                <div className="code-badge">
                  <FiPackage />
                  <span>{replacement.service_code}</span>
                </div>
              )}
            </div>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                {/* Customer Section */}
                <div className="form-section">
                  <div className="section-header">
                    <FiUser className="section-icon" />
                    <h3>Customer Information</h3>
                  </div>
                  <div className="form-group">
                    <label>
                      <FiUser />
                      Customer Name *
                    </label>
                    <div className="input-with-action">
                      <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="Enter customer name"
                        className={errors.customer_name ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="search-customer-btn"
                        onClick={() => setShowCustomerSearch(true)}
                        title="Search existing customer"
                      >
                        <FiSearch />
                      </button>
                    </div>
                    {errors.customer_name && (
                      <span className="error-message">{errors.customer_name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPhone />
                      Customer Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      className={errors.customer_phone ? 'error' : ''}
                    />
                    {errors.customer_phone && (
                      <span className="error-message">{errors.customer_phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPackage />
                      Service Order ID
                    </label>
                    <input
                      type="text"
                      value={formData.service_order_id}
                      onChange={(e) => handleInputChange('service_order_id', e.target.value)}
                      placeholder="Enter service order ID"
                    />
                  </div>
                </div>

                {/* Original Battery Section */}
                <div className="form-section">
                  <div className="section-header">
                    <FiBattery className="section-icon" />
                    <h3>Original Battery</h3>
                  </div>
                  <div className="form-group">
                    <label>Original Battery Model</label>
                    <input
                      type="text"
                      value={formData.original_battery_model}
                      onChange={(e) => handleInputChange('original_battery_model', e.target.value)}
                      placeholder="Enter original battery model"
                    />
                  </div>

                  <div className="form-group">
                    <label>Original Battery Serial</label>
                    <input
                      type="text"
                      value={formData.original_battery_serial}
                      onChange={(e) => handleInputChange('original_battery_serial', e.target.value)}
                      placeholder="Enter original battery serial number"
                    />
                  </div>
                </div>

                {/* Replacement Battery Section */}
                <div className="form-section">
                  <div className="section-header">
                    <FiPackage className="section-icon" />
                    <h3>Replacement Battery</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Battery Serial Number *</label>
                      <input
                        type="text"
                        value={formData.battery_serial}
                        onChange={(e) => handleInputChange('battery_serial', e.target.value)}
                        placeholder="Enter battery serial number"
                        className={errors.battery_serial ? 'error' : ''}
                      />
                      {errors.battery_serial && (
                        <span className="error-message">{errors.battery_serial}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Battery Model</label>
                      <input
                        type="text"
                        value={formData.battery_model}
                        onChange={(e) => handleInputChange('battery_model', e.target.value)}
                        placeholder="Enter battery model"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Battery Type</label>
                      <select
                        value={formData.battery_type}
                        onChange={(e) => handleInputChange('battery_type', e.target.value)}
                      >
                        {batteryTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Capacity</label>
                      <select
                        value={formData.capacity}
                        onChange={(e) => handleInputChange('capacity', e.target.value)}
                      >
                        <option value="">Select capacity</option>
                        {capacityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Voltage</label>
                      <select
                        value={formData.voltage}
                        onChange={(e) => handleInputChange('voltage', e.target.value)}
                      >
                        {voltageOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="form-section">
                  <div className="section-header">
                    <FiDollarSign className="section-icon" />
                    <h3>Details</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiDollarSign />
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className={errors.price ? 'error' : ''}
                      />
                      {errors.price && (
                        <span className="error-message">{errors.price}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        <FiCalendar />
                        Installation Date
                      </label>
                      <input
                        type="date"
                        value={formData.installation_date}
                        onChange={(e) => handleInputChange('installation_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiShield />
                        Warranty Period
                      </label>
                      <select
                        value={formData.warranty_period}
                        onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                      >
                        <option value="">Select warranty</option>
                        {warrantyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.service_status}
                        onChange={(e) => handleInputChange('service_status', e.target.value)}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <FiFileText />
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <div className="footer-left">
                <span className="form-info">
                  Fields marked with * are required
                </span>
              </div>
              <div className="footer-right">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      {replacement ? 'Update Replacement' : 'Create Replacement'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <div className="customer-search-modal">
          <div className="search-modal-header">
            <h3>Search Customer</h3>
            <button onClick={() => setShowCustomerSearch(false)}>
              <FiX />
            </button>
          </div>
          <div className="search-input-container">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-results">
            {/* This would be populated with actual customer data */}
            <div className="no-results">
              <p>Customer search functionality would be implemented here</p>
              <button
                className="btn secondary"
                onClick={() => setShowCustomerSearch(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReplacementFormModal;