import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiCalendar } from 'react-icons/fi';
import '../css/Compclaim.css';

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

interface CompclaimFormModalProps {
  battery: Battery | null;
  onClose: () => void;
  onSave: (batteryData: any, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const CompclaimFormModal: React.FC<CompclaimFormModalProps> = ({
  battery,
  onClose,
  onSave,
  loading
}) => {
  const isEdit = !!battery;
  
  // Form state
  const [formData, setFormData] = useState({
    battery_code: '',
    battery_model: '',
    battery_serial: '',
    brand: '',
    capacity: '',
    voltage: '12V',
    battery_type: 'lead_acid',
    category: 'inverter',
    price: '',
    warranty_period: '',
    amc_period: '0',
    inverter_model: '',
    battery_condition: 'good',
    specifications: '',
    purchase_date: '',
    installation_date: '',
    last_service_date: '',
    stock_quantity: '0',
    status: 'active',
    shop_stock_quantity: '0',
    company_stock_quantity: '0',
    tracking_status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (battery) {
      setFormData({
        battery_code: battery.battery_code || '',
        battery_model: battery.battery_model || '',
        battery_serial: battery.battery_serial || '',
        brand: battery.brand || '',
        capacity: battery.capacity || '',
        voltage: battery.voltage || '12V',
        battery_type: battery.battery_type || 'lead_acid',
        category: battery.category || 'inverter',
        price: battery.price || '',
        warranty_period: battery.warranty_period || '',
        amc_period: battery.amc_period || '0',
        inverter_model: battery.inverter_model || '',
        battery_condition: battery.battery_condition || 'good',
        specifications: battery.specifications || '',
        purchase_date: battery.purchase_date || '',
        installation_date: battery.installation_date || '',
        last_service_date: battery.last_service_date || '',
        stock_quantity: battery.stock_quantity || '0',
        status: battery.status || 'active',
        shop_stock_quantity: battery.shop_stock_quantity || '0',
        company_stock_quantity: battery.company_stock_quantity || '0',
        tracking_status: battery.tracking_status || 'active'
      });
    } else {
      // Generate new battery code for new claim
      const newCode = `COMP_${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({
        ...prev,
        battery_code: newCode
      }));
    }
  }, [battery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.battery_model.trim()) {
      newErrors.battery_model = 'Battery model is required';
    }
    
    if (!formData.battery_serial.trim()) {
      newErrors.battery_serial = 'Battery serial number is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Add claim_type to the data
    const dataToSend = {
      ...formData,
      claim_type: 'company',
      id: battery?.id
    };
    
    await onSave(dataToSend, isEdit);
  };

  const batteryTypes = [
    { value: 'lead_acid', label: 'Lead Acid' },
    { value: 'tubular', label: 'Tubular' },
    { value: 'agm', label: 'AGM' },
    { value: 'gel', label: 'GEL' },
    { value: 'lithium_ion', label: 'Lithium Ion' },
    { value: 'li_po', label: 'Li-Po' }
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
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'completed', label: 'Completed' }
  ];

  const trackingStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'returned', label: 'Returned' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="compclaim-form-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-left">
              <h2>{isEdit ? 'Edit Company Claim' : 'New Company Claim'}</h2>
              <p className="subtitle">
                {isEdit ? 'Update company claim details' : 'Add new company warranty/replacement claim'}
              </p>
            </div>
            <div className="header-right">
              <motion.button 
                type="button"
                className="btn-icon close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX />
              </motion.button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="modal-content">
            <div className="form-grid">
              {/* Left Column - Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="battery_code">
                    Claim Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="battery_code"
                    name="battery_code"
                    value={formData.battery_code}
                    onChange={handleChange}
                    className={`form-input ${errors.battery_code ? 'error' : ''}`}
                    placeholder="e.g., COMP_2024001"
                    required
                  />
                  {errors.battery_code && (
                    <span className="error-message">{errors.battery_code}</span>
                  )}
                </div>
                
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
                    className={`form-input ${errors.battery_model ? 'error' : ''}`}
                    placeholder="e.g., Exide Inva Master 150AH"
                    required
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
                    className={`form-input ${errors.battery_serial ? 'error' : ''}`}
                    placeholder="e.g., EXD00123456"
                    required
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
                    className={`form-input ${errors.brand ? 'error' : ''}`}
                    placeholder="e.g., Exide, Luminous, Amaron"
                    required
                  />
                  {errors.brand && (
                    <span className="error-message">{errors.brand}</span>
                  )}
                </div>
              </div>

              {/* Middle Column - Specifications */}
              <div className="form-section">
                <h3>Specifications</h3>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="capacity">
                      Capacity <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      className={`form-input ${errors.capacity ? 'error' : ''}`}
                      placeholder="e.g., 150AH"
                      required
                    />
                    {errors.capacity && (
                      <span className="error-message">{errors.capacity}</span>
                    )}
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="voltage">Voltage</label>
                    <select
                      id="voltage"
                      name="voltage"
                      value={formData.voltage}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="6V">6V</option>
                      <option value="12V">12V</option>
                      <option value="24V">24V</option>
                      <option value="48V">48V</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="battery_type">Battery Type</label>
                  <select
                    id="battery_type"
                    name="battery_type"
                    value={formData.battery_type}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {batteryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
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
                    className="form-input"
                    placeholder="e.g., Luminous Eco Volt+ 1050"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Right Column - Status & Dates */}
              <div className="form-section">
                <h3>Status & Dates</h3>
                
                <div className="form-group">
                  <label htmlFor="status">Claim Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="battery_condition">Condition</label>
                  <select
                    id="battery_condition"
                    name="battery_condition"
                    value={formData.battery_condition}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tracking_status">Tracking Status</label>
                  <select
                    id="tracking_status"
                    name="tracking_status"
                    value={formData.tracking_status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {trackingStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="purchase_date">
                      <FiCalendar /> Purchase Date
                    </label>
                    <input
                      type="date"
                      id="purchase_date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="installation_date">
                      <FiCalendar /> Installation Date
                    </label>
                    <input
                      type="date"
                      id="installation_date"
                      name="installation_date"
                      value={formData.installation_date}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty & AMC Section */}
            <div className="form-section full-width">
              <h3>Warranty & AMC</h3>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="warranty_period">Warranty Period</label>
                  <input
                    type="text"
                    id="warranty_period"
                    name="warranty_period"
                    value={formData.warranty_period}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 3 years"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="amc_period">AMC Period</label>
                  <select
                    id="amc_period"
                    name="amc_period"
                    value={formData.amc_period}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="0">No AMC</option>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="form-section full-width">
              <h3>Stock Information</h3>
              
              <div className="form-row">
                <div className="form-group third">
                  <label htmlFor="shop_stock_quantity">Shop Stock</label>
                  <input
                    type="number"
                    id="shop_stock_quantity"
                    name="shop_stock_quantity"
                    value={formData.shop_stock_quantity}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                  />
                </div>
                
                <div className="form-group third">
                  <label htmlFor="company_stock_quantity">Company Stock</label>
                  <input
                    type="number"
                    id="company_stock_quantity"
                    name="company_stock_quantity"
                    value={formData.company_stock_quantity}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                  />
                </div>
                
                <div className="form-group third">
                  <label htmlFor="stock_quantity">Total Stock</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Specifications Textarea */}
            <div className="form-section full-width">
              <h3>Specifications & Notes</h3>
              
              <div className="form-group">
                <label htmlFor="specifications">Detailed Specifications</label>
                <textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Enter detailed specifications, special notes, or other relevant information..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
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
                <FiSave />
                {loading ? 'Saving...' : (isEdit ? 'Update Claim' : 'Create Claim')}
              </motion.button>
            </div>
            <div className="footer-info">
              <p className="info-note">
                <strong>Note:</strong> Company claims are for warranty/replacement batteries managed with manufacturers.
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CompclaimFormModal;