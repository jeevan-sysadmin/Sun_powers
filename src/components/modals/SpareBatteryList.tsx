// SpareBatteryList.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiPlus, FiSearch, FiEdit, FiTrash2, 
  FiEye, FiAlertCircle, FiBattery, FiMapPin 
} from 'react-icons/fi';

interface SpareBattery {
  id: number;
  battery_code: string;
  battery_type: string;
  battery_model: string;
  capacity: string;
  voltage: string;
  manufacturer: string;
  current_condition: string;
  quantity: number;
  min_quantity: number;
  location: string;
  warranty_status: string;
  is_low_quantity: number;
}

interface SpareBatteryListProps {
  onAddNew: () => void;
  onEdit: (spare: SpareBattery) => void;
  onDelete: (id: number) => void;
  onView: (spare: SpareBattery) => void;
}

const SpareBatteryList: React.FC<SpareBatteryListProps> = ({
  onAddNew, onEdit, onDelete, onView
}) => {
  const [spareBatteries, setSpareBatteries] = useState<SpareBattery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost/sun_powers/api";

  useEffect(() => {
    fetchSpareBatteries();
  }, []);

  const fetchSpareBatteries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/spare_batteries.php`);
      const data = await response.json();
      
      if (data.success) {
        setSpareBatteries(data.data);
      } else {
        setError(data.message || 'Failed to load spare batteries');
      }
    } catch (error) {
      console.error('Error fetching spare batteries:', error);
      setError('Failed to load spare batteries');
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'New': '#10b981',
      'Good': '#3b82f6',
      'Fair': '#f59e0b',
      'Poor': '#ef4444',
      'Defective': '#6b7280'
    };
    return colors[condition] || '#6b7280';
  };

  const filteredBatteries = spareBatteries.filter(spare => {
    const matchesSearch = searchTerm === '' || 
      spare.battery_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spare.battery_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spare.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spare.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCondition = filterCondition === 'all' || spare.current_condition === filterCondition;
    
    return matchesSearch && matchesCondition;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading spare batteries...</p>
      </div>
    );
  }

  return (
    <div className="spare-battery-list">
      <div className="list-header">
        <h2>
          <FiPackage /> Spare Battery Inventory
        </h2>
        <motion.button
          className="btn primary"
          onClick={onAddNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> Add New Spare Battery
        </motion.button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by model, code, manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Conditions</option>
          <option value="New">New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
          <option value="Defective">Defective</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <FiAlertCircle /> {error}
        </div>
      )}

      {filteredBatteries.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} />
          <h3>No Spare Batteries Found</h3>
          <p>Click the "Add New Spare Battery" button to create one.</p>
        </div>
      ) : (
        <div className="batteries-grid">
          {filteredBatteries.map((spare) => (
            <motion.div
              key={spare.id}
              className={`battery-card ${spare.is_low_quantity ? 'low-stock' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <div className="card-header">
                <span className="battery-code">{spare.battery_code}</span>
                <span 
                  className="condition-badge"
                  style={{ backgroundColor: getConditionColor(spare.current_condition) }}
                >
                  {spare.current_condition}
                </span>
              </div>

              <div className="card-body">
                <h3 className="model">{spare.battery_model}</h3>
                <p className="manufacturer">{spare.manufacturer}</p>
                
                <div className="specs">
                  <span><FiBattery /> {spare.capacity || 'N/A'}</span>
                  <span>{spare.voltage || 'N/A'}</span>
                </div>

                <div className="quantity">
                  <span>Quantity:</span>
                  <span className={spare.is_low_quantity ? 'low' : ''}>
                    {spare.quantity} / {spare.min_quantity}
                  </span>
                </div>

                <div className="location">
                  <FiMapPin /> {spare.location || 'Not specified'}
                </div>

                <div className="warranty">
                  Warranty: {spare.warranty_status}
                </div>
              </div>

              <div className="card-actions">
                <motion.button
                  className="action-btn view"
                  onClick={() => onView(spare)}
                  whileHover={{ scale: 1.1 }}
                  title="View Details"
                >
                  <FiEye />
                </motion.button>
                <motion.button
                  className="action-btn edit"
                  onClick={() => onEdit(spare)}
                  whileHover={{ scale: 1.1 }}
                  title="Edit"
                >
                  <FiEdit />
                </motion.button>
                <motion.button
                  className="action-btn delete"
                  onClick={() => onDelete(spare.id)}
                  whileHover={{ scale: 1.1 }}
                  title="Delete"
                >
                  <FiTrash2 />
                </motion.button>
              </div>

              {spare.is_low_quantity === 1 && (
                <div className="low-stock-warning">
                  <FiAlertCircle /> Low Stock! Only {spare.quantity} left
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpareBatteryList;