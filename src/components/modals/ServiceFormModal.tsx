import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiBattery,
  FiBatteryCharging,
  FiInfo,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiX,
  FiSave,
  FiPlus,
  FiCopy,
  FiRadio,
  FiAlertCircle,
  FiLoader,
  FiSearch,
  FiUsers,
  FiBox,
  FiRefreshCw,
  FiCheckCircle
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
  total_services?: number;
}

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
  specifications: string;
  purchase_date: string;
  warranty_period: string;
  amc_period: string;
  price: string | number;
  inverter_model?: string;
  installation_date?: string;
  battery_condition?: string;
  created_at: string;
  is_spare: number | boolean;
  spare_status?: string;
  status?: string;
}

interface SpareBattery {
  id: number;
  battery_code: string;
  battery_type: string;
  battery_model: string;
  capacity: string;
  voltage: string;
  manufacturer: string;
  purchase_date: string | null;
  warranty_months: number;
  current_condition: string;
  quantity: number;
  min_quantity: number;
  location: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  warranty_expiry_date: string | null;
  warranty_status: string;
  is_spare: number;
  is_low_quantity: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
}

interface ServiceForm {
  customer_id: number | null;
  customer_phone: string;
  battery_id: number | null;
  issue_description: string;
  status: string;
  warranty_status: string;
  amc_status: string;
  estimated_cost: string;
  final_cost: string;
  deposit_amount: string;
  payment_status: string;
  estimated_completion_date: string;
  priority: string;
  notes: string;
  service_staff_id: number | null;
  showReplacementForm: boolean;
  replacement_battery_model: string;
  replacement_battery_serial: string;
  replacement_battery_brand: string;
  replacement_battery_capacity: string;
  replacement_battery_type: string;
  replacement_battery_voltage: string;
  replacement_battery_price: string;
  replacement_battery_warranty: string;
  replacement_installation_date: string;
  replacement_battery_notes: string;
  battery_claim: string;
  spare_battery_id: number | null;
  use_spare_battery: boolean;
  battery_source: 'original' | 'spare' | 'both' | 'none';
  replacement_battery_id?: number | null;
  customer_name?: string;
  inverter_model?: string;
  battery_model?: string;
  warranty_period?: string;
  warranty_expiry_date?: string;
  warranty_remarks?: string;
}

