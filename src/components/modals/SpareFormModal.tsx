import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Spare.css';

interface SpareBattery {
    id: string;
    battery_type: string;
    battery_model: string;
    capacity: string;
    voltage: string;
    manufacturer: string;
    purchase_date: string;
    warranty_months: string;
    current_condition: string;
    quantity: string;
    min_quantity: string;
    location: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    battery_code: string;
    is_spare: number;
}

interface SpareFormModalProps {
    spare?: SpareBattery | null;
    isEditing: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const SpareFormModal: React.FC<SpareFormModalProps> = ({ 
    spare, 
    isEditing, 
    onClose, 
    onSubmit 
}) => {
    const [formData, setFormData] = useState({
        battery_type: '',
        battery_model: '',
        capacity: '',
        voltage: '',
        manufacturer: '',
        purchase_date: '',
        warranty_months: '',
        current_condition: 'New',
        quantity: '',
        min_quantity: '',
        location: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost/sun_powers/api/spare_batteries.php';

    useEffect(() => {
        if (isEditing && spare) {
            setFormData({
                battery_type: spare.battery_type,
                battery_model: spare.battery_model,
                capacity: spare.capacity,
                voltage: spare.voltage,
                manufacturer: spare.manufacturer,
                purchase_date: spare.purchase_date,
                warranty_months: spare.warranty_months,
                current_condition: spare.current_condition,
                quantity: spare.quantity,
                min_quantity: spare.min_quantity,
                location: spare.location,
                notes: spare.notes || '',
            });
        }
    }, [isEditing, spare]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.battery_type.trim()) {
            setError('Battery type is required');
            return false;
        }
        if (!formData.battery_model.trim()) {
            setError('Battery model is required');
            return false;
        }
        if (!formData.capacity.trim()) {
            setError('Capacity is required');
            return false;
        }
        if (!formData.voltage.trim()) {
            setError('Voltage is required');
            return false;
        }
        if (!formData.manufacturer.trim()) {
            setError('Manufacturer is required');
            return false;
        }
        if (!formData.purchase_date) {
            setError('Purchase date is required');
            return false;
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            setError('Valid quantity is required');
            return false;
        }
        if (!formData.min_quantity || parseInt(formData.min_quantity) < 0) {
            setError('Valid minimum quantity is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const dataToSubmit = {
                ...formData,
                id: spare?.id || '',
                is_spare: 1
            };

            let response;
            if (isEditing) {
                response = await axios.put(API_URL, dataToSubmit);
            } else {
                response = await axios.post(API_URL, dataToSubmit);
            }

            if (response.data.success) {
                setSuccess(isEditing ? 'Spare battery updated successfully!' : 'Spare battery added successfully!');
                setTimeout(() => {
                    onSubmit();
                    onClose();
                }, 1500);
            } else {
                setError(response.data.message || 'Operation failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error saving spare battery');
            console.error('Error saving spare battery:', err);
        } finally {
            setLoading(false);
        }
    };

    const batteryTypes = ['Li-ion', 'Lead Acid', 'Li-Po', 'NiMH', 'NiCd', 'Other'];
    const conditions = ['New', 'Good', 'Fair', 'Used', 'Damaged'];

    return (
        <div className="modal-overlay">
            <div className="modal-container form-modal">
                <div className="modal-header">
                    <h2>
                        <i className="fas fa-car-battery"></i>
                        {isEditing ? 'Edit Spare Battery' : 'Add New Spare Battery'}
                    </h2>
                    <button className="modal-close-btn" onClick={onClose} disabled={loading}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                <i className="fas fa-check-circle"></i>
                                {success}
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="battery_type">
                                    <i className="fas fa-battery-full"></i> Battery Type *
                                </label>
                                <select
                                    id="battery_type"
                                    name="battery_type"
                                    value={formData.battery_type}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Type</option>
                                    {batteryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="battery_model">
                                    <i className="fas fa-qrcode"></i> Battery Model *
                                </label>
                                <input
                                    type="text"
                                    id="battery_model"
                                    name="battery_model"
                                    value={formData.battery_model}
                                    onChange={handleChange}
                                    placeholder="e.g., 18650, UPS-12V"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">
                                    <i className="fas fa-charging-station"></i> Capacity *
                                </label>
                                <input
                                    type="text"
                                    id="capacity"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder="e.g., 3000mAh, 7Ah"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="voltage">
                                    <i className="fas fa-bolt"></i> Voltage *
                                </label>
                                <input
                                    type="text"
                                    id="voltage"
                                    name="voltage"
                                    value={formData.voltage}
                                    onChange={handleChange}
                                    placeholder="e.g., 3.7V, 12V"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="manufacturer">
                                    <i className="fas fa-industry"></i> Manufacturer *
                                </label>
                                <input
                                    type="text"
                                    id="manufacturer"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    placeholder="e.g., Samsung, Exide"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purchase_date">
                                    <i className="fas fa-calendar-alt"></i> Purchase Date *
                                </label>
                                <input
                                    type="date"
                                    id="purchase_date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="warranty_months">
                                    <i className="fas fa-shield-alt"></i> Warranty (Months)
                                </label>
                                <input
                                    type="number"
                                    id="warranty_months"
                                    name="warranty_months"
                                    value={formData.warranty_months}
                                    onChange={handleChange}
                                    placeholder="e.g., 12"
                                    min="0"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="current_condition">
                                    <i className="fas fa-clipboard-check"></i> Condition
                                </label>
                                <select
                                    id="current_condition"
                                    name="current_condition"
                                    value={formData.current_condition}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {conditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantity">
                                    <i className="fas fa-boxes"></i> Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="e.g., 50"
                                    min="0"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="min_quantity">
                                    <i className="fas fa-exclamation-triangle"></i> Minimum Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="min_quantity"
                                    name="min_quantity"
                                    value={formData.min_quantity}
                                    onChange={handleChange}
                                    placeholder="e.g., 10"
                                    min="0"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">
                                    <i className="fas fa-map-marker-alt"></i> Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Storage Room A"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group-full">
                            <label htmlFor="notes">
                                <i className="fas fa-sticky-note"></i> Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add any additional notes or comments..."
                                rows={4}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn secondary-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-btn primary-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i> {isEditing ? 'Update' : 'Save'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpareFormModal;