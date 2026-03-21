// @ts-nocheck
// ParentComponent.tsx - Example of how to use the components
import React, { useState, useEffect } from 'react';
import ServicesTab from './ServicesTab';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceDetailModal from './modals/ServiceDetailModal';

const ParentComponent: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterClaimType, setFilterClaimType] = useState('all');

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [services, filterStatus, filterServiceType, filterPriority, filterClaimType]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/sun_powers/api/services.php');
      const data = await response.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => service.status === filterStatus);
    }
    
    if (filterServiceType !== 'all') {
      filtered = filtered.filter(service => service.service_type === filterServiceType);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(service => service.priority === filterPriority);
    }
    
    if (filterClaimType !== 'all') {
      filtered = filtered.filter(service => service.battery_claim === filterClaimType);
    }
    
    setFilteredServices(filtered);
  };

  // Color helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'testing': return '#6366f1';
      case 'ready': return '#10b981';
      case 'completed': return '#059669';
      case 'delivered': return '#0ea5e9';
      case 'cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#84cc16';
      default: return '#94a3b8';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'pending': return '#ef4444';
      case 'refunded': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'battery_service': return '#10b981';
      case 'inverter_service': return '#3b82f6';
      case 'hybrid_service': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getWarrantyColor = (status: string) => {
    switch (status) {
      case 'in_warranty': return '#10b981';
      case 'extended_warranty': return '#3b82f6';
      case 'out_of_warranty': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getClaimColor = (claim: string) => {
    switch (claim) {
      case 'shop_claim': return '#f59e0b';
      case 'company_claim': return '#3b82f6';
      case 'none': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  // Event handlers
  const handleViewService = (service: any) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowFormModal(true);
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this service order?')) {
      try {
        const response = await fetch(`http://localhost/sun_powers/api/services.php?id=${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          loadServices(); // Reload services
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleSaveService = async (serviceData: any, isEdit: boolean) => {
    try {
      const url = 'http://localhost/sun_powers/api/services.php';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowFormModal(false);
        loadServices(); // Reload services
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  return (
    <div>
      <ServicesTab
        services={services}
        filteredServices={filteredServices}
        filterStatus={filterStatus}
        filterServiceType={filterServiceType}
        filterPriority={filterPriority}
        filterClaimType={filterClaimType}
        onViewService={handleViewService}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
        onFilterStatusChange={setFilterStatus}
        onFilterServiceTypeChange={setFilterServiceType}
        onFilterPriorityChange={setFilterPriority}
        onFilterClaimTypeChange={setFilterClaimType}
        onNewService={() => {
          setSelectedService(null);
          setShowFormModal(true);
        }}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        getPaymentStatusColor={getPaymentStatusColor}
        getServiceTypeColor={getServiceTypeColor}
        loading={loading}
      />

      {showFormModal && (
        <ServiceFormModal
          service={selectedService}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveService}
          loading={false}
        />
      )}

      {showDetailModal && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            setShowFormModal(true);
          }}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getPaymentStatusColor={getPaymentStatusColor}
          getServiceTypeColor={getServiceTypeColor}
          getWarrantyColor={getWarrantyColor}
          getClaimColor={getClaimColor}
        />
      )}
    </div>
  );
};

export default ParentComponent;
