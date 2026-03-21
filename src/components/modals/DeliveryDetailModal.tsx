// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import { 
  FiX,
  FiTruck,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiInfo,
  FiNavigation
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
  delivered_date: string | null;
  created_at: string;
  updated_at: string;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  battery_model: string;
  battery_brand: string;
  scheduled_date_formatted: string;
  scheduled_time_formatted: string;
}

interface DeliveryDetailModalProps {
  delivery: Delivery;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
}

const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({
  delivery,
  onClose,
  onUpdateStatus,
  getStatusColor,
  getTypeColor
}) => {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <FiCalendar className="status-icon" />;
      case "dispatched": return <FiTruck className="status-icon" />;
      case "in_transit": return <FiRefreshCw className="status-icon" />;
      case "delivered": return <FiCheckCircle className="status-icon" />;
      case "cancelled": return <FiXCircle className="status-icon" />;
      case "failed": return <FiXCircle className="status-icon" />;
      default: return <FiCalendar className="status-icon" />;
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content delivery-detail-modal"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <h2>Delivery Details</h2>
            <p>Delivery Code: {delivery.delivery_code}</p>
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
        
        <div className="delivery-detail-content">
          {/* Status Bar */}
          <div className="status-bar">
            <div 
              className="current-status"
              style={{ 
                backgroundColor: getStatusColor(delivery.status) + '20',
                color: getStatusColor(delivery.status)
              }}
            >
              {getStatusIcon(delivery.status)}
              <span>{delivery.status?.replace('_', ' ').toUpperCase()}</span>
            </div>
            
            <div className="status-actions">
              {delivery.status === "scheduled" && (
                <motion.button 
                  className="btn secondary"
                  onClick={() => onUpdateStatus("dispatched")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTruck /> Mark as Dispatched
                </motion.button>
              )}
              
              {delivery.status === "dispatched" && (
                <motion.button 
                  className="btn secondary"
                  onClick={() => onUpdateStatus("in_transit")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiRefreshCw /> Mark as In Transit
                </motion.button>
              )}
              
              {delivery.status === "in_transit" && (
                <motion.button 
                  className="btn primary"
                  onClick={() => onUpdateStatus("delivered")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCheckCircle /> Mark as Delivered
                </motion.button>
              )}
              
              {(delivery.status === "scheduled" || delivery.status === "dispatched" || delivery.status === "in_transit") && (
                <motion.button 
                  className="btn danger"
                  onClick={() => onUpdateStatus("cancelled")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiXCircle /> Cancel Delivery
                </motion.button>
              )}
            </div>
          </div>

          <div className="delivery-detail-grid">
            {/* Delivery Information */}
            <div className="detail-section">
              <h3><FiTruck /> Delivery Information</h3>
              <div className="detail-item">
                <span className="detail-label">Delivery Code:</span>
                <span className="detail-value">{delivery.delivery_code}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Service Code:</span>
                <span className="detail-value">{delivery.service_code}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Delivery Type:</span>
                <span 
                  className="detail-value"
                  style={{ color: getTypeColor(delivery.delivery_type) }}
                >
                  {delivery.delivery_type?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Delivery Person:</span>
                <span className="detail-value">{delivery.delivery_person || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created Date:</span>
                <span className="detail-value">{formatDate(delivery.created_at)}</span>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="detail-section">
              <h3><FiUser /> Customer Information</h3>
              <div className="detail-item">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{delivery.customer_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{delivery.customer_phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Person:</span>
                <span className="detail-value">{delivery.contact_person}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Phone:</span>
                <span className="detail-value">{delivery.contact_phone}</span>
              </div>
            </div>
            
            {/* Battery Information */}
            <div className="detail-section">
              <h3><FiPackage /> Battery Information</h3>
              <div className="detail-item">
                <span className="detail-label">Battery Brand:</span>
                <span className="detail-value">{delivery.battery_brand || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Battery Model:</span>
                <span className="detail-value">{delivery.battery_model || 'N/A'}</span>
              </div>
            </div>

            {/* Scheduled Date & Time (Compact) */}
            <div className="detail-section">
              <h3><FiCalendar /> Scheduled Schedule</h3>
              <div className="schedule-compact">
                <div className="schedule-item">
                  <FiCalendar className="schedule-icon" />
                  <div>
                    <div className="schedule-label">Date</div>
                    <div className="schedule-value">{delivery.scheduled_date_formatted}</div>
                  </div>
                </div>
                <div className="schedule-item">
                  <FiClock className="schedule-icon" />
                  <div>
                    <div className="schedule-label">Time</div>
                    <div className="schedule-value">{delivery.scheduled_time_formatted}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {delivery.notes && (
              <div className="detail-section full-width">
                <h3><FiInfo /> Notes</h3>
                <div className="notes-content">
                  <p>{delivery.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="delivery-detail-actions">
            <motion.button 
              className="btn primary close-only"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .delivery-detail-modal {
          max-width: 1000px;
          width: 100%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #eef2f6;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
          border-radius: 20px 20px 0 0;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1a1f36;
        }

        .modal-title p {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color 0.3s;
        }

        .close-btn:hover {
          background-color: #f3f4f6;
        }

        .delivery-detail-content {
          padding: 2rem;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .current-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1rem;
        }

        .status-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn.secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn.danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn.outline {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: #4b5563;
        }

        .btn.primary.close-only {
          min-width: 120px;
          margin: 0 auto;
        }

        .delivery-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-section {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 12px;
        }

        .detail-section.full-width {
          grid-column: 1 / -1;
        }

        .detail-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem;
          font-size: 1rem;
          color: #4b5563;
        }

        .detail-item {
          display: flex;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          flex-wrap: wrap;
        }

        .detail-label {
          min-width: 120px;
          color: #6b7280;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 500;
          flex: 1;
          word-break: break-word;
        }

        .schedule-compact {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          background: white;
          border-radius: 8px;
        }

        .schedule-icon {
          color: #f59e0b;
          font-size: 1.25rem;
        }

        .schedule-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .schedule-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .notes-content {
          background: white;
          border-radius: 8px;
          padding: 1rem;
        }

        .notes-content p {
          margin: 0;
          line-height: 1.6;
          color: #4b5563;
        }

        .delivery-detail-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eef2f6;
        }

        /* Tablet Styles */
        @media (min-width: 768px) and (max-width: 1024px) {
          .modal-content {
            max-width: 95%;
          }

          .delivery-detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .modal-header {
            padding: 1.25rem 1.5rem;
          }

          .delivery-detail-content {
            padding: 1.5rem;
          }

          .status-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-actions {
            width: 100%;
          }

          .btn {
            flex: 1;
            min-width: 140px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .modal-overlay {
            padding: 0.5rem;
            align-items: flex-end;
          }

          .modal-content {
            max-height: 95vh;
            width: 100%;
            border-radius: 20px 20px 0 0;
          }

          .delivery-detail-modal {
            max-width: 100%;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-title h2 {
            font-size: 1.25rem;
          }

          .delivery-detail-content {
            padding: 1rem;
          }

          .delivery-detail-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .status-bar {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.75rem;
          }

          .current-status {
            width: 100%;
            justify-content: center;
          }

          .status-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn {
            width: 100%;
            padding: 0.75rem 1rem;
          }

          .detail-section {
            padding: 1rem;
          }

          .detail-item {
            flex-direction: column;
            margin-bottom: 0.5rem;
          }

          .detail-label {
            min-width: auto;
            margin-bottom: 0.25rem;
          }

          .schedule-item {
            padding: 0.75rem;
          }

          .delivery-detail-actions {
            margin-top: 1.5rem;
            padding-top: 1rem;
          }

          .btn.primary.close-only {
            width: 100%;
            max-width: 200px;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .modal-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }

          .modal-title p {
            font-size: 0.75rem;
          }

          .current-status {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
          }

          .detail-section h3 {
            font-size: 0.875rem;
          }

          .detail-item {
            font-size: 0.813rem;
          }

          .btn {
            font-size: 0.813rem;
          }

          .schedule-value {
            font-size: 0.813rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default DeliveryDetailModal;
