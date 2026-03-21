import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit,
  FiFileText,
  FiShield,
  FiActivity,
  FiTool,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiCreditCard,
  FiPackage,
  FiHome,
  FiBriefcase
} from "react-icons/fi";

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
  service_count: number;
  last_service_date?: string;
  total_services: string;
}

interface Service {
  id: number;
  service_code: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  status: string;
  priority: string;
  issue_description: string;
  estimated_cost: number;
  final_cost: number;
  payment_status: string;
  estimated_completion_date: string;
  created_at: string;
  updated_at: string;
  battery_model?: string;
  battery_serial?: string;
  deposit_amount?: number;
}

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEdit,
  isLoading = false
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState("");
  
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#d1fae5'; // light green
      case 'in_progress':
      case 'in progress':
        return '#dbeafe'; // light blue
      case 'pending':
        return '#fef3c7'; // light yellow
      case 'cancelled':
        return '#fee2e2'; // light red
      default:
        return '#f3f4f6'; // light gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle color="#059669" size={isMobile ? 14 : 16} />;
      case 'in_progress':
      case 'in progress':
        return <FiClock color="#2563eb" size={isMobile ? 14 : 16} />;
      case 'pending':
        return <FiClock color="#d97706" size={isMobile ? 14 : 16} />;
      case 'cancelled':
        return <FiAlertCircle color="#dc2626" size={isMobile ? 14 : 16} />;
      default:
        return <FiClock color="#6b7280" size={isMobile ? 14 : 16} />;
    }
  };

  const getPriorityBackground = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#fee2e2'; // light red
      case 'medium':
        return '#fef3c7'; // light yellow
      case 'low':
        return '#d1fae5'; // light green
      default:
        return '#f3f4f6'; // light gray
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#059669';
      case 'partial':
        return '#2563eb';
      case 'pending':
        return '#d97706';
      case 'overdue':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const formatRupees = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchCustomerServices = async () => {
      if (!customer.id) return;
      
      setIsLoadingServices(true);
      setServicesError("");
      
      try {
        const response = await fetch(`http://localhost/sun_powers/api/services.php?customer_id=${customer.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.services) {
          // Filter services for this customer if API doesn't filter by customer_id
          const customerServices = data.services.filter((service: Service) => 
            service.customer_id === customer.id
          );
          
          // Sort by created date (newest first) and take only recent 5
          const recentServices = customerServices
            .sort((a: Service, b: Service) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 5);
          
          setServices(recentServices);
        } else {
          setServices([]);
          if (data.message) {
            setServicesError(data.message);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServicesError("Failed to load recent services");
        setServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchCustomerServices();
  }, [customer.id]);

  // Mobile card view for services
  const renderMobileServiceCard = (service: Service) => {
    return (
      <div key={service.id} style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontWeight: '600', color: '#3b82f6' }}>{service.service_code}</span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: getStatusBackground(service.status),
            color: '#000000' // Black text
          }}>
            {getStatusIcon(service.status)}
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </span>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
            {service.issue_description || 'No description provided'}
          </div>
          {service.battery_serial && (
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              Battery: {service.battery_serial}
            </div>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>Amount</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
              {formatRupees(service.final_cost || service.estimated_cost)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>Payment</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: getPaymentStatusColor(service.payment_status) }}>
              {service.payment_status?.charAt(0).toUpperCase() + service.payment_status?.slice(1) || 'N/A'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
          <span>Created: {formatShortDate(service.created_at)}</span>
          {service.priority && service.priority !== 'medium' && (
            <span style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              backgroundColor: getPriorityBackground(service.priority),
              color: '#000000' // Black text
            }}>
              {service.priority}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Tablet row render
  const renderTabletServiceRow = (service: Service) => {
    return (
      <tr key={service.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
        <td style={{ padding: '12px 8px' }}>
          <span style={{ fontWeight: '600', color: '#3b82f6', fontSize: '12px' }}>{service.service_code}</span>
        </td>
        <td style={{ padding: '12px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              width: 'fit-content',
              backgroundColor: getStatusBackground(service.status),
              color: '#000000' // Black text
            }}>
              {getStatusIcon(service.status)}
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </span>
            {service.priority && service.priority !== 'medium' && (
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                width: 'fit-content',
                backgroundColor: getPriorityBackground(service.priority),
                color: '#000000' // Black text
              }}>
                {service.priority}
              </span>
            )}
          </div>
        </td>
        <td style={{ padding: '12px 8px', fontSize: '12px' }}>
          <div style={{ color: '#000000' }}>{service.issue_description?.substring(0, 30) || 'No description'}</div>
          {service.battery_serial && (
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Battery: {service.battery_serial}</div>
          )}
        </td>
        <td style={{ padding: '12px 8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#059669' }}>
            {formatRupees(service.final_cost || service.estimated_cost)}
          </div>
        </td>
        <td style={{ padding: '12px 8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: getPaymentStatusColor(service.payment_status) }}>
            {service.payment_status?.charAt(0).toUpperCase() + service.payment_status?.slice(1) || 'N/A'}
          </div>
        </td>
        <td style={{ padding: '12px 8px', fontSize: '11px', color: '#000000' }}>
          {formatShortDate(service.created_at)}
        </td>
      </tr>
    );
  };

  // Modal styles based on screen size
  const modalContentStyle = {
    maxWidth: isMobile ? "95%" : isTablet ? "90%" : "1000px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    margin: isMobile ? "10px" : "0",
    width: "100%",
    backgroundColor: "white",
    borderRadius: isMobile ? "16px 16px 0 0" : "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
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
        style={modalContentStyle}
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
              .modal-content {
                animation: slideUp 0.3s ease-out;
                border-radius: 16px 16px 0 0 !important;
              }
            }
            
            @media (min-width: 768px) and (max-width: 1023px) {
              .modal-content {
                max-width: 90% !important;
              }
            }
            
            @media (min-width: 1024px) {
              .modal-content {
                max-width: 1000px !important;
              }
            }
          `}
        </style>
        
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '40px 16px' : '60px',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading customer details...</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '16px' : '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              position: isMobile ? 'sticky' : 'static',
              top: 0,
              backgroundColor: 'white',
              zIndex: 10,
              borderRadius: isMobile ? '16px 16px 0 0' : '16px 16px 0 0'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: '600', 
                  margin: '0 0 4px 0',
                  color: '#1f2937'
                }}>
                  Client Details
                </h2>
                <p style={{ 
                  fontSize: isMobile ? '0.75rem' : '0.875rem', 
                  color: '#6b7280', 
                  margin: 0 
                }}>
                  Complete information about the client
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isMobile && (
                  <motion.button
                    style={{
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      fontWeight: '500',
                      color: '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={onEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiEdit size={isMobile ? 14 : 16} />
                    Edit Client
                  </motion.button>
                )}
                <motion.button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isMobile ? '20px' : '24px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '8px' : '4px'
                  }}
                  onClick={onClose}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>
            </div>

            <div style={{ padding: isMobile ? '12px' : '24px' }}>
              {/* Customer Header */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '16px' : '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '50px' : '64px',
                    height: isMobile ? '50px' : '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {customer.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: isMobile ? '1.1rem' : '1.3rem', 
                      fontWeight: '600', 
                      margin: '0 0 6px 0',
                      color: '#1f2937'
                    }}>
                      {customer.full_name}
                    </h3>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: '#eff6ff',
                      borderRadius: '6px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      color: '#1e40af'
                    }}>
                      <FiShield size={isMobile ? 12 : 14} />
                      <span>Client Code: {customer.customer_code}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: isMobile ? '8px' : '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    flex: isMobile ? 1 : 'none',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: isMobile ? '8px' : '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: isMobile ? 'calc(50% - 4px)' : '120px'
                  }}>
                    <FiActivity size={isMobile ? 16 : 20} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: '600', color: '#000000' }}>
                        {customer.total_services || 0}
                      </div>
                      <div style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: '#6b7280' }}>
                        Total Services
                      </div>
                    </div>
                  </div>
                  
                  {customer.last_service_date && (
                    <div style={{
                      flex: isMobile ? 1 : 'none',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: isMobile ? '8px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: isMobile ? 'calc(50% - 4px)' : '120px'
                    }}>
                      <FiCalendar size={isMobile ? 16 : 20} color="#3b82f6" />
                      <div>
                        <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: '600', color: '#000000' }}>
                          {formatShortDate(customer.last_service_date)}
                        </div>
                        <div style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: '#6b7280' }}>
                          Last Service
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                <h4 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: isMobile ? '8px' : '12px'
                }}>
                  <FiUser size={isMobile ? 16 : 18} /> Contact Information
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr',
                  gap: isMobile ? '12px' : '16px',
                  background: '#f8fafc',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
                      <FiPhone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number
                    </div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: '500', color: '#000000' }}>{customer.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
                      <FiMail size={12} style={{ display: 'inline', marginRight: '4px' }} /> Email Address
                    </div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: '500', color: '#000000' }}>
                      {customer.email || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                <h4 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: isMobile ? '8px' : '12px'
                }}>
                  <FiMapPin size={isMobile ? 16 : 18} /> Address Information
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr',
                  gap: isMobile ? '12px' : '16px',
                  background: '#f8fafc',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '8px'
                }}>
                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Address</div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#000000' }}>
                      {customer.address || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>City</div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#000000' }}>
                      {customer.city || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>State</div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#000000' }}>
                      {customer.state || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Zip Code</div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#000000' }}>
                      {customer.zip_code || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                <h4 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: isMobile ? '8px' : '12px'
                }}>
                  <FiFileText size={isMobile ? 16 : 18} /> Additional Information
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr',
                  gap: isMobile ? '12px' : '16px',
                  background: '#f8fafc',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
                      <FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Created Date
                    </div>
                    <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#000000' }}>
                      {formatDate(customer.created_at)}
                    </div>
                  </div>
                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Notes</div>
                    <div style={{ 
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      color: '#000000',
                      background: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {customer.notes ? (
                        <p style={{ margin: 0 }}>{customer.notes}</p>
                      ) : (
                        <p style={{ margin: 0, color: '#9ca3af' }}>No notes available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Services */}
              <div>
                <h4 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: isMobile ? '8px' : '12px'
                }}>
                  <FiTool size={isMobile ? 16 : 18} /> Recent Services ({services.length})
                </h4>
                
                {isLoadingServices ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '24px' : '40px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      border: '2px solid #e2e8f0',
                      borderTopColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#6b7280', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                      Loading recent services...
                    </p>
                  </div>
                ) : servicesError ? (
                  <div style={{
                    padding: isMobile ? '16px' : '24px',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#dc2626' }}>Error: {servicesError}</p>
                  </div>
                ) : services.length === 0 ? (
                  <div style={{
                    padding: isMobile ? '24px' : '40px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <FiPackage size={isMobile ? 32 : 48} color="#9ca3af" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: '500', marginBottom: '8px', color: '#000000' }}>
                      No services found for this client.
                    </p>
                    <p style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#6b7280' }}>
                      Service history will appear here once services are added.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {isMobile ? (
                      // Mobile card view
                      <div style={{ padding: '8px' }}>
                        {services.map(service => renderMobileServiceCard(service))}
                      </div>
                    ) : isTablet ? (
                      // Tablet table view
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          minWidth: '600px'
                        }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Service Code</th>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Status</th>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Issue Description</th>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Cost (₹)</th>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Payment</th>
                              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#000000' }}>Created Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {services.map(service => renderTabletServiceRow(service))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      // Desktop table view
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse'
                        }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Service Code</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Status</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Issue Description</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Cost (₹)</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Payment</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#000000' }}>Created Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {services.map((service) => (
                              <tr key={service.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                    {service.service_code}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{
                                      padding: '4px 8px',
                                      borderRadius: '20px',
                                      fontSize: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      width: 'fit-content',
                                      backgroundColor: getStatusBackground(service.status),
                                      color: '#000000' // Black text
                                    }}>
                                      {getStatusIcon(service.status)}
                                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                    </span>
                                    {service.priority && service.priority !== 'medium' && (
                                      <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        width: 'fit-content',
                                        backgroundColor: getPriorityBackground(service.priority),
                                        color: '#000000' // Black text
                                      }}>
                                        {service.priority.charAt(0).toUpperCase() + service.priority.slice(1)}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontSize: '13px', color: '#000000' }}>
                                    {service.issue_description || 'No description provided'}
                                  </div>
                                  {service.battery_serial && (
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                      Battery: {service.battery_serial}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ fontWeight: '500', color: '#059669' }}>
                                    {formatRupees(service.final_cost || service.estimated_cost)}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: getPaymentStatusColor(service.payment_status) }}>
                                      {service.payment_status?.charAt(0).toUpperCase() + service.payment_status?.slice(1) || 'N/A'}
                                    </div>
                                    {service.deposit_amount && service.deposit_amount > 0 && (
                                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                        Deposit: {formatRupees(service.deposit_amount)}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div>
                                    <div style={{ fontSize: '13px', color: '#000000' }}>
                                      {formatShortDate(service.created_at)}
                                    </div>
                                    {service.estimated_completion_date && (
                                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                        Due: {formatShortDate(service.estimated_completion_date)}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              justifyContent: 'flex-end',
              gap: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              position: isMobile ? 'sticky' : 'static',
              bottom: 0,
              zIndex: 10
            }}>
              <motion.button
                type="button"
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '12px' : '10px 20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
              <motion.button
                type="button"
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '12px' : '10px 20px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={onEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEdit size={isMobile ? 18 : 16} />
                {isMobile ? 'Edit' : 'Edit Client Information'}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CustomerDetailModal;