interface ServiceFormModalProps {
  showForm: boolean;
  editMode: boolean;
  formType: string;
  serviceForm: ServiceForm;
  customers: Customer[];
  batteries: Battery[];
  staffUsers: User[];
  loading: {
    services: boolean;
    replacement_battery: boolean;
  };
  scanningSerial: boolean;
  scanningReplacementSerial: boolean;
  onClose: () => void;
  onServiceInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onServiceSubmit: (e: React.FormEvent) => void;
  onBarcodeScanned: (barcode: string) => void;
  onReplacementBarcodeScanned: (barcode: string) => void;
  onStartBatterySerialScan: () => void;
  onStartReplacementBatterySerialScan: () => void;
  onToggleReplacementBatteryForm: () => void;
  onCopyOriginalBatteryDetails: () => void;
  onSpareBatterySelect?: (spareBattery: SpareBattery) => void;
  onResetBatterySelection?: () => void;
  editingServiceId?: number | null;
  onFetchServiceData?: (serviceId: number) => Promise<any>;
  onFetchReplacementBattery?: (serviceId: number) => Promise<any>;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  showForm,
  editMode,
  formType,
  serviceForm,
  customers,
  batteries,
  staffUsers,
  loading,
  scanningSerial,
  scanningReplacementSerial,
  onClose,
  onServiceInputChange,
  onServiceSubmit,
  onBarcodeScanned,
  onReplacementBarcodeScanned,
  onStartBatterySerialScan,
  onStartReplacementBatterySerialScan,
  onToggleReplacementBatteryForm,
  onCopyOriginalBatteryDetails,
  onSpareBatterySelect,
  onResetBatterySelection,
  editingServiceId = null,
  onFetchServiceData,
  onFetchReplacementBattery
}) => {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
  const [localBatteries, setLocalBatteries] = useState<Battery[]>(batteries);
  const [localStaff, setLocalStaff] = useState<User[]>(staffUsers);
  const [spareBatteries, setSpareBatteries] = useState<SpareBattery[]>([]);
  const [loadingSpareBatteries, setLoadingSpareBatteries] = useState(false);
  const [loadingData, setLoadingData] = useState({
    customers: false,
    batteries: false,
    staff: false,
    service: false,
    replacementBattery: false
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [batterySearch, setBatterySearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [spareBatterySearch, setSpareBatterySearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showBatteryDropdown, setShowBatteryDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [showSpareBatteryDropdown, setShowSpareBatteryDropdown] = useState(false);
  const [selectedSpareBattery, setSelectedSpareBattery] = useState<SpareBattery | null>(null);
  const [selectedOriginalBattery, setSelectedOriginalBattery] = useState<Battery | null>(null);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const batteryDropdownRef = useRef<HTMLDivElement>(null);
  const staffDropdownRef = useRef<HTMLDivElement>(null);
  const spareBatteryDropdownRef = useRef<HTMLDivElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const replacementBarcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  const API_BASE_URL = "http://localhost/sun_powers/api";

  // Responsive detection
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

  // Filter functions
  const filteredCustomers = localCustomers.filter(customer => 
    customer.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.customer_code.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredBatteries = localBatteries.filter(battery => 
    battery.battery_model.toLowerCase().includes(batterySearch.toLowerCase()) ||
    battery.battery_serial.toLowerCase().includes(batterySearch.toLowerCase()) ||
    battery.brand.toLowerCase().includes(batterySearch.toLowerCase())
  );

  const filteredStaff = localStaff.filter(staff => 
    staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    staff.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
    staff.role.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const filteredSpareBatteries = spareBatteries.filter(spare => 
    spare.battery_model.toLowerCase().includes(spareBatterySearch.toLowerCase()) ||
    spare.battery_code.toLowerCase().includes(spareBatterySearch.toLowerCase()) ||
    spare.manufacturer.toLowerCase().includes(spareBatterySearch.toLowerCase()) ||
    (spare.notes && spare.notes.toLowerCase().includes(spareBatterySearch.toLowerCase()))
  ).filter(spare => spare.quantity > 0); // Only show spare batteries with quantity > 0

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (batteryDropdownRef.current && !batteryDropdownRef.current.contains(event.target as Node)) {
        setShowBatteryDropdown(false);
      }
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target as Node)) {
        setShowStaffDropdown(false);
      }
      if (spareBatteryDropdownRef.current && !spareBatteryDropdownRef.current.contains(event.target as Node)) {
        setShowSpareBatteryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API fetch functions
  const fetchCustomers = async () => {
    try {
      setLoadingData(prev => ({ ...prev, customers: true }));
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/customers.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.customers) {
        const formattedCustomers: Customer[] = data.customers.map((customer: any) => ({
          id: parseInt(customer.id),
          customer_code: customer.customer_code || '',
          full_name: customer.full_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          zip_code: customer.zip_code || '',
          notes: customer.notes || '',
          created_at: customer.created_at || '',
          total_services: parseInt(customer.total_services || '0')
        }));
        setLocalCustomers(formattedCustomers);
      } else {
        throw new Error(data.message || 'Failed to load customers');
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(`Failed to load customers: ${error.message}`);
      if (customers.length > 0) {
        setLocalCustomers(customers);
      }
    } finally {
      setLoadingData(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchBatteries = async () => {
    try {
      setLoadingData(prev => ({ ...prev, batteries: true }));
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch batteries: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.batteries) {
        const formattedBatteries: Battery[] = data.batteries.map((battery: any) => ({
          id: parseInt(battery.id),
          battery_code: battery.battery_code || '',
          battery_model: battery.battery_model || '',
          battery_serial: battery.battery_serial || '',
          brand: battery.brand || '',
          capacity: battery.capacity || '',
          voltage: battery.voltage || '12V',
          battery_type: battery.battery_type || 'lead_acid',
          category: battery.category || 'inverter',
          specifications: battery.specifications || '',
          purchase_date: battery.purchase_date || '',
          warranty_period: battery.warranty_period || '',
          amc_period: battery.amc_period || '0',
          price: battery.price || '0',
          inverter_model: battery.inverter_model || '',
          installation_date: battery.installation_date || '',
          battery_condition: battery.battery_condition || 'good',
          created_at: battery.created_at || '',
          is_spare: battery.is_spare === "1" || battery.is_spare === 1 || false,
          spare_status: battery.spare_status || 'available',
          status: battery.status || ''
        }));
        setLocalBatteries(formattedBatteries);
      } else {
        throw new Error(data.message || 'Failed to load batteries');
      }
    } catch (error: any) {
      console.error('Error fetching batteries:', error);
      setError(`Failed to load batteries: ${error.message}`);
      if (batteries.length > 0) {
        setLocalBatteries(batteries);
      }
    } finally {
      setLoadingData(prev => ({ ...prev, batteries: false }));
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingData(prev => ({ ...prev, staff: true }));
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/users.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.users) {
        const formattedStaff: User[] = data.users.map((user: any) => ({
          id: parseInt(user.id),
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'user',
          phone: user.phone || '',
          is_active: user.is_active || true,
          last_login: user.last_login || '',
          created_at: user.created_at || ''
        }));
        setLocalStaff(formattedStaff);
      } else {
        throw new Error(data.message || 'Failed to load staff');
      }
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      setError(`Failed to load staff: ${error.message}`);
      if (staffUsers.length > 0) {
        setLocalStaff(staffUsers);
      }
    } finally {
      setLoadingData(prev => ({ ...prev, staff: false }));
    }
  };

  const fetchSpareBatteries = async () => {
    try {
      setLoadingSpareBatteries(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/spare_batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spare batteries: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setSpareBatteries(data.data);
      } else {
        throw new Error(data.message || 'Failed to load spare batteries');
      }
    } catch (error: any) {
      console.error('Error fetching spare batteries:', error);
      setError(`Failed to load spare batteries: ${error.message}`);
    } finally {
      setLoadingSpareBatteries(false);
    }
  };

  const fetchReplacementBattery = async (serviceId: number) => {
    try {
      setLoadingData(prev => ({ ...prev, replacementBattery: true }));
      
      const response = await fetch(`${API_BASE_URL}/replacement_battery.php?service_order_id=${serviceId}`);
      const data = await response.json();
      
      if (data.success && data.replacement_battery) {
        // Populate replacement form with existing data
        const replacement = data.replacement_battery;
        
        // Create synthetic events to update form
        const events = [
          { name: 'replacement_battery_model', value: replacement.battery_model || '' },
          { name: 'replacement_battery_serial', value: replacement.battery_serial || '' },
          { name: 'replacement_battery_brand', value: replacement.brand || '' },
          { name: 'replacement_battery_capacity', value: replacement.capacity || '' },
          { name: 'replacement_battery_type', value: replacement.battery_type || 'lead_acid' },
          { name: 'replacement_battery_voltage', value: replacement.voltage || '12V' },
          { name: 'replacement_battery_price', value: replacement.price || '0' },
          { name: 'replacement_battery_warranty', value: replacement.warranty_period || '' },
          { name: 'replacement_installation_date', value: replacement.installation_date || '' },
          { name: 'replacement_battery_notes', value: replacement.notes || '' }
        ];

        events.forEach(event => {
          const syntheticEvent = {
            target: {
              name: event.name,
              value: event.value
            }
          } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
          onServiceInputChange(syntheticEvent);
        });

        // Show replacement form if not already shown
        if (!serviceForm.showReplacementForm) {
          onToggleReplacementBatteryForm();
        }
      }
    } catch (error) {
      console.error('Error fetching replacement battery:', error);
    } finally {
      setLoadingData(prev => ({ ...prev, replacementBattery: false }));
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    const event = {
      target: {
        name: 'customer_id',
        value: customer.id.toString()
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(event);

    const phoneEvent = {
      target: {
        name: 'customer_phone',
        value: customer.phone
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onServiceInputChange(phoneEvent);

    setCustomerSearch(customer.full_name);
    setShowCustomerDropdown(false);
    setSuccessMessage(`Selected customer: ${customer.full_name}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Handle original battery selection
  const handleBatterySelect = (battery: Battery) => {
    setSelectedOriginalBattery(battery);
    
    const event = {
      target: {
        name: 'battery_id',
        value: battery.id.toString()
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(event);

    setBatterySearch(`${battery.battery_model} - ${battery.battery_serial}`);
    setShowBatteryDropdown(false);
    setSuccessMessage(`Selected original battery: ${battery.battery_model}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Handle staff selection
  const handleStaffSelect = (staff: User) => {
    const event = {
      target: {
        name: 'service_staff_id',
        value: staff.id.toString()
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(event);

    setStaffSearch(staff.name);
    setShowStaffDropdown(false);
    setSuccessMessage(`Selected staff: ${staff.name}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Handle spare battery selection
  const handleSpareBatterySelect = (spare: SpareBattery) => {
    setSelectedSpareBattery(spare);
    
    // Update the spare_battery_id in form
    const spareIdEvent = {
      target: {
        name: 'spare_battery_id',
        value: spare.id.toString()
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(spareIdEvent);

    // Set use_spare_battery to true
    const useSpareEvent = {
      target: {
        name: 'use_spare_battery',
        value: 'true'
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(useSpareEvent);

    setSpareBatterySearch(`${spare.battery_model} - ${spare.battery_code}`);
    setShowSpareBatteryDropdown(false);
    setSuccessMessage(`Selected spare battery: ${spare.battery_model} (Qty left: ${spare.quantity - 1})`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Remove original battery selection
  const handleRemoveOriginalBattery = () => {
    setSelectedOriginalBattery(null);
    const batteryEvent = {
      target: {
        name: 'battery_id',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(batteryEvent);
    setBatterySearch('');

    setSuccessMessage('Original battery removed');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Remove spare battery selection
  const handleRemoveSpareBattery = () => {
    setSelectedSpareBattery(null);
    
    const spareIdEvent = {
      target: {
        name: 'spare_battery_id',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(spareIdEvent);

    const useSpareEvent = {
      target: {
        name: 'use_spare_battery',
        value: 'false'
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(useSpareEvent);

    setSpareBatterySearch('');

    setSuccessMessage('Spare battery removed');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Reset all battery selections
  const handleResetAllSelections = () => {
    setSelectedOriginalBattery(null);
    setSelectedSpareBattery(null);
    
    const batteryEvent = {
      target: {
        name: 'battery_id',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(batteryEvent);
    setBatterySearch('');

    const spareIdEvent = {
      target: {
        name: 'spare_battery_id',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(spareIdEvent);

    const useSpareEvent = {
      target: {
        name: 'use_spare_battery',
        value: 'false'
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onServiceInputChange(useSpareEvent);

    setSpareBatterySearch('');

    if (onResetBatterySelection) {
      onResetBatterySelection();
    }
    
    setSuccessMessage('All battery selections cleared');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Initialize form data
  useEffect(() => {
    if (showForm && !isInitialized) {
      const initializeForm = async () => {
        try {
          await fetchCustomers();
          await fetchBatteries();
          await fetchStaff();
          await fetchSpareBatteries();
          
          if (editMode && editingServiceId) {
            setLoadingData(prev => ({ ...prev, service: true }));
            
            try {
              let serviceData;
              if (onFetchServiceData) {
                serviceData = await onFetchServiceData(editingServiceId);
              } else {
                const response = await fetch(`${API_BASE_URL}/services.php?id=${editingServiceId}`);
                const data = await response.json();
                if (data.success) {
                  serviceData = data.service || data.service_order;
                }
              }
              
              if (serviceData) {
                console.log("Service data loaded:", serviceData);
                
                // Set customer search
                if (serviceData.customer_name) {
                  setCustomerSearch(serviceData.customer_name);
                }
                
                // Set battery search - Original Battery - FIXED
                if (serviceData.battery_id && localBatteries.length > 0) {
                  // Find the battery in localBatteries
                  const foundBattery = localBatteries.find(b => b.id === parseInt(serviceData.battery_id));
                  if (foundBattery) {
                    setSelectedOriginalBattery(foundBattery);
                    setBatterySearch(`${foundBattery.battery_model} - ${foundBattery.battery_serial}`);
                    
                    // Also ensure the form has the battery_id set
                    const batteryEvent = {
                      target: {
                        name: 'battery_id',
                        value: foundBattery.id.toString()
                      }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onServiceInputChange(batteryEvent);
                  }
                }
                
                // Set spare battery selection - FIXED
                if (serviceData.spare_battery_id && spareBatteries.length > 0) {
                  const foundSpare = spareBatteries.find(s => s.id === parseInt(serviceData.spare_battery_id));
                  if (foundSpare) {
                    setSelectedSpareBattery(foundSpare);
                    setSpareBatterySearch(`${foundSpare.battery_model} - ${foundSpare.battery_code}`);
                    
                    // Set spare_battery_id in form
                    const spareIdEvent = {
                      target: {
                        name: 'spare_battery_id',
                        value: foundSpare.id.toString()
                      }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onServiceInputChange(spareIdEvent);
                    
                    // Set use_spare_battery to true
                    const useSpareEvent = {
                      target: {
                        name: 'use_spare_battery',
                        value: 'true'
                      }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onServiceInputChange(useSpareEvent);
                  }
                }
                
                // Set staff search and ID
                if (serviceData.service_staff_id && localStaff.length > 0) {
                  const foundStaff = localStaff.find(s => s.id === parseInt(serviceData.service_staff_id));
                  if (foundStaff) {
                    setStaffSearch(foundStaff.name);
                  }
                }

                // Check if replacement battery exists
                if (serviceData.replacement_battery_serial) {
                  await fetchReplacementBattery(editingServiceId);
                }
              }
            } catch (error) {
              console.error('Error fetching service data:', error);
              setError('Failed to load service data for editing');
            } finally {
              setLoadingData(prev => ({ ...prev, service: false }));
            }
          }
          
          setIsInitialized(true);
        } catch (error: any) {
          console.error('Error initializing form:', error);
          setError(`Failed to load form data: ${error.message}`);
        }
      };
      
      initializeForm();
    }
    
    if (!showForm) {
      setIsInitialized(false);
      setCustomerSearch('');
      setBatterySearch('');
      setStaffSearch('');
      setSpareBatterySearch('');
      setSelectedSpareBattery(null);
      setSelectedOriginalBattery(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [showForm, editMode, editingServiceId, onFetchServiceData, localBatteries, spareBatteries, localStaff]);

  // Update staff search when serviceForm.service_staff_id changes
  useEffect(() => {
    if (editMode && serviceForm.service_staff_id && localStaff.length > 0) {
      const selectedStaff = localStaff.find(staff => staff.id === serviceForm.service_staff_id);
      if (selectedStaff && staffSearch !== selectedStaff.name) {
        setStaffSearch(selectedStaff.name);
      }
    }
  }, [serviceForm.service_staff_id, localStaff, editMode]);

  // Focus barcode input when scanning
  useEffect(() => {
    if (scanningSerial && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    if (scanningReplacementSerial && replacementBarcodeInputRef.current) {
      replacementBarcodeInputRef.current.focus();
    }
  }, [scanningSerial, scanningReplacementSerial]);

  // Handle barcode input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && barcodeInput.trim()) {
        if (scanningSerial) {
          onBarcodeScanned(barcodeInput.trim());
          setBarcodeInput('');
        } else if (scanningReplacementSerial) {
          onReplacementBarcodeScanned(barcodeInput.trim());
          setBarcodeInput('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcodeInput, scanningSerial, scanningReplacementSerial, onBarcodeScanned, onReplacementBarcodeScanned]);

  const handleBarcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'battery' | 'replacement') => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    if (!scanningSerial && type === 'battery') {
      const event = {
        target: {
          name: 'battery_serial',
          value: value
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onServiceInputChange(event);
    } else if (!scanningReplacementSerial && type === 'replacement') {
      const event = {
        target: {
          name: 'replacement_battery_serial',
          value: value
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onServiceInputChange(event);
    }
  };

  const getFormTitle = (): string => {
    return editMode ? 'Edit Service Order' : 'New Service Order';
  };

  const getFormDescription = (): string => {
    return editMode ? 'Update service order details' : 'Create a new service order';
  };

  const renderServiceForm = () => (
    <form onSubmit={onServiceSubmit} className="service-form" style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          padding: isMobile ? '10px 12px' : '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065f46',
          fontSize: isMobile ? '13px' : '14px'
        }}>
          <FiCheckCircle size={isMobile ? 16 : 18} />
          <span style={{ flex: 1 }}>{successMessage}</span>
          <button 
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: isMobile ? '10px 12px' : '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#b91c1c',
          fontSize: isMobile ? '13px' : '14px'
        }}>
          <FiAlertCircle size={isMobile ? 16 : 18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button 
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loadingData.service && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '16px'
        }}>
          <FiLoader className="spinning" size={isMobile ? 24 : 30} color="#10b981" />
          <span style={{ marginLeft: '10px', color: '#0f172a', fontSize: isMobile ? '14px' : '16px' }}>Loading service data...</span>
        </div>
      )}

      {/* Customer Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'),
        gap: isMobile ? '16px' : '20px'
      }}>
        <div className="form-group" style={{ position: 'relative' }} ref={customerDropdownRef}>
          <label htmlFor="customer_search" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiUser style={{ marginRight: '6px', color: '#10b981' }} /> Select Client *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="customer_search"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Search by name, phone, or code..."
              style={{
                width: '100%',
                padding: isMobile ? '8px 32px 8px 10px' : '10px 36px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px'
              }}
              disabled={loadingData.customers || loadingData.service}
            />
            {loadingData.customers ? (
              <FiLoader className="spinning" style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            ) : (
              <FiSearch style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            )}
          </div>
          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '250px',
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  style={{
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{customer.full_name}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b' }}>
                    {customer.phone} | {customer.customer_code}
                  </div>
                </div>
              ))}
            </div>
          )}
          <small style={{ color: '#64748b', fontSize: isMobile ? '11px' : '12px', marginTop: '4px', display: 'block' }}>
            Mobile number will be auto-filled when client is selected
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="customer_phone" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiPhone style={{ marginRight: '6px', color: '#10b981' }} /> Mobile Number *
          </label>
          <input
            type="text"
            id="customer_phone"
            name="customer_phone"
            value={serviceForm.customer_phone}
            onChange={onServiceInputChange}
            placeholder="Mobile number"
            required
            readOnly={!!serviceForm.customer_id && !editMode}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: serviceForm.customer_id && !editMode ? '#f1f5f9' : 'white'
            }}
          />
        </div>
      </div>

      {/* Original Battery Selection - Separate Box */}
      <div style={{
        marginTop: isMobile ? '16px' : '20px',
        padding: isMobile ? '16px' : '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: isMobile ? '15px' : '16px', 
          fontWeight: 600, 
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiBattery color="#10b981" size={isMobile ? 18 : 20} /> Original Battery Selection
        </h3>

        <div className="form-group" style={{ position: 'relative' }} ref={batteryDropdownRef}>
          <label htmlFor="battery_search" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiBattery style={{ marginRight: '6px', color: '#10b981' }} /> Select Original Battery
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="battery_search"
              value={batterySearch}
              onChange={(e) => {
                setBatterySearch(e.target.value);
                setShowBatteryDropdown(true);
              }}
              onFocus={() => setShowBatteryDropdown(true)}
              placeholder="Search by model or serial..."
              style={{
                width: '100%',
                padding: isMobile ? '8px 32px 8px 10px' : '10px 36px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px'
              }}
              disabled={loadingData.batteries || loadingData.service}
            />
            {loadingData.batteries ? (
              <FiLoader className="spinning" style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            ) : (
              <FiSearch style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            )}
          </div>
          {showBatteryDropdown && filteredBatteries.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '250px',
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {filteredBatteries.map(battery => (
                <div
                  key={battery.id}
                  onClick={() => handleBatterySelect(battery)}
                  style={{
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{battery.battery_model}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b' }}>
                    {battery.brand} | {battery.battery_serial} | {battery.capacity}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedOriginalBattery && (
            <div style={{
              marginTop: '8px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              background: '#dbeafe',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                <strong>Selected:</strong> {selectedOriginalBattery.battery_model} - {selectedOriginalBattery.battery_serial}
              </span>
              <button
                type="button"
                onClick={handleRemoveOriginalBattery}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px'
                }}
                title="Remove original battery"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spare Battery Selection - Separate Box */}
      <div style={{
        marginTop: isMobile ? '16px' : '20px',
        padding: isMobile ? '16px' : '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: isMobile ? '15px' : '16px', 
          fontWeight: 600, 
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiBox color="#10b981" size={isMobile ? 18 : 20} /> Spare Inventory Selection
          <span style={{ marginLeft: '8px', fontSize: isMobile ? '10px' : '11px', color: '#ef4444' }}>
            (Available in stock)
          </span>
        </h3>

        <div className="form-group" style={{ position: 'relative' }} ref={spareBatteryDropdownRef}>
          <label htmlFor="spare_battery_search" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiBox style={{ marginRight: '6px', color: '#10b981' }} /> Select from Spare Inventory
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="spare_battery_search"
              value={spareBatterySearch}
              onChange={(e) => {
                setSpareBatterySearch(e.target.value);
                setShowSpareBatteryDropdown(true);
              }}
              onFocus={() => setShowSpareBatteryDropdown(true)}
              placeholder="Search spare batteries..."
              style={{
                width: '100%',
                padding: isMobile ? '8px 32px 8px 10px' : '10px 36px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px'
              }}
              disabled={loadingSpareBatteries || loadingData.service}
            />
            {loadingSpareBatteries ? (
              <FiLoader className="spinning" style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            ) : (
              <FiSearch style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            )}
          </div>
          {showSpareBatteryDropdown && filteredSpareBatteries.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '250px',
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {filteredSpareBatteries.map(spare => (
                <div
                  key={spare.id}
                  onClick={() => handleSpareBatterySelect(spare)}
                  style={{
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    opacity: spare.quantity > 0 ? 1 : 0.5,
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{spare.battery_model}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b' }}>
                    {spare.battery_code} | {spare.manufacturer} | Qty: {spare.quantity} | {spare.location}
                  </div>
                  <div style={{ fontSize: isMobile ? '10px' : '11px', color: spare.is_low_quantity ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                    {spare.capacity} | {spare.voltage} | {spare.current_condition}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedSpareBattery && (
            <div style={{
              marginTop: '8px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              background: '#dbeafe',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                <strong>Selected Spare:</strong> {selectedSpareBattery.battery_model} - {selectedSpareBattery.battery_code}
                <span style={{ marginLeft: '8px', color: '#059669' }}>
                  (Stock: {selectedSpareBattery.quantity})
                </span>
              </span>
              <button
                type="button"
                onClick={handleRemoveSpareBattery}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px'
                }}
                title="Remove spare battery"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Batteries Summary */}
      {(selectedOriginalBattery || selectedSpareBattery) && (
        <div style={{
          marginTop: isMobile ? '16px' : '20px',
          padding: isMobile ? '10px 12px' : '12px 16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: isMobile ? '13px' : '14px', fontWeight: 600, color: '#0369a1' }}>
            Selected Batteries:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: isMobile ? '12px' : '13px' }}>
            {selectedOriginalBattery && (
              <li>
                <strong>Original Battery:</strong> {selectedOriginalBattery.battery_model} - {selectedOriginalBattery.battery_serial}
              </li>
            )}
            {selectedSpareBattery && (
              <li>
                <strong>Spare Battery:</strong> {selectedSpareBattery.battery_model} - {selectedSpareBattery.battery_code}
                <span style={{ marginLeft: '8px', color: '#059669' }}>
                  (Will be removed from stock)
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Reset All Button */}
      {(selectedOriginalBattery || selectedSpareBattery) && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <motion.button
            type="button"
            onClick={handleResetAllSelections}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: isMobile ? '6px 12px' : '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              fontSize: isMobile ? '12px' : '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiRefreshCw size={isMobile ? 10 : 12} /> Reset All Selections
          </motion.button>
        </div>
      )}

      {/* Service Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'),
        gap: isMobile ? '16px' : '20px',
        marginTop: isMobile ? '16px' : '20px'
      }}>
        <div className="form-group" style={{ position: 'relative' }} ref={staffDropdownRef}>
          <label htmlFor="staff_search" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiUsers style={{ marginRight: '6px', color: '#10b981' }} /> Service Staff
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="staff_search"
              value={staffSearch}
              onChange={(e) => {
                setStaffSearch(e.target.value);
                setShowStaffDropdown(true);
              }}
              onFocus={() => setShowStaffDropdown(true)}
              placeholder="Search by name or role..."
              style={{
                width: '100%',
                padding: isMobile ? '8px 32px 8px 10px' : '10px 36px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px'
              }}
              disabled={loadingData.staff || loadingData.service}
            />
            {loadingData.staff ? (
              <FiLoader className="spinning" style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            ) : (
              <FiSearch style={{
                position: 'absolute',
                right: isMobile ? '8px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: isMobile ? '14px' : '16px'
              }} />
            )}
          </div>
          {showStaffDropdown && filteredStaff.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '250px',
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {filteredStaff.map(staff => (
                <div
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff)}
                  style={{
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 500, color: '#0f172a' }}>{staff.name}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b' }}>
                    {staff.role} | {staff.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 2' : 'span 2') }}>
          <label htmlFor="issue_description" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiInfo style={{ marginRight: '6px', color: '#10b981' }} /> Issue Description
          </label>
          <textarea
            id="issue_description"
            name="issue_description"
            value={serviceForm.issue_description}
            onChange={onServiceInputChange}
            placeholder="Describe the issue in detail..."
            rows={isMobile ? 3 : 4}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>Service Status *</label>
          <select
            id="status"
            name="status"
            value={serviceForm.status}
            onChange={onServiceInputChange}
            required
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="charging">Charging</option>
            <option value="testing">Testing</option>
            <option value="repair">Repair</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>Priority</label>
          <select
            id="priority"
            name="priority"
            value={serviceForm.priority}
            onChange={onServiceInputChange}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="battery_claim" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiBox style={{ marginRight: '6px', color: '#10b981' }} /> Battery Claim *
          </label>
          <select
            id="battery_claim"
            name="battery_claim"
            value={serviceForm.battery_claim}
            onChange={onServiceInputChange}
            required
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="shop_claim">Shop Claim</option>
            <option value="company_claim">Company Claim</option>
            <option value="none">No Claim</option>
          </select>
          <small style={{ color: '#64748b', fontSize: isMobile ? '11px' : '12px', marginTop: '4px', display: 'block' }}>
            Select who will cover the battery replacement cost
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="warranty_status" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>Warranty Status *</label>
          <select
            id="warranty_status"
            name="warranty_status"
            value={serviceForm.warranty_status}
            onChange={onServiceInputChange}
            required
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="in_warranty">In Warranty</option>
            <option value="extended_warranty">Extended Warranty</option>
            <option value="out_of_warranty">Out of Warranty</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amc_status" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>AMC Status</label>
          <select
            id="amc_status"
            name="amc_status"
            value={serviceForm.amc_status}
            onChange={onServiceInputChange}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="no_amc">No AMC</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimated_cost" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiDollarSign style={{ marginRight: '6px', color: '#10b981' }} /> Estimated Cost (₹)
          </label>
          <input
            type="number"
            id="estimated_cost"
            name="estimated_cost"
            value={serviceForm.estimated_cost}
            onChange={onServiceInputChange}
            placeholder="Enter estimated cost"
            min="0"
            step="0.01"
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="final_cost" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiDollarSign style={{ marginRight: '6px', color: '#10b981' }} /> Final Cost (₹)
          </label>
          <input
            type="number"
            id="final_cost"
            name="final_cost"
            value={serviceForm.final_cost}
            onChange={onServiceInputChange}
            placeholder="Enter final cost"
            min="0"
            step="0.01"
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="deposit_amount" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiDollarSign style={{ marginRight: '6px', color: '#10b981' }} /> Deposit Amount (₹)
          </label>
          <input
            type="number"
            id="deposit_amount"
            name="deposit_amount"
            value={serviceForm.deposit_amount}
            onChange={onServiceInputChange}
            placeholder="Enter deposit amount"
            min="0"
            step="0.01"
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_status" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>Payment Status</label>
          <select
            id="payment_status"
            name="payment_status"
            value={serviceForm.payment_status}
            onChange={onServiceInputChange}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              background: 'white'
            }}
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimated_completion_date" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiCalendar style={{ marginRight: '6px', color: '#10b981' }} /> Estimated Completion Date
          </label>
          <input
            type="date"
            id="estimated_completion_date"
            name="estimated_completion_date"
            value={serviceForm.estimated_completion_date}
            onChange={onServiceInputChange}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px'
            }}
          />
        </div>

        <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <label htmlFor="notes" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500, 
            color: '#334155',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <FiFileText style={{ marginRight: '6px', color: '#10b981' }} /> Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={serviceForm.notes}
            onChange={onServiceInputChange}
            placeholder="Any additional notes..."
            rows={isMobile ? 2 : 3}
            disabled={loadingData.service}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Replacement Battery Section - Only shown if NO spare battery selected */}
      {!selectedSpareBattery && (
        <div className="replacement-battery-section" style={{
          marginTop: isMobile ? '24px' : '30px',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          background: '#f8fafc'
        }}>
          <div className="section-header" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '16px',
            gap: isMobile ? '12px' : '0'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: 600, 
              color: '#0f172a', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <FiBatteryCharging color="#10b981" size={isMobile ? 18 : 20} /> Replacement Battery
            </h3>
            {!serviceForm.showReplacementForm ? (
              <motion.button
                type="button"
                className="btn outline small"
                onClick={onToggleReplacementBatteryForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: isMobile ? '8px 16px' : '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  background: 'white',
                  color: '#10b981',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                <FiPlus size={isMobile ? 14 : 16} /> Add Replacement Battery
              </motion.button>
            ) : (
              <motion.button
                type="button"
                className="btn outline small"
                onClick={onToggleReplacementBatteryForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: isMobile ? '8px 16px' : '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  background: 'white',
                  color: '#ef4444',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                <FiX size={isMobile ? 14 : 16} /> Hide
              </motion.button>
            )}
          </div>

          {serviceForm.showReplacementForm && (
            <motion.div 
              className="replacement-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'),
                gap: isMobile ? '12px' : '16px'
              }}>
                <div className="form-group">
                  <label htmlFor="replacement_battery_model" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Battery Model *</label>
                  <input
                    type="text"
                    id="replacement_battery_model"
                    name="replacement_battery_model"
                    value={serviceForm.replacement_battery_model}
                    onChange={onServiceInputChange}
                    placeholder="Enter battery model"
                    required={serviceForm.showReplacementForm}
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_serial" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Serial Number *</label>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
                    <input
                      type="text"
                      id="replacement_battery_serial"
                      name="replacement_battery_serial"
                      value={serviceForm.replacement_battery_serial}
                      onChange={(e) => handleBarcodeInputChange(e, 'replacement')}
                      placeholder="Enter serial number"
                      required={serviceForm.showReplacementForm}
                      ref={replacementBarcodeInputRef}
                      disabled={loadingData.service || loadingData.replacementBattery}
                      style={{
                        flex: 1,
                        padding: isMobile ? '8px 10px' : '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: isMobile ? '13px' : '14px'
                      }}
                    />
                    <motion.button
                      type="button"
                      className="scan-serial-btn"
                      onClick={onStartReplacementBatterySerialScan}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        padding: isMobile ? '8px 12px' : '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: scanningReplacementSerial ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        fontSize: isMobile ? '12px' : '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        justifyContent: 'center'
                      }}
                      disabled={loadingData.service || loadingData.replacementBattery}
                    >
                      <FiRadio size={isMobile ? 14 : 16} />
                      {scanningReplacementSerial ? 'Scanning...' : 'Scan'}
                    </motion.button>
                  </div>
                  {scanningReplacementSerial && (
                    <div style={{
                      marginTop: '6px',
                      padding: isMobile ? '4px 8px' : '6px 12px',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      fontSize: isMobile ? '11px' : '12px',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <FiInfo size={isMobile ? 12 : 14} /> Scanning mode active. Type serial number and press Enter.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_brand" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Brand</label>
                  <input
                    type="text"
                    id="replacement_battery_brand"
                    name="replacement_battery_brand"
                    value={serviceForm.replacement_battery_brand}
                    onChange={onServiceInputChange}
                    placeholder="Enter brand"
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_capacity" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Capacity</label>
                  <input
                    type="text"
                    id="replacement_battery_capacity"
                    name="replacement_battery_capacity"
                    value={serviceForm.replacement_battery_capacity}
                    onChange={onServiceInputChange}
                    placeholder="e.g., 150AH"
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_type" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Battery Type</label>
                  <select
                    id="replacement_battery_type"
                    name="replacement_battery_type"
                    value={serviceForm.replacement_battery_type}
                    onChange={onServiceInputChange}
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px',
                      background: 'white'
                    }}
                  >
                    <option value="lead_acid">Lead Acid</option>
                    <option value="lithium_ion">Lithium Ion</option>
                    <option value="gel">Gel</option>
                    <option value="agm">AGM</option>
                    <option value="tubular">Tubular</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_voltage" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Voltage</label>
                  <select
                    id="replacement_battery_voltage"
                    name="replacement_battery_voltage"
                    value={serviceForm.replacement_battery_voltage}
                    onChange={onServiceInputChange}
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px',
                      background: 'white'
                    }}
                  >
                    <option value="12V">12V</option>
                    <option value="24V">24V</option>
                    <option value="48V">48V</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_price" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Price (₹)</label>
                  <input
                    type="number"
                    id="replacement_battery_price"
                    name="replacement_battery_price"
                    value={serviceForm.replacement_battery_price}
                    onChange={onServiceInputChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_battery_warranty" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Warranty Period</label>
                  <input
                    type="text"
                    id="replacement_battery_warranty"
                    name="replacement_battery_warranty"
                    value={serviceForm.replacement_battery_warranty}
                    onChange={onServiceInputChange}
                    placeholder="e.g., 2 years"
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="replacement_installation_date" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Installation Date</label>
                  <input
                    type="date"
                    id="replacement_installation_date"
                    name="replacement_installation_date"
                    value={serviceForm.replacement_installation_date}
                    onChange={onServiceInputChange}
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '8px 10px' : '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label htmlFor="replacement_battery_notes" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: 500, 
                    color: '#334155',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>Notes</label>
                  <textarea
                    id="replacement_battery_notes"
                    name="replacement_battery_notes"
                    value={serviceForm.replacement_battery_notes}
                    onChange={onServiceInputChange}
                    placeholder="Any notes about the replacement battery..."
                    rows={isMobile ? 2 : 3}
                    disabled={loadingData.service || loadingData.replacementBattery}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <motion.button
                    type="button"
                    className="btn secondary small"
                    onClick={onCopyOriginalBatteryDetails}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: isMobile ? '10px 16px' : '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid #64748b',
                      background: 'white',
                      color: '#334155',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center'
                    }}
                    disabled={loadingData.service || !selectedOriginalBattery || loadingData.replacementBattery}
                  >
                    <FiCopy size={isMobile ? 14 : 16} /> Copy Original Battery Details
                  </motion.button>
                  <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: isMobile ? '11px' : '12px' }}>
                    This will copy the details from the original battery to the replacement form
                  </small>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Show message when spare battery is selected */}
      {selectedSpareBattery && (
        <div style={{
          marginTop: isMobile ? '16px' : '20px',
          padding: isMobile ? '12px' : '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd',
          textAlign: 'center',
          fontSize: isMobile ? '13px' : '14px'
        }}>
          <FiInfo style={{ color: '#0369a1', marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />
          <span style={{ color: '#0369a1' }}>
            Spare battery selected. Replacement will be automatically handled from spare inventory.
          </span>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'flex-end',
        gap: isMobile ? '12px' : '12px',
        marginTop: isMobile ? '24px' : '30px'
      }}>
        <motion.button
          type="button"
          className="btn outline"
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: isMobile ? '12px 20px' : '12px 24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#64748b',
            fontSize: isMobile ? '14px' : '14px',
            fontWeight: 500,
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          className="btn primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: isMobile ? '12px 20px' : '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontSize: isMobile ? '14px' : '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            width: isMobile ? '100%' : 'auto'
          }}
          disabled={loading.services || loading.replacement_battery || loadingData.service || loadingData.replacementBattery}
        >
          <FiSave size={isMobile ? 16 : 18} />
          {editMode ? 'Update Service Order' : 'Create Service Order'}
          {(loading.services || loading.replacement_battery) && '...'}
        </motion.button>
      </div>
    </form>
  );

  const renderFormContent = () => {
    switch(formType) {
      case 'service':
        return renderServiceForm();
      default:
        return null;
    }
  };

  if (!showForm) return null;

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          width: isMobile ? '100%' : '90%',
          maxWidth: isMobile ? '100%' : '900px',
          maxHeight: isMobile ? '90vh' : '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          position: 'relative',
          margin: isMobile ? 0 : '0 auto'
        }}
      >
        <div className="modal-header" style={{
          padding: isMobile ? '16px 20px' : '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div className="modal-title">
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#0f172a' }}>{getFormTitle()}</h2>
            <p style={{ margin: '4px 0 0', fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>{getFormDescription()}</p>
          </div>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: isMobile ? '20px' : '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: isMobile ? '4px' : '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={loadingData.service}
          >
            <FiX size={isMobile ? 20 : 24} />
          </motion.button>
        </div>
        
        <div style={{ 
          overflowY: 'auto', 
          maxHeight: isMobile ? 'calc(90vh - 60px)' : 'calc(90vh - 80px)',
          WebkitOverflowScrolling: 'touch'
        }}>
          {renderFormContent()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceFormModal;