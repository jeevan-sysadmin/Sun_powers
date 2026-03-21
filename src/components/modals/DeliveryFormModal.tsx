import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiSave,
  FiTruck,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiPackage,
  FiInfo
} from "react-icons/fi";

interface Delivery {
  id: number;
  delivery_code: string;
  service_id: number;
  customer_id: number;
  delivery_type: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  delivery_person: string;
  notes: string;
  status: string;
}

interface DeliveryFormModalProps {
  delivery: Delivery | null;
  onClose: () => void;
  onSave: (deliveryData: any, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const DeliveryFormModal: React.FC<DeliveryFormModalProps> = ({
  delivery,
  onClose,
  onSave,
  loading
}) => {
  const isEdit = !!delivery;
  
  const [formData, setFormData] = useState({
    service_id: "",
    customer_id: "",
    delivery_type: "home_delivery",
    address: "",
    contact_person: "",
    contact_phone: "",
    scheduled_date: "",
    scheduled_time: "",
    delivery_person: "",
    notes: "",
    status: "scheduled"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (delivery) {
      setFormData({
        service_id: delivery.service_id.toString(),
        customer_id: delivery.customer_id.toString(),
        delivery_type: delivery.delivery_type,
        address: delivery.address,
        contact_person: delivery.contact_person,
        contact_phone: delivery.contact_phone,
        scheduled_date: delivery.scheduled_date,
        scheduled_time: delivery.scheduled_time,
        delivery_person: delivery.delivery_person,
        notes: delivery.notes,
        status: delivery.status
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, scheduled_date: today }));
    }
  }, [delivery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.service_id.trim()) {
      newErrors.service_id = "Service ID is required";
    }
    
    if (!formData.customer_id.trim()) {
      newErrors.customer_id = "Customer ID is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required";
    }
    
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "Contact phone is required";
    } else if (!/^\d{10}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = "Phone number must be 10 digits";
    }
    
    if (!formData.scheduled_date.trim()) {
      newErrors.scheduled_date = "Scheduled date is required";
    }
    
    if (!formData.scheduled_time.trim()) {
      newErrors.scheduled_time = "Scheduled time is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const deliveryData: any = {
      service_id: parseInt(formData.service_id),
      customer_id: parseInt(formData.customer_id),
      delivery_type: formData.delivery_type,
      address: formData.address,
      contact_person: formData.contact_person,
      contact_phone: formData.contact_phone,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time + ":00",
      delivery_person: formData.delivery_person,
      notes: formData.notes,
      status: formData.status
    };
    
    if (isEdit && delivery) {
      deliveryData.id = delivery.id;
    }
    
    await onSave(deliveryData, isEdit);
  };

  const deliveryTypes = [
    { value: "home_delivery", label: "Home Delivery" },
    { value: "pickup", label: "Pickup" },
    { value: "exchange", label: "Exchange" },
    { value: "installation", label: "Installation" }
  ];
  
  const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "dispatched", label: "Dispatched" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "failed", label: "Failed" }
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
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <h2>
              <FiTruck />
              {isEdit ? 'Edit Delivery' : 'Create New Delivery'}
            </h2>
            <p>{isEdit ? 'Update delivery information' : 'Schedule a new delivery'}</p>
          </div>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit} className="delivery-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-group">
              <label htmlFor="service_id">
                <FiPackage /> Service ID *
              </label>
              <input
                type="number"
                id="service_id"
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                placeholder="Enter service ID"
                className={errors.service_id ? 'error' : ''}
              />
              {errors.service_id && <span className="error-text">{errors.service_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="customer_id">
                <FiUser /> Customer ID *
              </label>
              <input
                type="number"
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                placeholder="Enter customer ID"
                className={errors.customer_id ? 'error' : ''}
              />
              {errors.customer_id && <span className="error-text">{errors.customer_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="delivery_type">Delivery Type</label>
              <select
                id="delivery_type"
                name="delivery_type"
                value={formData.delivery_type}
                onChange={handleChange}
              >
                {deliveryTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="form-group">
              <label htmlFor="contact_person">
                <FiUser /> Contact Person *
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Enter contact person name"
                className={errors.contact_person ? 'error' : ''}
              />
              {errors.contact_person && <span className="error-text">{errors.contact_person}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contact_phone">
                <FiPhone /> Contact Phone *
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                pattern="[0-9]{10}"
                className={errors.contact_phone ? 'error' : ''}
              />
              {errors.contact_phone && <span className="error-text">{errors.contact_phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="delivery_person">
                <FiUser /> Delivery Person
              </label>
              <input
                type="text"
                id="delivery_person"
                name="delivery_person"
                value={formData.delivery_person}
                onChange={handleChange}
                placeholder="Enter delivery person name"
              />
            </div>

            {/* Schedule Information */}
            <div className="form-group">
              <label htmlFor="scheduled_date">
                <FiCalendar /> Scheduled Date *
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className={errors.scheduled_date ? 'error' : ''}
              />
              {errors.scheduled_date && <span className="error-text">{errors.scheduled_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="scheduled_time">
                <FiClock /> Scheduled Time *
              </label>
              <input
                type="time"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                className={errors.scheduled_time ? 'error' : ''}
              />
              {errors.scheduled_time && <span className="error-text">{errors.scheduled_time}</span>}
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address">
                <FiMapPin /> Delivery Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete delivery address"
                rows={3}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            {/* Notes */}
            <div className="form-group full-width">
              <label htmlFor="notes">
                <FiInfo /> Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <motion.button
              type="button"
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
              {isEdit ? 'Update Delivery' : 'Create Delivery'}
              {loading && '...'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DeliveryFormModal;