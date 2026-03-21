import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiSave, FiCalendar } from "react-icons/fi";

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

interface ShopClaimFormModalProps {
  battery: Battery | null;
  onClose: () => void;
  onSave: (data: any, isEdit: boolean) => void;
  loading: boolean;
}

const ShopClaimFormModal: React.FC<ShopClaimFormModalProps> = ({
  battery,
  onClose,
  onSave,
  loading
}) => {
  const isEdit = !!battery;
  
  const [formData, setFormData] = useState({
    battery_code: battery?.battery_code || `BATT_SHOP_${Math.floor(1000 + Math.random() * 9000)}`,
    battery_model: battery?.battery_model || '',
    battery_serial: battery?.battery_serial || '',
    brand: battery?.brand || '',
    capacity: battery?.capacity || '',
    voltage: battery?.voltage || '12V',
    battery_type: battery?.battery_type || 'lead_acid',
    category: battery?.category || 'inverter',
    specifications: battery?.specifications || '',
    purchase_date: battery?.purchase_date || '',
    warranty_period: battery?.warranty_period || '1 year',
    amc_period: battery?.amc_period || '0',
    price: battery?.price || '',
    stock_quantity: battery?.stock_quantity || '1',
    status: battery?.status || 'active',
    inverter_model: battery?.inverter_model || '',
    installation_date: battery?.installation_date || '',
    battery_condition: battery?.battery_condition || 'good',
    shop_stock_quantity: battery?.shop_stock_quantity || '1',
    company_stock_quantity: battery?.company_stock_quantity || '0',
    tracking_status: battery?.tracking_status || 'active',
    is_spare: battery?.is_spare ? '1' : '0',
    spare_status: battery?.spare_status || 'available'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    const dataToSend = isEdit
      ? { ...formData, id: battery.id }
      : formData;
    
    onSave(dataToSend, isEdit);
  };

  const batteryTypes = [
    { value: 'lead_acid', label: 'Lead Acid' },
    { value: 'lithium_ion', label: 'Lithium Ion' },
    { value: 'gel', label: 'Gel' },
    { value: 'agm', label: 'AGM' },
    { value: 'tubular', label: 'Tubular' },
    { value: 'li_ion', label: 'Li-Ion' },
    { value: 'li_po', label: 'Li-Po' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'defective', label: 'Defective' },
    { value: 'needs_replacement', label: 'Needs Replacement' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'in_service', label: 'In Service' },
    { value: 'returned', label: 'Returned' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'replaced', label: 'Replaced' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const trackingStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'returned', label: 'Returned' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const spareStatusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'allocated', label: 'Allocated' },
    { value: 'in_use', label: 'In Use' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'returned', label: 'Returned' },
    { value: 'damaged', label: 'Damaged' }
  ];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="shop-claim-form-modal"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-left">
              <div className="modal-icon">
                <FiCalendar size={24} />
              </div>
              <div>
                <h2>{isEdit ? 'Edit Shop Claim' : 'Add New Shop Claim'}</h2>
                <p className="modal-subtitle">
                  {isEdit ? 'Update shop claim battery details' : 'Create new shop claim battery record'}
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              className="icon-btn close-btn"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Close"
            >
              <FiX />
            </motion.button>
          </div>

          <div className="modal-content">
            {/* Form Sections */}
            <div className="form-sections">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="battery_code">Battery Code *</label>
                    <input
                      type="text"
                      id="battery_code"
                      name="battery_code"
                      value={formData.battery_code}
                      onChange={handleChange}
                      placeholder="e.g., BATT_SHOP_001"
                      required
                      disabled={isEdit}
                    />
                    {errors.battery_code && <span className="error-message">{errors.battery_code}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="battery_model">Battery Model *</label>
                    <input
                      type="text"
                      id="battery_model"
                      name="battery_model"
                      value={formData.battery_model}
                      onChange={handleChange}
                      placeholder="e.g., Exide Inva Master 150AH"
                      required
                    />
                    {errors.battery_model && <span className="error-message">{errors.battery_model}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="battery_serial">Serial Number *</label>
                    <input
                      type="text"
                      id="battery_serial"
                      name="battery_serial"
                      value={formData.battery_serial}
                      onChange={handleChange}
                      placeholder="e.g., EXD00123456"
                      required
                    />
                    {errors.battery_serial && <span className="error-message">{errors.battery_serial}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g., Exide"
                      required
                    />
                    {errors.brand && <span className="error-message">{errors.brand}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity">Capacity *</label>
                    <input
                      type="text"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 150AH"
                      required
                    />
                    {errors.capacity && <span className="error-message">{errors.capacity}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="voltage">Voltage</label>
                    <select
                      id="voltage"
                      name="voltage"
                      value={formData.voltage}
                      onChange={handleChange}
                    >
                      <option value="6V">6V</option>
                      <option value="12V">12V</option>
                      <option value="24V">24V</option>
                      <option value="48V">48V</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="form-section">
                <h3>Technical Details</h3>
                <div className="form-grid">
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
                      <option value="inverter">Inverter</option>
                      <option value="solar">Solar</option>
                      <option value="ups">UPS</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="industrial">Industrial</option>
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

                  <div className="form-group">
                    <label htmlFor="battery_condition">Condition</label>
                    <select
                      id="battery_condition"
                      name="battery_condition"
                      value={formData.battery_condition}
                      onChange={handleChange}
                    >
                      {conditionOptions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specifications">Specifications</label>
                    <textarea
                      id="specifications"
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleChange}
                      placeholder="Technical specifications..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Financial & Stock Details */}
              <div className="form-section">
                <h3>Financial & Stock Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="price">Price (₹) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g., 15000"
                      step="0.01"
                      min="0"
                      required
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock_quantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shop_stock_quantity">Shop Stock</label>
                    <input
                      type="number"
                      id="shop_stock_quantity"
                      name="shop_stock_quantity"
                      value={formData.shop_stock_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_stock_quantity">Company Stock</label>
                    <input
                      type="number"
                      id="company_stock_quantity"
                      name="company_stock_quantity"
                      value={formData.company_stock_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Warranty */}
              <div className="form-section">
                <h3>Dates & Warranty</h3>
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

                  <div className="form-group">
                    <label htmlFor="warranty_period">Warranty Period</label>
                    <input
                      type="text"
                      id="warranty_period"
                      name="warranty_period"
                      value={formData.warranty_period}
                      onChange={handleChange}
                      placeholder="e.g., 2 years"
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
                      placeholder="e.g., 1 year"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Tracking */}
              <div className="form-section">
                <h3>Status & Tracking</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
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
                    >
                      {trackingStatusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="is_spare">Is Spare Battery?</label>
                    <select
                      id="is_spare"
                      name="is_spare"
                      value={formData.is_spare}
                      onChange={handleChange}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>

                  {formData.is_spare === '1' && (
                    <div className="form-group">
                      <label htmlFor="spare_status">Spare Status</label>
                      <select
                        id="spare_status"
                        name="spare_status"
                        value={formData.spare_status}
                        onChange={handleChange}
                      >
                        {spareStatusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="modal-footer">
            <div className="form-actions">
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
                {loading ? 'Saving...' : isEdit ? 'Update Shop Claim' : 'Save Shop Claim'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ShopClaimFormModal;