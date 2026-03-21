import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';

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
  claim_type: string;
  status: string;
  specifications?: string;
  purchase_date?: string;
  installation_date?: string;
  last_service_date?: string;
  stock_quantity?: string;
}

interface ComptosunFormModalProps {
  battery: Battery | null;
  onClose: () => void;
  onSave: (batteryData: any, isEdit: boolean) => void;
  loading: boolean;
}

const ComptosunFormModal: React.FC<ComptosunFormModalProps> = ({
  battery,
  onClose,
  onSave,
  loading
}) => {
  const isEdit = !!battery;
  
  const [formData, setFormData] = useState({
    battery_model: '',
    battery_serial: '',
    brand: '',
    capacity: '',
    voltage: '12V',
    battery_type: 'lead_acid',
    category: 'inverter',
    price: '',
    warranty_period: '',
    amc_period: '',
    inverter_model: '',
    battery_condition: 'good',
    claim_type: 'comptosun',
    status: 'active',
    specifications: '',
    purchase_date: '',
    installation_date: '',
    stock_quantity: '1'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (battery) {
      setFormData({
        battery_model: battery.battery_model || '',
        battery_serial: battery.battery_serial || '',
        brand: battery.brand || '',
        capacity: battery.capacity || '',
        voltage: battery.voltage || '12V',
        battery_type: battery.battery_type || 'lead_acid',
        category: battery.category || 'inverter',
        price: battery.price || '',
        warranty_period: battery.warranty_period || '',
        amc_period: battery.amc_period || '',
        inverter_model: battery.inverter_model || '',
        battery_condition: battery.battery_condition || 'good',
        claim_type: battery.claim_type || 'comptosun',
        status: battery.status || 'active',
        specifications: battery.specifications || '',
        purchase_date: battery.purchase_date || '',
        installation_date: battery.installation_date || '',
        stock_quantity: battery.stock_quantity || '1'
      });
    }
  }, [battery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.battery_model.trim()) {
      newErrors.battery_model = 'Battery model is required';
    }
    
    if (!formData.battery_serial.trim()) {
      newErrors.battery_serial = 'Serial number is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    }
    
    if (!formData.price.trim() || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const batteryData = {
      ...formData,
      id: isEdit ? battery.id : undefined,
      is_spare: false,
      spare_status: 'available'
    };

    onSave(batteryData, isEdit);
  };

  const batteryTypes = [
    { value: 'lead_acid', label: 'Lead Acid' },
    { value: 'lithium_ion', label: 'Lithium Ion' },
    { value: 'gel', label: 'GEL' },
    { value: 'agm', label: 'AGM' },
    { value: 'tubular', label: 'Tubular' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'defective', label: 'Defective' },
    { value: 'needs_replacement', label: 'Needs Replacement' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'in_service', label: 'In Service' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  const categories = [
    { value: 'inverter', label: 'Inverter' },
    { value: 'ups', label: 'UPS' },
    { value: 'solar', label: 'Solar' },
    { value: 'automotive', label: 'Automotive' }
  ];

  const voltages = ['6V', '12V', '24V', '48V', '72V', '96V', '120V'];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content comptosun-form-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-left">
              <h2>{isEdit ? 'Edit Company to Sun Battery' : 'Add New Company to Sun Battery'}</h2>
              <p className="subtitle">
                {isEdit ? 'Update battery details' : 'Register a new battery claimed from company to Sun'}
              </p>
            </div>
            <div className="header-right">
              <button type="button" className="btn-icon close" onClick={onClose}>
                <FiX />
              </button>
            </div>
          </div>

          {/* Claim Type Banner */}
          <div className="claim-banner" style={{ backgroundColor: '#3B82F6' }}>
            <div className="banner-content">
              <span>COMPANY TO SUN CLAIM REGISTRATION</span>
              <span className="banner-badge">Claim Type: COMPTOSUN</span>
            </div>
          </div>

          <div className="modal-body">
            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="error-alert">
                <FiAlertCircle />
                <div>
                  <strong>Please fix the following errors:</strong>
                  <ul>
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="battery_model">
                    Battery Model <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="battery_model"
                    name="battery_model"
                    value={formData.battery_model}
                    onChange={handleChange}
                    placeholder="e.g., Exide Inva Master 150AH"
                    className={errors.battery_model ? 'error' : ''}
                  />
                  {errors.battery_model && (
                    <span className="error-message">{errors.battery_model}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="battery_serial">
                    Serial Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="battery_serial"
                    name="battery_serial"
                    value={formData.battery_serial}
                    onChange={handleChange}
                    placeholder="e.g., EXD150AH2024001"
                    className={errors.battery_serial ? 'error' : ''}
                  />
                  {errors.battery_serial && (
                    <span className="error-message">{errors.battery_serial}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="brand">
                    Brand <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Exide, Luminous, Amaron"
                    className={errors.brand ? 'error' : ''}
                  />
                  {errors.brand && (
                    <span className="error-message">{errors.brand}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="capacity">
                    Capacity <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 150AH, 200AH"
                    className={errors.capacity ? 'error' : ''}
                  />
                  {errors.capacity && (
                    <span className="error-message">{errors.capacity}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="voltage">Voltage</label>
                  <select
                    id="voltage"
                    name="voltage"
                    value={formData.voltage}
                    onChange={handleChange}
                  >
                    {voltages.map(voltage => (
                      <option key={voltage} value={voltage}>{voltage}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="battery_type">Battery Type</label>
                  <select
                    id="battery_type"
                    name="battery_type"
                    value={formData.battery_type}
                    onChange={handleChange}
                  >
                    {batteryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="inverter_model">Inverter Model</label>
                  <input
                    type="text"
                    id="inverter_model"
                    name="inverter_model"
                    value={formData.inverter_model}
                    onChange={handleChange}
                    placeholder="e.g., Luminous Eco Volt+ 1050"
                  />
                </div>
              </div>
            </div>

            {/* Status & Condition Section */}
            <div className="form-section">
              <h3>Status & Condition</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="battery_condition">Condition</label>
                  <select
                    id="battery_condition"
                    name="battery_condition"
                    value={formData.battery_condition}
                    onChange={handleChange}
                  >
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Current Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stock_quantity">Stock Quantity</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Warranty Section */}
            <div className="form-section">
              <h3>Pricing & Warranty</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="price">
                    Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.price ? 'error' : ''}
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="warranty_period">Warranty Period</label>
                  <input
                    type="text"
                    id="warranty_period"
                    name="warranty_period"
                    value={formData.warranty_period}
                    onChange={handleChange}
                    placeholder="e.g., 2 years, 36 months"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amc_period">AMC Period</label>
                  <input
                    type="text"
                    id="amc_period"
                    name="amc_period"
                    value={formData.amc_period}
                    onChange={handleChange}
                    placeholder="e.g., 1 year, 12 months"
                  />
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="form-section">
              <h3>Dates</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="purchase_date">Purchase Date</label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="installation_date">Installation Date</label>
                  <input
                    type="date"
                    id="installation_date"
                    name="installation_date"
                    value={formData.installation_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label htmlFor="specifications">Specifications / Notes</label>
                <textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="Enter any additional specifications or notes about the battery..."
                  rows={3}
                />
              </div>
            </div>

            {/* Hidden Claim Type Field */}
            <input type="hidden" name="claim_type" value="comptosun" />
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <div className="footer-info">
              <span>{isEdit ? 'Editing battery ID: ' + battery.id : 'Creating new Company to Sun battery'}</span>
            </div>
            <div className="footer-actions">
              <motion.button
                type="button"
                className="btn secondary"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FiSave />
                    {isEdit ? 'Update Battery' : 'Save Battery'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ComptosunFormModal;