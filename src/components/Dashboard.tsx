// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMenu,
  FiSearch,
  FiBell,
  FiRefreshCw,
  FiRadio,
  FiChevronUp,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiBattery,
  FiBatteryCharging,
  FiBox,
  FiTruck,
  FiClock,
  FiInfo,
  FiFileText,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiDownload,
  FiUpload,
  FiPrinter,
  FiSettings,
  FiLogOut,
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiArchive,
  FiRepeat,
  FiShield,
  FiAward
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import DashboardTab from "./DashboardTab";
import ServicesTab from "./ServicesTab";
import ClientsTab from "./ClientsTab";
import ProductsTab from "./ProductsTab";
import DeliveriesTab from "./DeliveriesTab";
import ReplacementTab from "./replacementTab";
import SpareTab from "./SpareTab";
import SunToCompTab from "./SuntocompTab";
import ComptosunTab from "./ComptosunTab";
import ShopClaimTab from "./ShopClaimTab";
import ServiceDetailModal from "./modals/ServiceDetailModal";
import ServiceFormModal from "./modals/ServiceFormModal";
import CustomerFormModal from "./modals/CustomerFormModal";
import CustomerDetailModal from "./modals/CustomerDetailModal";
import ProductFormModal from "./modals/ProductFormModal";
import ProductDetailModal from "./modals/ProductDetailModal";
import DeliveryDetailModal from "./modals/DeliveryDetailModal";
import DeliveryFormModal from "./modals/DeliveryFormModal";
import ReplacementDetailModal from "./modals/ReplacementDetailModal";
import ReplacementFormModal from "./modals/ReplacementFormModal";
import SpareFormModal from "./modals/SpareFormModal";
import SpareDetailModal from "./modals/SpareDetailModal";
import SunToCompDetailModal from "./modals/SuntocompDetailModal";
import SunToCompFormModal from "./modals/SuntocompFormModal";
import ComptosunDetailModal from "./modals/ComptosunDetailModal";
import ComptosunFormModal from "./modals/ComptosunFormModal";
import CompclaimDetailModal from "./modals/CompclaimDetailModal";
import CompclaimFormModal from "./modals/CompclaimFormModal";
import ShopClaimFormModal from "./modals/ShopClaimFormModal";
import ShopClaimDetailModal from "./modals/ShopClaimDetailModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import CompclaimTab from "./CompclaimTab";

import "./css/Dashboard.css";
import "./css/Spare.css";
import "./css/Suntocomp.css";
import "./css/ComptosunDetailModal.css";
import "./css/ShopClaim.css";
import "./css/Compclaim.css";

// Type Definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  is_active?: number;
  last_login?: string;
}

interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  battery_model: string;
  battery_serial: string;
  inverter_model: string;
  inverter_serial: string;
  issue_description: string;
  status: string;
  priority: string;
  payment_status: string;
  estimated_cost: string;
  final_cost: string;
  created_at: string;
  warranty_status: string;
  amc_status: string;
  battery_claim: string;
  estimated_completion_date: string;
  notes: string;
  customer_id?: number;
  battery_id?: number;
  inverter_id?: number;
  service_staff_id?: number;
  service_staff_name?: string;
  deposit_amount?: string;
  replacement_battery_serial?: string;
  customer_email?: string;
  customer_address?: string;
  inverter_brand?: string;
  battery_brand?: string;
  inverter_capacity?: string;
  battery_capacity?: string;
  battery_type?: string;
  inverter_type?: string;
  warranty_period?: string;
  warranty_expiry_date?: string;
  warranty_remarks?: string;
  spare_battery_id?: number | null;
  spare_battery_model?: string;
  spare_battery_manufacturer?: string;
  use_spare_battery?: boolean;
}

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
  service_count?: number;
  last_service_date?: string;
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
  price: string;
  warranty_period: string;
  amc_period: string;
  inverter_model: string;
  battery_condition: string;
  is_spare: any;
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
  warranty_expiry_date?: string;
  warranty_remarks?: string;
}

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

interface ReplacementBattery {
  id: string;
  service_order_id: string;
  battery_model: string;
  battery_serial: string;
  brand: string;
  capacity: string;
  voltage: string;
  battery_type: string;
  price: string;
  warranty_period: string;
  installation_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
  service_code: string;
  customer_id: string;
  service_status: string;
  customer_name: string;
  customer_phone: string;
  original_battery_model: string;
  original_battery_serial: string;
  warranty_status?: string;
  warranty_expiry_date?: string;
}

interface SpareBattery {
  id: string;
  battery_code: string;
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
  is_spare: number;
  warranty_status?: string;
  warranty_expiry_date?: string;
  is_low_quantity?: number;
}

interface ShopClaim {
  id: string;
  claim_code: string;
  battery_id: string;
  battery_model: string;
  battery_serial: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_code: string;
  issue_description: string;
  claim_type: string;
  priority: string;
  status: string;
  claim_date: string;
  expected_resolution_date: string;
  resolved_date: string | null;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  capacity?: string;
  voltage?: string;
  battery_type?: string;
  warranty_status?: string;
}

interface DashboardStats {
  total_services: number;
  pending_services: number;
  total_customers: number;
  total_batteries: number;
  completed_services: number;
  spare_batteries: number;
  active_deliveries: number;
  total_replacements: number;
  pending_replacements: number;
  delivered_replacements: number;
  shop_claims?: number;
  pending_shop_claims?: number;
  resolved_shop_claims?: number;
  allocated_spares?: number;
  available_spares?: number;
  company_claims?: number;
  pending_company_claims?: number;
  resolved_company_claims?: number;
  [key: string]: any;
}

interface Activity {
  activity: string;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  services?: ServiceOrder[];
  customers?: Customer[];
  batteries?: Battery[];
  deliveries?: Delivery[];
  replacements?: ReplacementBattery[];
  data?: any;
  spares?: SpareBattery[];
  shop_claims?: ShopClaim[];
  stats?: any;
  recent_services?: ServiceOrder[];
  count?: number;
  warranty_status?: string;
  amc_status?: string;
  replacement_battery?: ReplacementBattery;
  replacement_id?: number;
  service_id?: number;
}

interface DashboardProps {
  onLogout: () => void;
}

// Helper function to parse is_spare field consistently
const parseIsSpare = (value: any): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const str = value.toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'yes' || str === 'y' || str === 'on';
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return Boolean(value);
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // User state - Initialize as null and load from localStorage after mount
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  
  // UI states
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [showServiceForm, setShowServiceForm] = useState<boolean>(false);
  const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState<boolean>(false);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false);
  const [showDeliveryDetail, setShowDeliveryDetail] = useState<boolean>(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState<boolean>(false);
  const [showReplacementForm, setShowReplacementForm] = useState<boolean>(false);
  const [showReplacementDetail, setShowReplacementDetail] = useState<boolean>(false);
  const [showSpareForm, setShowSpareForm] = useState<boolean>(false);
  const [showSpareDetail, setShowSpareDetail] = useState<boolean>(false);
  const [showSunToCompForm, setShowSunToCompForm] = useState<boolean>(false);
  const [showSunToCompDetail, setShowSunToCompDetail] = useState<boolean>(false);
  const [showComptosunForm, setShowComptosunForm] = useState<boolean>(false);
  const [showComptosunDetail, setShowComptosunDetail] = useState<boolean>(false);
  const [showCompclaimForm, setShowCompclaimForm] = useState<boolean>(false);
  const [showCompclaimDetail, setShowCompclaimDetail] = useState<boolean>(false);
  const [showShopClaimForm, setShowShopClaimForm] = useState<boolean>(false);
  const [showShopClaimDetail, setShowShopClaimDetail] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data states
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementBattery | null>(null);
  const [selectedSpare, setSelectedSpare] = useState<SpareBattery | null>(null);
  const [selectedSunToComp, setSelectedSunToComp] = useState<Battery | null>(null);
  const [selectedComptosun, setSelectedComptosun] = useState<Battery | null>(null);
  const [selectedCompclaim, setSelectedCompclaim] = useState<Battery | null>(null);
  const [selectedShopClaim, setSelectedShopClaim] = useState<ShopClaim | null>(null);
  const [deleteItem, setDeleteItem] = useState<{type: string, id: number | string} | null>(null);
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [replacements, setReplacements] = useState<ReplacementBattery[]>([]);
  const [spares, setSpares] = useState<SpareBattery[]>([]);
  const [shopClaims, setShopClaims] = useState<ShopClaim[]>([]);
  const [recentServices, setRecentServices] = useState<ServiceOrder[]>([]);
  const [sunToCompBatteries, setSunToCompBatteries] = useState<Battery[]>([]);
  const [comptosunBatteries, setComptosunBatteries] = useState<Battery[]>([]);
  const [compclaimBatteries, setCompclaimBatteries] = useState<Battery[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_services: 0,
    pending_services: 0,
    total_customers: 0,
    total_batteries: 0,
    completed_services: 0,
    spare_batteries: 0,
    active_deliveries: 0,
    total_replacements: 0,
    pending_replacements: 0,
    delivered_replacements: 0,
    shop_claims: 0,
    pending_shop_claims: 0,
    resolved_shop_claims: 0,
    company_claims: 0,
    pending_company_claims: 0,
    resolved_company_claims: 0
  });
  const [activities] = useState<Activity[]>([
    { activity: "Dashboard loaded successfully", timestamp: new Date().toLocaleTimeString() }
  ]);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterClaimType, setFilterClaimType] = useState<string>("all");
  const [filterBatteryType, setFilterBatteryType] = useState<string>("all");
  const [filterSpareStatus, setFilterSpareStatus] = useState<string>("all");
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState<string>("all");
  const [filterDeliveryType, setFilterDeliveryType] = useState<string>("all");
  const [filterReplacementStatus, setFilterReplacementStatus] = useState<string>("all");
  const [filterAllocationStatus, setFilterAllocationStatus] = useState<string>("all");
  const [filterSunToCompStatus, setFilterSunToCompStatus] = useState<string>("all");
  const [filterComptosunStatus, setFilterComptosunStatus] = useState<string>("all");
  const [filterCompclaimStatus, setFilterCompclaimStatus] = useState<string>("all");
  const [filterShopClaimStatus, setFilterShopClaimStatus] = useState<string>("all");
  const [filterShopClaimType, setFilterShopClaimType] = useState<string>("all");
  const [filterShopClaimPriority, setFilterShopClaimPriority] = useState<string>("all");
  const [filterWarrantyStatus, setFilterWarrantyStatus] = useState<string>("all");
  
  // Service form state
  const [serviceForm, setServiceForm] = useState({
    customer_id: null as number | null,
    customer_phone: "",
    inverter_id: null as number | null,
    battery_id: null as number | null,
    service_type: "battery_service",
    issue_description: "",
    battery_claim: "none",
    status: "pending",
    warranty_status: "in_warranty",
    amc_status: "no_amc",
    estimated_cost: "",
    final_cost: "",
    deposit_amount: "",
    payment_status: "pending",
    estimated_completion_date: "",
    priority: "medium",
    notes: "",
    service_staff_id: null as number | null,
    customer_name: "",
    inverter_model: "",
    battery_model: "",
    showReplacementForm: false,
    replacement_battery_model: "",
    replacement_battery_serial: "",
    replacement_battery_brand: "",
    replacement_battery_capacity: "",
    replacement_battery_type: "",
    replacement_battery_voltage: "",
    replacement_battery_price: "",
    replacement_battery_warranty: "",
    replacement_installation_date: "",
    replacement_battery_notes: "",
    warranty_period: "",
    warranty_expiry_date: "",
    warranty_remarks: "",
    spare_battery_id: null as number | null,
    use_spare_battery: false,
    battery_source: 'none' as 'original' | 'spare' | 'none'
  });
  
  // Local state for battery search
  const [batterySearch, setBatterySearch] = useState('');
  const [spareBatterySearch, setSpareBatterySearch] = useState('');
  const [selectedSpareBattery, setSelectedSpareBattery] = useState<SpareBattery | null>(null);
  
  // Barcode scanning states
  const [scanningSerial, setScanningSerial] = useState(false);
  const [scanningReplacementSerial, setScanningReplacementSerial] = useState(false);
  
  // API Base URL
  const API_BASE_URL = "http://localhost/sun_powers/api";
  
  // Refs
  const dashboardContentRef = useRef<HTMLDivElement>(null);
  
  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        onLogout();
        return;
      }
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser({
            id: parsedUser.id,
            name: parsedUser.name || userName || 'User',
            email: parsedUser.email || userEmail || '',
            role: parsedUser.role || userRole || 'user',
            avatar: parsedUser.avatar || '',
            phone: parsedUser.phone || '',
            is_active: parsedUser.is_active,
            last_login: parsedUser.last_login
          });
          console.log('User loaded from localStorage:', parsedUser);
        } catch (e) {
          console.error('Error parsing user data:', e);
          setUser({
            id: 0,
            name: userName || 'User',
            email: userEmail || '',
            role: userRole || 'user',
            avatar: ''
          });
        }
      } else if (userName) {
        setUser({
          id: 0,
          name: userName,
          email: userEmail || '',
          role: userRole || 'user',
          avatar: ''
        });
        console.log('User created from name/role/email:', { name: userName, role: userRole, email: userEmail });
      } else {
        console.log('No user data found in localStorage, but token exists');
        fetchUserData();
      }
      
      setIsLoadingUser(false);
    };
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/user.php`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.email) {
              localStorage.setItem('userEmail', data.user.email);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    loadUserData();
  }, [onLogout]);
  
  // Effects
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setSidebarOpen(false);
      } else if (tablet) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (dashboardContentRef.current) {
        const { scrollTop } = dashboardContentRef.current;
        setShowScrollTop(scrollTop > 300);
      }
    };
    
    const contentElement = dashboardContentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Load data based on active tab
  useEffect(() => {
    if (!user && !isLoadingUser) {
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        switch(activeTab) {
          case 'dashboard':
            await Promise.all([
              loadDashboardData(),
              loadServices(),
              loadSpares(),
              loadDeliveries(),
              loadReplacements(),
              loadComptosunBatteries(),
              loadSunToCompBatteries(),
              loadCompclaimBatteries(),
              loadShopClaims()
            ]);
            calculateAdditionalStats();
            break;
          case 'services':
            await loadServices();
            break;
          case 'customers':
            await loadCustomers();
            break;
          case 'batteries':
            await loadBatteries();
            break;
          case 'delivery':
            await loadDeliveries();
            break;
          case 'replacement':
            await loadReplacements();
            break;
          case 'spare_batteries':
            await loadSpares();
            break;
          case 'sun_powers_to_company':
            await loadSunToCompBatteries();
            break;
          case 'company_to_sun_powers':
            await loadComptosunBatteries();
            break;
          case 'company_claims':
            await loadCompclaimBatteries();
            break;
          case 'shop_claims':
            await loadShopClaims();
            break;
          default:
            break;
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError(`Failed to load ${activeTab} data. Please check your connection.`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab, user, isLoadingUser]);
  
  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard_stats.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        if (data.stats) {
          setDashboardStats(prev => ({
            ...prev,
            total_services: parseInt(data.stats?.total_services?.toString() || '0'),
            pending_services: parseInt(data.stats?.active_services?.toString() || '0'),
            total_customers: parseInt(data.stats?.total_customers?.toString() || '0'),
            total_batteries: parseInt(data.stats?.total_batteries?.toString() || '0'),
            completed_services: parseInt(data.stats?.status_completed?.toString() || '0'),
            status_pending: data.stats?.status_pending || 0,
            status_scheduled: data.stats?.status_scheduled || 0,
            status_in_progress: data.stats?.status_in_progress || 0,
            status_charging: data.stats?.status_charging || 0,
            status_testing: data.stats?.status_testing || 0,
            status_repair: data.stats?.status_repair || 0,
            status_completed: data.stats?.status_completed || 0,
            status_ready: data.stats?.status_ready || 0,
            status_delivered: data.stats?.status_delivered || 0,
            status_cancelled: data.stats?.status_cancelled || 0,
            priority_urgent: data.stats?.priority_urgent || 0,
            priority_high: data.stats?.priority_high || 0,
            priority_medium: data.stats?.priority_medium || 0,
            priority_low: data.stats?.priority_low || 0,
          }));
        }
        
        if (data.recent_services) {
          const formattedRecentServices: ServiceOrder[] = data.recent_services.map((service: any) => ({
            id: parseInt(service.id),
            service_code: service.service_code || '',
            customer_name: service.customer_name || '',
            customer_phone: service.customer_phone || '',
            service_type: service.service_type || '',
            battery_model: service.battery_model || '',
            battery_serial: service.battery_serial || '',
            inverter_model: service.inverter_model || '',
            inverter_serial: service.inverter_serial || '',
            issue_description: service.issue_description || '',
            status: service.status || '',
            priority: service.priority || '',
            payment_status: service.payment_status || '',
            estimated_cost: service.estimated_cost || '',
            final_cost: service.final_cost || '',
            created_at: service.created_at || '',
            warranty_status: service.warranty_status || 'in_warranty',
            amc_status: service.amc_status || '',
            battery_claim: service.battery_claim || '',
            estimated_completion_date: service.estimated_completion_date || '',
            notes: service.notes || '',
            customer_id: parseInt(service.customer_id || '0'),
            battery_id: parseInt(service.battery_id || '0'),
            inverter_id: parseInt(service.inverter_id || '0'),
            service_staff_id: parseInt(service.service_staff_id || '0'),
            service_staff_name: service.service_staff_name || '',
            deposit_amount: service.deposit_amount || '',
            replacement_battery_serial: service.replacement_battery_serial || '',
            battery_brand: service.battery_brand || '',
            battery_capacity: service.battery_capacity || '',
            battery_type: service.battery_type || '',
            warranty_period: service.warranty_period || '',
            warranty_expiry_date: service.warranty_expiry_date || '',
            warranty_remarks: service.warranty_remarks || '',
            spare_battery_id: service.spare_battery_id ? parseInt(service.spare_battery_id) : null,
            spare_battery_model: service.spare_battery_model || '',
            spare_battery_manufacturer: service.spare_battery_manufacturer || ''
          }));
          setRecentServices(formattedRecentServices);
        }
        
        setSuccessMessage('Dashboard data loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load dashboard data');
      }
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  };
  
  // Load services from API
  const loadServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.services) {
        const formattedServices: ServiceOrder[] = data.services.map((service: any) => ({
          id: parseInt(service.id),
          service_code: service.service_code || '',
          customer_name: service.customer_name || '',
          customer_phone: service.customer_phone || '',
          service_type: service.service_type || '',
          battery_model: service.battery_model || '',
          battery_serial: service.battery_serial || '',
          inverter_model: service.inverter_model || '',
          inverter_serial: service.inverter_serial || '',
          issue_description: service.issue_description || '',
          status: service.status || '',
          priority: service.priority || '',
          payment_status: service.payment_status || '',
          estimated_cost: service.estimated_cost || '',
          final_cost: service.final_cost || '',
          created_at: service.created_at || '',
          warranty_status: service.warranty_status || 'in_warranty',
          amc_status: service.amc_status || '',
          battery_claim: service.battery_claim || '',
          estimated_completion_date: service.estimated_completion_date || '',
          notes: service.notes || '',
          customer_id: parseInt(service.customer_id || '0'),
          battery_id: parseInt(service.battery_id || '0'),
          inverter_id: parseInt(service.inverter_id || '0'),
          service_staff_id: parseInt(service.service_staff_id || '0'),
          service_staff_name: service.service_staff_name || '',
          deposit_amount: service.deposit_amount || '',
          replacement_battery_serial: service.replacement_battery_serial || '',
          battery_brand: service.battery_brand || '',
          battery_capacity: service.battery_capacity || '',
          battery_type: service.battery_type || '',
          warranty_period: service.warranty_period || '',
          warranty_expiry_date: service.warranty_expiry_date || '',
          warranty_remarks: service.warranty_remarks || '',
          spare_battery_id: service.spare_battery_id ? parseInt(service.spare_battery_id) : null,
          spare_battery_model: service.spare_battery_model || '',
          spare_battery_manufacturer: service.spare_battery_manufacturer || ''
        }));
        setServices(formattedServices);
        setSuccessMessage('Services loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load services');
      }
      
    } catch (error: any) {
      console.error('Error loading services:', error);
      throw error;
    }
  };
  
  // Load customers from API
  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.customers) {
        const customersWithServiceCount = data.customers.map((customer: any) => {
          const serviceCount = services.filter(service => 
            service.customer_name === customer.full_name || 
            service.customer_phone === customer.phone
          ).length;
          
          const customerServices = services.filter(service => 
            service.customer_name === customer.full_name || 
            service.customer_phone === customer.phone
          );
          
          const lastServiceDate = customerServices.length > 0
            ? new Date(Math.max(...customerServices.map(s => new Date(s.created_at).getTime()))).toISOString()
            : undefined;
          
          return {
            ...customer,
            service_count: serviceCount,
            last_service_date: lastServiceDate
          };
        });
        
        setCustomers(customersWithServiceCount);
        setSuccessMessage('Customers loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load customers');
      }
      
    } catch (error: any) {
      console.error('Error loading customers:', error);
      throw error;
    }
  };
  
  // Load batteries from API
  const loadBatteries = async () => {
    try {
      console.log('Loading batteries from API...');
      const response = await fetch(`${API_BASE_URL}/batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.batteries) {
        const formattedBatteries: Battery[] = data.batteries.map((battery: any) => {
          const isSpareValue = parseIsSpare(battery.is_spare);
          
          return {
            id: parseInt(battery.id),
            battery_code: battery.battery_code || '',
            battery_model: battery.battery_model || '',
            battery_serial: battery.battery_serial || '',
            brand: battery.brand || '',
            capacity: battery.capacity || '',
            voltage: battery.voltage || '12V',
            battery_type: battery.battery_type || 'lead_acid',
            category: battery.category || 'inverter',
            price: battery.price || '0',
            warranty_period: battery.warranty_period || '',
            amc_period: battery.amc_period || '0',
            inverter_model: battery.inverter_model || '',
            battery_condition: battery.battery_condition || 'good',
            is_spare: isSpareValue,
            spare_status: battery.spare_status || 'available',
            created_at: battery.created_at || new Date().toISOString(),
            total_services: parseInt(battery.total_services || '0'),
            specifications: battery.specifications || '',
            purchase_date: battery.purchase_date || '',
            installation_date: battery.installation_date || '',
            last_service_date: battery.last_service_date || '',
            stock_quantity: battery.stock_quantity || '0',
            claim_type: battery.claim_type || '',
            status: battery.status || '',
            shop_stock_quantity: battery.shop_stock_quantity || '0',
            company_stock_quantity: battery.company_stock_quantity || '0',
            tracking_status: battery.tracking_status || 'active',
            warranty_expiry_date: battery.warranty_expiry_date || '',
            warranty_remarks: battery.warranty_remarks || ''
          };
        });
        
        setBatteries(formattedBatteries);
        setSuccessMessage('Batteries loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load batteries');
      }
      
    } catch (error: any) {
      console.error('Error loading batteries:', error);
      throw error;
    }
  };

  // Load sun_powers_to_company batteries
  const loadSunToCompBatteries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.batteries) {
        const filteredBatteries = data.batteries.filter((battery: any) => 
          battery.claim_type && battery.claim_type.toLowerCase() === "suntocomp"
        );
        
        const formattedBatteries: Battery[] = filteredBatteries.map((battery: any) => {
          const isSpareValue = parseIsSpare(battery.is_spare);
          
          return {
            id: parseInt(battery.id),
            battery_code: battery.battery_code || '',
            battery_model: battery.battery_model || '',
            battery_serial: battery.battery_serial || '',
            brand: battery.brand || '',
            capacity: battery.capacity || '',
            voltage: battery.voltage || '12V',
            battery_type: battery.battery_type || 'lead_acid',
            category: battery.category || 'inverter',
            price: battery.price || '0',
            warranty_period: battery.warranty_period || '',
            amc_period: battery.amc_period || '0',
            inverter_model: battery.inverter_model || '',
            battery_condition: battery.battery_condition || 'good',
            is_spare: isSpareValue,
            spare_status: battery.spare_status || 'available',
            created_at: battery.created_at || new Date().toISOString(),
            total_services: parseInt(battery.total_services || '0'),
            specifications: battery.specifications || '',
            purchase_date: battery.purchase_date || '',
            installation_date: battery.installation_date || '',
            last_service_date: battery.last_service_date || '',
            stock_quantity: battery.stock_quantity || '0',
            claim_type: battery.claim_type || '',
            status: battery.status || '',
            shop_stock_quantity: battery.shop_stock_quantity || '0',
            company_stock_quantity: battery.company_stock_quantity || '0',
            tracking_status: battery.tracking_status || 'active',
            warranty_expiry_date: battery.warranty_expiry_date || '',
            warranty_remarks: battery.warranty_remarks || ''
          };
        });
        
        setSunToCompBatteries(formattedBatteries);
        setSuccessMessage('Sun Powers to Company batteries loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load Sun Powers to Company batteries');
      }
      
    } catch (error: any) {
      console.error('Error loading Sun Powers to Company batteries:', error);
      throw error;
    }
  };

  // Load company_to_sun_powers batteries
  const loadComptosunBatteries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.batteries) {
        const filteredBatteries = data.batteries.filter((battery: any) => 
          battery.claim_type && battery.claim_type.toLowerCase() === "comptosun"
        );
        
        const formattedBatteries: Battery[] = filteredBatteries.map((battery: any) => {
          const isSpareValue = parseIsSpare(battery.is_spare);
          
          return {
            id: parseInt(battery.id),
            battery_code: battery.battery_code || '',
            battery_model: battery.battery_model || '',
            battery_serial: battery.battery_serial || '',
            brand: battery.brand || '',
            capacity: battery.capacity || '',
            voltage: battery.voltage || '12V',
            battery_type: battery.battery_type || 'lead_acid',
            category: battery.category || 'inverter',
            price: battery.price || '0',
            warranty_period: battery.warranty_period || '',
            amc_period: battery.amc_period || '0',
            inverter_model: battery.inverter_model || '',
            battery_condition: battery.battery_condition || 'good',
            is_spare: isSpareValue,
            spare_status: battery.spare_status || 'available',
            created_at: battery.created_at || new Date().toISOString(),
            total_services: parseInt(battery.total_services || '0'),
            specifications: battery.specifications || '',
            purchase_date: battery.purchase_date || '',
            installation_date: battery.installation_date || '',
            last_service_date: battery.last_service_date || '',
            stock_quantity: battery.stock_quantity || '0',
            claim_type: battery.claim_type || '',
            status: battery.status || '',
            shop_stock_quantity: battery.shop_stock_quantity || '0',
            company_stock_quantity: battery.company_stock_quantity || '0',
            tracking_status: battery.tracking_status || 'active',
            warranty_expiry_date: battery.warranty_expiry_date || '',
            warranty_remarks: battery.warranty_remarks || ''
          };
        });
        
        setComptosunBatteries(formattedBatteries);
        setSuccessMessage('Company to Sun Powers batteries loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load Company to Sun Powers batteries');
      }
      
    } catch (error: any) {
      console.error('Error loading Company to Sun Powers batteries:', error);
      throw error;
    }
  };

  // Load company claims batteries
  const loadCompclaimBatteries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.batteries) {
        const filteredBatteries = data.batteries.filter((battery: any) => 
          battery.claim_type && battery.claim_type.toLowerCase() === "company"
        );
        
        const formattedBatteries: Battery[] = filteredBatteries.map((battery: any) => {
          const isSpareValue = parseIsSpare(battery.is_spare);
          
          return {
            id: parseInt(battery.id),
            battery_code: battery.battery_code || '',
            battery_model: battery.battery_model || '',
            battery_serial: battery.battery_serial || '',
            brand: battery.brand || '',
            capacity: battery.capacity || '',
            voltage: battery.voltage || '12V',
            battery_type: battery.battery_type || 'lead_acid',
            category: battery.category || 'inverter',
            price: battery.price || '0',
            warranty_period: battery.warranty_period || '',
            amc_period: battery.amc_period || '0',
            inverter_model: battery.inverter_model || '',
            battery_condition: battery.battery_condition || 'good',
            is_spare: isSpareValue,
            spare_status: battery.spare_status || 'available',
            created_at: battery.created_at || new Date().toISOString(),
            total_services: parseInt(battery.total_services || '0'),
            specifications: battery.specifications || '',
            purchase_date: battery.purchase_date || '',
            installation_date: battery.installation_date || '',
            last_service_date: battery.last_service_date || '',
            stock_quantity: battery.stock_quantity || '0',
            claim_type: battery.claim_type || '',
            status: battery.status || '',
            shop_stock_quantity: battery.shop_stock_quantity || '0',
            company_stock_quantity: battery.company_stock_quantity || '0',
            tracking_status: battery.tracking_status || 'active',
            warranty_expiry_date: battery.warranty_expiry_date || '',
            warranty_remarks: battery.warranty_remarks || ''
          };
        });
        
        setCompclaimBatteries(formattedBatteries);
        setSuccessMessage('Company claims loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load company claims');
      }
      
    } catch (error: any) {
      console.error('Error loading company claims:', error);
      throw error;
    }
  };

  // Load deliveries from API
  const loadDeliveries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/deliveries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.deliveries) {
        const formattedDeliveries: Delivery[] = data.deliveries.map((delivery: any) => ({
          id: parseInt(delivery.id),
          delivery_code: delivery.delivery_code || '',
          service_id: parseInt(delivery.service_id || '0'),
          customer_id: parseInt(delivery.customer_id || '0'),
          delivery_type: delivery.delivery_type || 'home_delivery',
          address: delivery.address || '',
          contact_person: delivery.contact_person || '',
          contact_phone: delivery.contact_phone || '',
          scheduled_date: delivery.scheduled_date || '',
          scheduled_time: delivery.scheduled_time || '',
          delivery_person: delivery.delivery_person || '',
          notes: delivery.notes || '',
          status: delivery.status || 'scheduled',
          delivered_date: delivery.delivered_date || null,
          created_at: delivery.created_at || new Date().toISOString(),
          updated_at: delivery.updated_at || new Date().toISOString(),
          service_code: delivery.service_code || '',
          customer_name: delivery.customer_name || '',
          customer_phone: delivery.customer_phone || '',
          battery_model: delivery.battery_model || '',
          battery_brand: delivery.battery_brand || '',
          scheduled_date_formatted: delivery.scheduled_date_formatted || '',
          scheduled_time_formatted: delivery.scheduled_time_formatted || ''
        }));
        setDeliveries(formattedDeliveries);
        setSuccessMessage('Deliveries loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load deliveries');
      }
      
    } catch (error: any) {
      console.error('Error loading deliveries:', error);
      throw error;
    }
  };

  // Load replacements from API
  const loadReplacements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/replacement_battery.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        const formattedReplacements: ReplacementBattery[] = data.data.map((replacement: any) => ({
          id: replacement.id?.toString() || '',
          service_order_id: replacement.service_order_id || '',
          battery_model: replacement.battery_model || '',
          battery_serial: replacement.battery_serial || '',
          brand: replacement.brand || '',
          capacity: replacement.capacity || '',
          voltage: replacement.voltage || '12V',
          battery_type: replacement.battery_type || 'lead_acid',
          price: replacement.price || '0.00',
          warranty_period: replacement.warranty_period || '',
          installation_date: replacement.installation_date || '',
          notes: replacement.notes || '',
          created_at: replacement.created_at || '',
          updated_at: replacement.updated_at || '',
          service_code: replacement.service_code || '',
          customer_id: replacement.customer_id || '',
          service_status: replacement.service_status || 'pending',
          customer_name: replacement.customer_name || '',
          customer_phone: replacement.customer_phone || '',
          original_battery_model: replacement.original_battery_model || '',
          original_battery_serial: replacement.original_battery_serial || '',
          warranty_status: replacement.warranty_status || 'in_warranty',
          warranty_expiry_date: replacement.warranty_expiry_date || ''
        }));
        setReplacements(formattedReplacements);
        setSuccessMessage('Replacements loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load replacements');
      }
      
    } catch (error: any) {
      console.error('Error loading replacements:', error);
      throw error;
    }
  };

  // Load spares from API
  const loadSpares = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/spare_batteries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        const formattedSpares: SpareBattery[] = data.data.map((spare: any) => ({
          id: spare.id?.toString() || '',
          battery_code: spare.battery_code || `SPARE_${spare.id}`,
          battery_type: spare.battery_type || '',
          battery_model: spare.battery_model || '',
          capacity: spare.capacity || '',
          voltage: spare.voltage || '',
          manufacturer: spare.manufacturer || '',
          purchase_date: spare.purchase_date || '',
          warranty_months: spare.warranty_months || '',
          current_condition: spare.current_condition || '',
          quantity: spare.quantity || '',
          min_quantity: spare.min_quantity || '',
          location: spare.location || '',
          notes: spare.notes || '',
          created_at: spare.created_at || new Date().toISOString(),
          updated_at: spare.updated_at || new Date().toISOString(),
          is_spare: spare.is_spare || 1,
          warranty_status: spare.warranty_status || 'active',
          warranty_expiry_date: spare.warranty_expiry_date || '',
          is_low_quantity: spare.is_low_quantity || 0
        }));
        setSpares(formattedSpares);
        setSuccessMessage('Spare batteries loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load spare batteries');
      }
      
    } catch (error: any) {
      console.error('Error loading spare batteries:', error);
      throw error;
    }
  };

  // Load shop claims from API
  const loadShopClaims = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop_claims.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Shop claims API not available');
        setShopClaims([]);
        return;
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        const formattedShopClaims: ShopClaim[] = data.data.map((claim: any) => ({
          id: claim.id?.toString() || '',
          claim_code: claim.claim_code || `SC_${claim.id}`,
          battery_id: claim.battery_id || '',
          battery_model: claim.battery_model || '',
          battery_serial: claim.battery_serial || '',
          customer_id: claim.customer_id || '',
          customer_name: claim.customer_name || '',
          customer_phone: claim.customer_phone || '',
          service_id: claim.service_id || '',
          service_code: claim.service_code || '',
          issue_description: claim.issue_description || '',
          claim_type: claim.claim_type || 'warranty',
          priority: claim.priority || 'medium',
          status: claim.status || 'pending',
          claim_date: claim.claim_date || '',
          expected_resolution_date: claim.expected_resolution_date || '',
          resolved_date: claim.resolved_date || null,
          resolution_notes: claim.resolution_notes || '',
          created_at: claim.created_at || new Date().toISOString(),
          updated_at: claim.updated_at || new Date().toISOString(),
          brand: claim.brand || '',
          capacity: claim.capacity || '',
          voltage: claim.voltage || '',
          battery_type: claim.battery_type || '',
          warranty_status: claim.warranty_status || 'in_warranty'
        }));
        setShopClaims(formattedShopClaims);
        setSuccessMessage('Shop claims loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load shop claims');
      }
      
    } catch (error: any) {
      console.error('Error loading shop claims:', error);
      setShopClaims([]);
    }
  };
  
  // Calculate additional dashboard stats
  const calculateAdditionalStats = () => {
    const spareBatteries = batteries.filter(b => parseIsSpare(b.is_spare)).length;
    const activeDeliveries = deliveries.filter(d => 
      d.status === 'scheduled' || d.status === 'dispatched' || d.status === 'in_transit'
    ).length;
    const totalReplacements = replacements.length;
    const pendingReplacements = replacements.filter(r => r.service_status === 'pending').length;
    const deliveredReplacements = replacements.filter(r => r.service_status === 'delivered').length;
    const totalShopClaims = shopClaims.length;
    const pendingShopClaims = shopClaims.filter(c => c.status === 'pending').length;
    const resolvedShopClaims = shopClaims.filter(c => c.status === 'resolved').length;
    const totalCompanyClaims = compclaimBatteries.length;
    const pendingCompanyClaims = compclaimBatteries.filter(b => b.status === 'pending' || b.status === 'under_review').length;
    const resolvedCompanyClaims = compclaimBatteries.filter(b => b.status === 'resolved' || b.status === 'completed').length;
    
    setDashboardStats(prev => ({
      ...prev,
      spare_batteries: spareBatteries,
      active_deliveries: activeDeliveries,
      total_replacements: totalReplacements,
      pending_replacements: pendingReplacements,
      delivered_replacements: deliveredReplacements,
      shop_claims: totalShopClaims,
      pending_shop_claims: pendingShopClaims,
      resolved_shop_claims: resolvedShopClaims,
      company_claims: totalCompanyClaims,
      pending_company_claims: pendingCompanyClaims,
      resolved_company_claims: resolvedCompanyClaims
    }));
  };
  
  // Helper functions
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    onLogout();
  };
  
  // Navigation handler
  const handleNavItemClick = (id: string) => {
    setActiveTab(id);
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
    setSearchTerm("");
    setFilterStatus("all");
    setFilterServiceType("all");
    setFilterPriority("all");
    setFilterClaimType("all");
    setFilterBatteryType("all");
    setFilterSpareStatus("all");
    setFilterDeliveryStatus("all");
    setFilterDeliveryType("all");
    setFilterReplacementStatus("all");
    setFilterAllocationStatus("all");
    setFilterSunToCompStatus("all");
    setFilterComptosunStatus("all");
    setFilterCompclaimStatus("all");
    setFilterShopClaimStatus("all");
    setFilterShopClaimType("all");
    setFilterShopClaimPriority("all");
    setFilterWarrantyStatus("all");
  };
  
  // Refresh handler
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      switch(activeTab) {
        case 'dashboard':
          await Promise.all([
            loadDashboardData(),
            loadServices(),
            loadSpares(),
            loadDeliveries(),
            loadReplacements(),
            loadComptosunBatteries(),
            loadSunToCompBatteries(),
            loadCompclaimBatteries(),
            loadShopClaims()
          ]);
          calculateAdditionalStats();
          break;
        case 'services':
          await loadServices();
          break;
        case 'customers':
          await loadCustomers();
          break;
        case 'batteries':
          await loadBatteries();
          break;
        case 'delivery':
          await loadDeliveries();
          break;
        case 'replacement':
          await loadReplacements();
          break;
        case 'spare_batteries':
          await loadSpares();
          break;
        case 'sun_powers_to_company':
          await loadSunToCompBatteries();
          break;
        case 'company_to_sun_powers':
          await loadComptosunBatteries();
          break;
        case 'company_claims':
          await loadCompclaimBatteries();
          break;
        case 'shop_claims':
          await loadShopClaims();
          break;
        default:
          break;
      }
      
      setSuccessMessage('Data refreshed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };
  
  // Scroll to top
  const scrollToTop = () => {
    if (dashboardContentRef.current) {
      dashboardContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Service handlers
  const handleViewService = (service: ServiceOrder) => {
    setSelectedService(service);
    setViewMode(true);
  };
  
  const handleEditService = (service: ServiceOrder) => {
    setSelectedService(service);
    setServiceForm({
      customer_id: service.customer_id || null,
      customer_phone: service.customer_phone || "",
      inverter_id: service.inverter_id || null,
      battery_id: service.battery_id || null,
      service_type: service.service_type || "battery_service",
      issue_description: service.issue_description || "",
      battery_claim: service.battery_claim || "none",
      status: service.status || "pending",
      warranty_status: service.warranty_status || "in_warranty",
      amc_status: service.amc_status || "no_amc",
      estimated_cost: service.estimated_cost || "",
      final_cost: service.final_cost || "",
      deposit_amount: service.deposit_amount || "",
      payment_status: service.payment_status || "pending",
      estimated_completion_date: service.estimated_completion_date || "",
      priority: service.priority || "medium",
      notes: service.notes || "",
      service_staff_id: service.service_staff_id || null,
      customer_name: service.customer_name || "",
      inverter_model: service.inverter_model || "",
      battery_model: service.battery_model || "",
      showReplacementForm: false,
      replacement_battery_model: "",
      replacement_battery_serial: "",
      replacement_battery_brand: "",
      replacement_battery_capacity: "",
      replacement_battery_type: "",
      replacement_battery_voltage: "",
      replacement_battery_price: "",
      replacement_battery_warranty: "",
      replacement_installation_date: "",
      replacement_battery_notes: "",
      warranty_period: service.warranty_period || "",
      warranty_expiry_date: service.warranty_expiry_date || "",
      warranty_remarks: service.warranty_remarks || "",
      spare_battery_id: service.spare_battery_id || null,
      use_spare_battery: service.spare_battery_id ? true : false,
      battery_source: 'none'
    });
    setShowServiceForm(true);
  };
  
  const handleDeleteService = async (id: number) => {
    setDeleteItem({ type: 'service', id });
    setShowDeleteConfirm(true);
  };
  
  // New Service Order handler
  const handleNewServiceOrder = () => {
    setSelectedService(null);
    setServiceForm({
      customer_id: null,
      customer_phone: "",
      inverter_id: null,
      battery_id: null,
      service_type: "battery_service",
      issue_description: "",
      battery_claim: "none",
      status: "pending",
      warranty_status: "in_warranty",
      amc_status: "no_amc",
      estimated_cost: "",
      final_cost: "",
      deposit_amount: "",
      payment_status: "pending",
      estimated_completion_date: "",
      priority: "medium",
      notes: "",
      service_staff_id: null,
      customer_name: "",
      inverter_model: "",
      battery_model: "",
      showReplacementForm: false,
      replacement_battery_model: "",
      replacement_battery_serial: "",
      replacement_battery_brand: "",
      replacement_battery_capacity: "",
      replacement_battery_type: "",
      replacement_battery_voltage: "",
      replacement_battery_price: "",
      replacement_battery_warranty: "",
      replacement_installation_date: "",
      replacement_battery_notes: "",
      warranty_period: "",
      warranty_expiry_date: "",
      warranty_remarks: "",
      spare_battery_id: null,
      use_spare_battery: false,
      battery_source: 'none'
    });
    setBatterySearch('');
    setSpareBatterySearch('');
    setSelectedSpareBattery(null);
    setShowServiceForm(true);
  };
  
  // Service form handlers
  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Service form submit handler
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/services.php`;
      const method = selectedService ? 'PUT' : 'POST';
      
      const serviceData: any = {
        customer_id: serviceForm.customer_id || "",
        customer_phone: serviceForm.customer_phone || "",
        battery_id: serviceForm.battery_id || "",
        service_type: "battery_service",
        issue_description: serviceForm.issue_description || "",
        battery_claim: serviceForm.battery_claim || "none",
        status: serviceForm.status || "pending",
        warranty_status: serviceForm.warranty_status || "in_warranty",
        amc_status: serviceForm.amc_status || "no_amc",
        estimated_cost: parseFloat(serviceForm.estimated_cost) || 0,
        final_cost: parseFloat(serviceForm.final_cost) || 0,
        deposit_amount: parseFloat(serviceForm.deposit_amount) || 0,
        payment_status: serviceForm.payment_status || "pending",
        estimated_completion_date: serviceForm.estimated_completion_date || "",
        priority: serviceForm.priority || "medium",
        notes: serviceForm.notes || "",
        service_staff_id: serviceForm.service_staff_id || "",
        spare_battery_id: serviceForm.spare_battery_id || "",
        warranty_period: serviceForm.warranty_period || "",
        warranty_expiry_date: serviceForm.warranty_expiry_date || "",
        warranty_remarks: serviceForm.warranty_remarks || "",
        action: selectedService ? "update" : "create"
      };
      
      if (selectedService) {
        serviceData.id = selectedService.id;
      }
      
      // Only include replacement battery data if NOT using spare battery
      if (!serviceForm.use_spare_battery && serviceForm.showReplacementForm && serviceForm.replacement_battery_serial) {
        serviceData.replacement_battery_serial = serviceForm.replacement_battery_serial;
        serviceData.replacement_battery_model = serviceForm.replacement_battery_model || "";
        serviceData.replacement_battery_brand = serviceForm.replacement_battery_brand || "";
        serviceData.replacement_battery_capacity = serviceForm.replacement_battery_capacity || "";
        serviceData.replacement_battery_type = serviceForm.replacement_battery_type || "lead_acid";
        serviceData.replacement_battery_voltage = serviceForm.replacement_battery_voltage || "12V";
        serviceData.replacement_battery_price = parseFloat(serviceForm.replacement_battery_price) || 0;
        serviceData.replacement_battery_warranty = serviceForm.replacement_battery_warranty || "";
        serviceData.replacement_installation_date = serviceForm.replacement_installation_date || new Date().toISOString().split('T')[0];
        serviceData.replacement_battery_notes = serviceForm.replacement_battery_notes || "";
      }
      
      console.log("Saving service:", serviceData);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(serviceData).toString()
      });
      
      const responseText = await response.text();
      console.log("Service save response:", responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadServices();
        await loadSpares(); // Refresh spare batteries list to show updated quantities
        setShowServiceForm(false);
        setSelectedService(null);
        setBatterySearch('');
        setSpareBatterySearch('');
        setSelectedSpareBattery(null);
        setSuccessMessage(selectedService ? 'Service updated successfully!' : 'Service created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save service');
      }
      
    } catch (error: any) {
      console.error('Error saving service:', error);
      setError('Failed to save service order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Customer handlers
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };
  
  const handleDeleteCustomer = async (id: number) => {
    setDeleteItem({ type: 'customer', id });
    setShowDeleteConfirm(true);
  };
  
  // Battery handlers
  const handleViewBattery = (battery: Battery) => {
    setSelectedBattery(battery);
    setShowProductDetail(true);
  };
  
  const handleEditBattery = (battery: Battery) => {
    setSelectedBattery(battery);
    setShowProductForm(true);
  };
  
  const handleDeleteBattery = async (id: number) => {
    setDeleteItem({ type: 'battery', id });
    setShowDeleteConfirm(true);
  };

  // Sun to Company handlers
  const handleViewSunToComp = (battery: Battery) => {
    setSelectedSunToComp(battery);
    setShowSunToCompDetail(true);
  };
  
  const handleEditSunToComp = (battery: Battery) => {
    setSelectedSunToComp(battery);
    setShowSunToCompForm(true);
  };
  
  const handleDeleteSunToComp = async (id: number) => {
    setDeleteItem({ type: 'sun_to_comp', id });
    setShowDeleteConfirm(true);
  };

  // Company to Sun handlers
  const handleViewComptosun = (battery: Battery) => {
    setSelectedComptosun(battery);
    setShowComptosunDetail(true);
  };
  
  const handleEditComptosun = (battery: Battery) => {
    setSelectedComptosun(battery);
    setShowComptosunForm(true);
  };
  
  const handleDeleteComptosun = async (id: number) => {
    setDeleteItem({ type: 'comptosun', id });
    setShowDeleteConfirm(true);
  };

  // Company Claims handlers
  const handleViewCompclaim = (battery: Battery) => {
    setSelectedCompclaim(battery);
    setShowCompclaimDetail(true);
  };
  
  const handleEditCompclaim = (battery: Battery) => {
    setSelectedCompclaim(battery);
    setShowCompclaimForm(true);
  };
  
  const handleDeleteCompclaim = async (id: number) => {
    setDeleteItem({ type: 'company_claim', id });
    setShowDeleteConfirm(true);
  };

  // Delivery handlers
  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetail(true);
  };
  
  const handleEditDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryForm(true);
  };
  
  const handleDeleteDelivery = async (id: number) => {
    setDeleteItem({ type: 'delivery', id });
    setShowDeleteConfirm(true);
  };

  const handleUpdateDeliveryStatus = async (id: number, status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/deliveries.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          delivered_date: status === "delivered" ? new Date().toISOString().split('T')[0] : null
        })
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        await loadDeliveries();
        if (selectedDelivery && selectedDelivery.id === id) {
          setSelectedDelivery(prev => prev ? { ...prev, status } : null);
        }
        setSuccessMessage(`Delivery status updated to ${status}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to update delivery status');
      }
    } catch (error: any) {
      console.error('Error updating delivery status:', error);
      setError('Failed to update delivery status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Replacement handlers
  const handleViewReplacement = (replacement: ReplacementBattery) => {
    setSelectedReplacement(replacement);
    setShowReplacementDetail(true);
  };
  
  const handleEditReplacement = (replacement: ReplacementBattery) => {
    setSelectedReplacement(replacement);
    setShowReplacementForm(true);
  };
  
  const handleDeleteReplacement = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/replacement_battery.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        await loadReplacements();
        setSuccessMessage('Replacement battery deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to delete replacement battery');
      }
      
    } catch (error: any) {
      console.error('Error deleting replacement:', error);
      setError('Failed to delete replacement battery: ' + error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    }
  };

  // New Replacement handler - REMOVED
  const handleNewReplacement = () => {
    console.log('Add Replacement Battery functionality disabled');
  };

  // Replacement save handler
  const handleReplacementSave = async (replacementData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!replacementData.service_order_id) {
        throw new Error('Service Order ID is required');
      }
      
      if (!replacementData.battery_serial) {
        throw new Error('Battery Serial Number is required');
      }
      
      const url = `${API_BASE_URL}/replacement_battery.php`;
      
      const dataToSend = {
        service_order_id: replacementData.service_order_id,
        battery_model: replacementData.battery_model || '',
        battery_serial: replacementData.battery_serial,
        brand: replacementData.brand || '',
        capacity: replacementData.capacity || '',
        voltage: replacementData.voltage || '12V',
        battery_type: replacementData.battery_type || 'lead_acid',
        price: parseFloat(replacementData.price) || 0,
        warranty_period: replacementData.warranty_period || '',
        installation_date: replacementData.installation_date || new Date().toISOString().split('T')[0],
        notes: replacementData.notes || ''
      };
      
      if (isEdit && replacementData.id) {
        dataToSend.id = replacementData.id;
      }
      
      console.log("Sending replacement battery data:", dataToSend);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadReplacements();
        setShowReplacementForm(false);
        setSelectedReplacement(null);
        setSuccessMessage(isEdit ? 'Replacement battery updated successfully!' : 'Replacement battery added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        return data;
      } else {
        throw new Error(data.message || 'Failed to save replacement battery');
      }
      
    } catch (error: any) {
      console.error('Error saving replacement battery:', error);
      setError('Failed to save replacement battery: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Spare battery handlers
  const handleViewSpare = (spare: SpareBattery) => {
    setSelectedSpare(spare);
    setShowSpareDetail(true);
  };
  
  const handleEditSpare = (spare: SpareBattery) => {
    setSelectedSpare(spare);
    setShowSpareForm(true);
  };
  
  const handleDeleteSpare = async (id: string) => {
    setDeleteItem({ type: 'spare', id });
    setShowDeleteConfirm(true);
  };

  // New Spare handler - REMOVED
  const handleNewSpare = () => {
    console.log('Add Spare Battery functionality disabled');
  };

  // Shop Claim handlers
  const handleViewShopClaim = (claim: ShopClaim) => {
    setSelectedShopClaim(claim);
    setShowShopClaimDetail(true);
  };
  
  const handleEditShopClaim = (claim: ShopClaim) => {
    setSelectedShopClaim(claim);
    setShowShopClaimForm(true);
  };
  
  const handleDeleteShopClaim = async (id: string) => {
    setDeleteItem({ type: 'shop_claim', id });
    setShowDeleteConfirm(true);
  };

  // New Shop Claim handler - REMOVED
  const handleNewShopClaim = () => {
    console.log('New Shop Claim functionality disabled');
  };

  // New Company Claim handler - REMOVED
  const handleNewCompanyClaim = () => {
    console.log('New Company Claim functionality disabled');
  };

  // New Delivery handler - REMOVED
  const handleNewDelivery = () => {
    console.log('New Delivery functionality disabled');
  };

  // New Sun to Company handler - REMOVED
  const handleNewSunToComp = () => {
    console.log('Add Sun to Company Battery functionality disabled');
  };

  // New Company to Sun handler - REMOVED
  const handleNewCompanyToSun = () => {
    console.log('Add Company to Sun Battery functionality disabled');
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let url = '';
      let body: any = {};
      
      switch(deleteItem.type) {
        case 'sun_to_comp':
        case 'comptosun':
        case 'company_claim':
        case 'battery':
          url = `${API_BASE_URL}/batteries.php`;
          body = { id: deleteItem.id };
          break;
        case 'spare':
          url = `${API_BASE_URL}/spare_batteries.php`;
          body = { id: deleteItem.id };
          break;
        case 'service':
          url = `${API_BASE_URL}/services.php`;
          body = { id: deleteItem.id };
          break;
        case 'customer':
          url = `${API_BASE_URL}/customers.php`;
          body = { id: deleteItem.id };
          break;
        case 'delivery':
          url = `${API_BASE_URL}/deliveries.php`;
          body = { id: deleteItem.id };
          break;
        case 'replacement':
          await handleDeleteReplacement(deleteItem.id as string);
          setShowDeleteConfirm(false);
          setDeleteItem(null);
          setLoading(false);
          return;
        case 'shop_claim':
          setShopClaims(prev => prev.filter(claim => claim.id !== deleteItem.id));
          setSuccessMessage('Shop claim deleted successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
          setShowDeleteConfirm(false);
          setDeleteItem(null);
          setLoading(false);
          return;
        default:
          throw new Error('Invalid delete type');
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        switch(deleteItem.type) {
          case 'sun_to_comp':
            await loadSunToCompBatteries();
            break;
          case 'comptosun':
            await loadComptosunBatteries();
            break;
          case 'company_claim':
            await loadCompclaimBatteries();
            break;
          case 'spare':
            await loadSpares();
            break;
          case 'service':
            await loadServices();
            break;
          case 'customer':
            await loadCustomers();
            break;
          case 'battery':
            await loadBatteries();
            break;
          case 'delivery':
            await loadDeliveries();
            break;
        }
        
        setSuccessMessage(`${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1).replace(/_/g, ' ')} deleted successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || `Failed to delete ${deleteItem.type}`);
      }
      
    } catch (error: any) {
      console.error(`Error deleting ${deleteItem?.type}:`, error);
      setError(`Failed to delete ${deleteItem?.type}: ` + error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    }
  };
  
  // Form save handlers
  const handleServiceSave = async (serviceData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/services.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const dataToSend = {
        ...serviceData,
        warranty_status: serviceData.warranty_status || 'in_warranty',
        amc_status: serviceData.amc_status || 'no_amc',
        service_staff_name: user?.name || "Admin"
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadServices();
        setShowServiceForm(false);
        setSelectedService(null);
        setSuccessMessage(isEdit ? 'Service updated successfully!' : 'Service created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save service');
      }
      
    } catch (error: any) {
      console.error('Error saving service:', error);
      setError('Failed to save service order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCustomerSave = async (customerData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/customers.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(customerData).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadCustomers();
        setShowCustomerForm(false);
        setSelectedCustomer(null);
        setSuccessMessage(isEdit ? 'Customer updated successfully!' : 'Customer created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save customer');
      }
      
    } catch (error: any) {
      console.error('Error saving customer:', error);
      setError('Failed to save customer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Battery save handler
  const handleBatterySave = async (batteryData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/batteries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const dataToSend = {
        ...batteryData,
        is_spare: parseIsSpare(batteryData.is_spare),
        action: isEdit ? "update" : "create"
      };
      
      if (isEdit) {
        dataToSend.id = batteryData.id;
      }
      
      console.log("Sending battery data:", dataToSend);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        console.error('Response was:', responseText);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      console.log("Parsed response:", data);
      
      if (data.success) {
        await loadBatteries();
        setShowProductForm(false);
        setSelectedBattery(null);
        setSuccessMessage(isEdit ? 'Battery updated successfully!' : 'Battery added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save battery');
      }
      
    } catch (error: any) {
      console.error('Error saving battery:', error);
      setError('Failed to save battery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sun to Company save handler
  const handleSunToCompSave = async (batteryData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        ...batteryData,
        claim_type: "suntocomp",
        warranty_status: batteryData.warranty_status || 'in_warranty',
        is_spare: parseIsSpare(batteryData.is_spare),
        action: isEdit ? "update" : "create"
      };
      
      if (isEdit) {
        dataToSend.id = batteryData.id;
      }
      
      const url = `${API_BASE_URL}/batteries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log("Sending Sun to Company data:", dataToSend);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      console.log("Sun to Company response:", responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadSunToCompBatteries();
        setShowSunToCompForm(false);
        setSelectedSunToComp(null);
        setSuccessMessage(isEdit ? 'Sun to Company battery updated successfully!' : 'Sun to Company battery added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save Sun to Company battery');
      }
      
    } catch (error: any) {
      console.error('Error saving Sun to Company battery:', error);
      setError('Failed to save Sun to Company battery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Company to Sun save handler
  const handleComptosunSave = async (batteryData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        ...batteryData,
        claim_type: "comptosun",
        warranty_status: batteryData.warranty_status || 'in_warranty',
        is_spare: parseIsSpare(batteryData.is_spare),
        action: isEdit ? "update" : "create"
      };
      
      if (isEdit) {
        dataToSend.id = batteryData.id;
      }
      
      const url = `${API_BASE_URL}/batteries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadComptosunBatteries();
        setShowComptosunForm(false);
        setSelectedComptosun(null);
        setSuccessMessage(isEdit ? 'Company to Sun battery updated successfully!' : 'Company to Sun battery added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save Company to Sun battery');
      }
      
    } catch (error: any) {
      console.error('Error saving Company to Sun battery:', error);
      setError('Failed to save Company to Sun battery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Company Claims save handler
  const handleCompclaimSave = async (batteryData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        ...batteryData,
        claim_type: "company",
        warranty_status: batteryData.warranty_status || 'in_warranty',
        is_spare: parseIsSpare(batteryData.is_spare),
        action: isEdit ? "update" : "create"
      };
      
      if (isEdit) {
        dataToSend.id = batteryData.id;
      }
      
      const url = `${API_BASE_URL}/batteries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadCompclaimBatteries();
        setShowCompclaimForm(false);
        setSelectedCompclaim(null);
        setSuccessMessage(isEdit ? 'Company claim updated successfully!' : 'Company claim added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save company claim');
      }
      
    } catch (error: any) {
      console.error('Error saving company claim:', error);
      setError('Failed to save company claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySave = async (deliveryData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/deliveries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(deliveryData).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadDeliveries();
        setShowDeliveryForm(false);
        setSelectedDelivery(null);
        setSuccessMessage(isEdit ? 'Delivery updated successfully!' : 'Delivery created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save delivery');
      }
      
    } catch (error: any) {
      console.error('Error saving delivery:', error);
      setError('Failed to save delivery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSpareSave = async (spareData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/spare_batteries.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(spareData).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadSpares();
        setShowSpareForm(false);
        setSelectedSpare(null);
        setSuccessMessage(isEdit ? 'Spare battery updated successfully!' : 'Spare battery added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save spare battery');
      }
      
    } catch (error: any) {
      console.error('Error saving spare battery:', error);
      setError('Failed to save spare battery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Shop Claim save handler
  const handleShopClaimSave = async (claimData: any, isEdit: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!claimData.battery_id) {
        throw new Error('Battery ID is required');
      }
      
      if (!claimData.customer_id) {
        throw new Error('Customer ID is required');
      }
      
      const url = `${API_BASE_URL}/shop_claims.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const dataToSend = {
        ...claimData,
        action: isEdit ? 'update' : 'create'
      };
      
      if (isEdit && claimData.id) {
        dataToSend.id = claimData.id;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataToSend).toString()
      });
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      if (data.success) {
        await loadShopClaims();
        setShowShopClaimForm(false);
        setSelectedShopClaim(null);
        setSuccessMessage(isEdit ? 'Shop claim updated successfully!' : 'Shop claim created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save shop claim');
      }
      
    } catch (error: any) {
      console.error('Error saving shop claim:', error);
      setError('Failed to save shop claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Barcode scanning handlers
  const handleStartBatterySerialScan = () => {
    setScanningSerial(true);
    setSuccessMessage('Barcode scanning mode activated. Please scan the battery serial number.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleStartReplacementBatterySerialScan = () => {
    setScanningReplacementSerial(true);
    setSuccessMessage('Barcode scanning mode activated. Please scan the replacement battery serial number.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const event = {
      target: {
        name: 'battery_serial',
        value: barcode
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleServiceInputChange(event);
    setScanningSerial(false);
    setSuccessMessage(`Barcode scanned: ${barcode}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleReplacementBarcodeScanned = (barcode: string) => {
    const event = {
      target: {
        name: 'replacement_battery_serial',
        value: barcode
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleServiceInputChange(event);
    setScanningReplacementSerial(false);
    setSuccessMessage(`Replacement barcode scanned: ${barcode}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleToggleReplacementBatteryForm = () => {
    setServiceForm(prev => ({
      ...prev,
      showReplacementForm: !prev.showReplacementForm
    }));
  };

  const handleCopyOriginalBatteryDetails = () => {
    if (selectedService) {
      setServiceForm(prev => ({
        ...prev,
        replacement_battery_model: selectedService.battery_model || "",
        replacement_battery_serial: selectedService.battery_serial || "",
        replacement_battery_brand: selectedService.battery_brand || "",
        replacement_battery_capacity: selectedService.battery_capacity || "",
        replacement_battery_type: selectedService.battery_type || "lead_acid"
      }));
      setSuccessMessage('Original battery details copied to replacement form');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleSpareBatterySelect = (spare: SpareBattery) => {
    setSelectedSpareBattery(spare);
    
    setServiceForm(prev => ({
      ...prev,
      spare_battery_id: spare.id,
      use_spare_battery: true,
      showReplacementForm: false,
      replacement_battery_model: '',
      replacement_battery_serial: '',
      replacement_battery_brand: '',
      replacement_battery_capacity: '',
      replacement_battery_type: 'lead_acid',
      replacement_battery_voltage: '12V',
      replacement_battery_price: '',
      replacement_battery_warranty: '',
      replacement_battery_notes: ''
    }));
    
    setSpareBatterySearch(`${spare.battery_model} - ${spare.battery_code}`);
    setSuccessMessage(`Selected spare battery: ${spare.battery_model} (Qty left: ${parseInt(spare.quantity) - 1})`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleResetBatterySelection = () => {
    setSelectedSpareBattery(null);
    setServiceForm(prev => ({
      ...prev,
      battery_id: null,
      spare_battery_id: null,
      use_spare_battery: false,
      showReplacementForm: false
    }));
    setBatterySearch('');
    setSpareBatterySearch('');
    setSuccessMessage('Battery selection cleared');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleFetchServiceData = async (serviceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services.php?id=${serviceId}`);
      const data = await response.json();
      return data.service || data.service_order;
    } catch (error) {
      console.error('Error fetching service data:', error);
      return null;
    }
  };

  const handleFetchReplacementBattery = async (serviceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/replacement_battery.php?service_order_id=${serviceId}`);
      const data = await response.json();
      return data.replacement_battery;
    } catch (error) {
      console.error('Error fetching replacement battery:', error);
      return null;
    }
  };

  // Color helper functions
  const getStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'delivered': return '#3B82F6';
      case 'in_progress': return '#F59E0B';
      case 'scheduled': return '#6366F1';
      case 'pending': return '#6B7280';
      case 'cancelled': return '#DC2626';
      case 'ready': return '#22C55E';
      case 'testing': return '#8B5CF6';
      case 'charging': return '#EC4899';
      case 'repair': return '#F97316';
      default: return '#6B7280';
    }
  };
  
  const getPriorityColor = (priority: string): string => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };
  
  const getPaymentStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#10B981';
      case 'partial': return '#F59E0B';
      case 'pending': return '#6B7280';
      case 'refunded': return '#8B5CF6';
      default: return '#6B7280';
    }
  };
  
  const getServiceTypeColor = (type: string): string => {
    switch(type?.toLowerCase()) {
      case 'battery_service': return '#3B82F6';
      case 'inverter_service': return '#10B981';
      case 'hybrid_service': return '#F59E0B';
      default: return '#6B7280';
    }
  };
  
  const getWarrantyColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'in_warranty': return '#10B981';
      case 'extended_warranty': return '#3B82F6';
      case 'out_of_warranty': return '#DC2626';
      case 'active': return '#10B981';
      case 'expired': return '#DC2626';
      case 'void': return '#6B7280';
      default: return '#6B7280';
    }
  };
  
  const getClaimColor = (claim: string): string => {
    switch(claim?.toLowerCase()) {
      case 'shop_claim': return '#F59E0B';
      case 'company_claim': return '#3B82F6';
      case 'none': return '#6B7280';
      case 'comptosun': return '#3B82F6';
      case 'suntocomp': return '#F59E0B';
      case 'warranty': return '#10B981';
      case 'replacement': return '#EC4899';
      case 'repair': return '#F59E0B';
      case 'refund': return '#DC2626';
      case 'company': return '#3B82F6';
      default: return '#6B7280';
    }
  };
  
  const getBatteryTypeColor = (type: string): string => {
    switch(type?.toLowerCase()) {
      case 'lead_acid': return '#3B82F6';
      case 'lithium_ion': return '#10B981';
      case 'gel': return '#EC4899';
      case 'agm': return '#F59E0B';
      case 'tubular': return '#8B5CF6';
      case 'li-ion': return '#10B981';
      case 'li-po': return '#EC4899';
      default: return '#6B7280';
    }
  };
  
  const getSpareStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'available': return '#10B981';
      case 'allocated': return '#F59E0B';
      case 'returned': return '#3B82F6';
      case 'claimed': return '#8B5CF6';
      case 'in_use': return '#F59E0B';
      case 'reserved': return '#8B5CF6';
      default: return '#6B7280';
    }
  };
  
  const getConditionColor = (condition: string): string => {
    switch(condition?.toLowerCase()) {
      case 'good': return '#10B981';
      case 'fair': return '#F59E0B';
      case 'poor': return '#DC2626';
      case 'needs_replacement': return '#EF4444';
      case 'defective': return '#DC2626';
      case 'new': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getDeliveryStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return '#F59E0B';
      case 'dispatched': return '#3B82F6';
      case 'in_transit': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getDeliveryTypeColor = (type: string): string => {
    switch(type?.toLowerCase()) {
      case 'home_delivery': return '#3B82F6';
      case 'pickup': return '#10B981';
      case 'exchange': return '#8B5CF6';
      case 'installation': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getReplacementStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'scheduled': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'completed': return '#059669';
      case 'cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getAllocationStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'available': return '#10B981';
      case 'allocated': return '#F59E0B';
      case 'in_use': return '#3B82F6';
      case 'reserved': return '#8B5CF6';
      case 'returned': return '#059669';
      case 'damaged': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getTrackingStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'returned': return '#3B82F6';
      case 'damaged': return '#DC2626';
      case 'lost': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getShopClaimStatusColor = (status: string): string => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'in_review': return '#3B82F6';
      case 'approved': return '#10B981';
      case 'rejected': return '#DC2626';
      case 'resolved': return '#059669';
      case 'escalated': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const getShopClaimTypeColor = (type: string): string => {
    switch(type?.toLowerCase()) {
      case 'warranty': return '#10B981';
      case 'replacement': return '#EC4899';
      case 'repair': return '#F59E0B';
      case 'refund': return '#DC2626';
      case 'technical': return '#3B82F6';
      case 'quality': return '#8B5CF6';
      default: return '#6B7280';
    }
  };
  
  // Filter functions
  const getFilteredServices = () => {
    let filtered = [...services];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.customer_name?.toLowerCase().includes(searchLower) ||
        service.customer_phone?.includes(searchTerm) ||
        service.service_code?.toLowerCase().includes(searchLower) ||
        service.battery_model?.toLowerCase().includes(searchLower) ||
        service.inverter_model?.toLowerCase().includes(searchLower) ||
        service.issue_description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(service => service.status === filterStatus);
    }
    
    if (filterServiceType !== "all") {
      filtered = filtered.filter(service => service.service_type === filterServiceType);
    }
    
    if (filterPriority !== "all") {
      filtered = filtered.filter(service => service.priority === filterPriority);
    }
    
    if (filterClaimType !== "all") {
      filtered = filtered.filter(service => service.battery_claim === filterClaimType);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(service => service.warranty_status === filterWarrantyStatus);
    }
    
    return filtered;
  };
  
  const getFilteredCustomers = () => {
    let filtered = [...customers];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.full_name?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.customer_code?.toLowerCase().includes(searchLower) ||
        customer.city?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };
  
  const getFilteredBatteries = () => {
    let filtered = [...batteries];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(battery => 
        battery.battery_model?.toLowerCase().includes(searchLower) ||
        battery.battery_serial?.toLowerCase().includes(searchLower) ||
        battery.brand?.toLowerCase().includes(searchLower) ||
        battery.battery_code?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterBatteryType !== "all") {
      filtered = filtered.filter(battery => battery.battery_type === filterBatteryType);
    }
    
    if (filterSpareStatus !== "all") {
      if (filterSpareStatus === "spare") {
        filtered = filtered.filter(battery => parseIsSpare(battery.is_spare));
      } else if (filterSpareStatus === "regular") {
        filtered = filtered.filter(battery => !parseIsSpare(battery.is_spare));
      } else {
        filtered = filtered.filter(battery => battery.spare_status === filterSpareStatus);
      }
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(battery => battery.status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredSunToComp = () => {
    let filtered = [...sunToCompBatteries];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(battery => 
        battery.battery_model?.toLowerCase().includes(searchLower) ||
        battery.battery_serial?.toLowerCase().includes(searchLower) ||
        battery.brand?.toLowerCase().includes(searchLower) ||
        battery.battery_code?.toLowerCase().includes(searchLower) ||
        battery.capacity?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterSunToCompStatus !== "all") {
      filtered = filtered.filter(battery => 
        battery.status === filterSunToCompStatus || 
        (filterSunToCompStatus === 'active' && (!battery.status || battery.status === ''))
      );
    }
    
    if (filterBatteryType !== "all") {
      filtered = filtered.filter(battery => battery.battery_type === filterBatteryType);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(battery => battery.status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredComptosun = () => {
    let filtered = [...comptosunBatteries];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(battery => 
        battery.battery_model?.toLowerCase().includes(searchLower) ||
        battery.battery_serial?.toLowerCase().includes(searchLower) ||
        battery.brand?.toLowerCase().includes(searchLower) ||
        battery.battery_code?.toLowerCase().includes(searchLower) ||
        battery.capacity?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterComptosunStatus !== "all") {
      filtered = filtered.filter(battery => 
        battery.status === filterComptosunStatus || 
        (filterComptosunStatus === 'active' && (!battery.status || battery.status === ''))
      );
    }
    
    if (filterBatteryType !== "all") {
      filtered = filtered.filter(battery => battery.battery_type === filterBatteryType);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(battery => battery.status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredCompclaim = () => {
    let filtered = [...compclaimBatteries];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(battery => 
        battery.battery_model?.toLowerCase().includes(searchLower) ||
        battery.battery_serial?.toLowerCase().includes(searchLower) ||
        battery.brand?.toLowerCase().includes(searchLower) ||
        battery.battery_code?.toLowerCase().includes(searchLower) ||
        battery.capacity?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterCompclaimStatus !== "all") {
      filtered = filtered.filter(battery => 
        battery.status === filterCompclaimStatus || 
        (filterCompclaimStatus === 'active' && (!battery.status || battery.status === ''))
      );
    }
    
    if (filterBatteryType !== "all") {
      filtered = filtered.filter(battery => battery.battery_type === filterBatteryType);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(battery => battery.status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredDeliveries = () => {
    let filtered = [...deliveries];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(delivery => 
        delivery.delivery_code?.toLowerCase().includes(searchLower) ||
        delivery.customer_name?.toLowerCase().includes(searchLower) ||
        delivery.service_code?.toLowerCase().includes(searchLower) ||
        delivery.contact_phone?.includes(searchTerm)
      );
    }
    
    if (filterDeliveryStatus !== "all") {
      filtered = filtered.filter(delivery => delivery.status === filterDeliveryStatus);
    }
    
    if (filterDeliveryType !== "all") {
      filtered = filtered.filter(delivery => delivery.delivery_type === filterDeliveryType);
    }
    
    return filtered;
  };

  const getFilteredReplacements = () => {
    let filtered = [...replacements];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(replacement => {
        return (
          (replacement.customer_name?.toLowerCase().includes(searchLower) || false) ||
          (replacement.customer_phone?.includes(searchTerm) || false) ||
          (replacement.service_code?.toLowerCase().includes(searchLower) || false) ||
          (replacement.battery_serial?.toLowerCase().includes(searchLower) || false) ||
          (replacement.original_battery_model?.toLowerCase().includes(searchLower) || false) ||
          (replacement.battery_model?.toLowerCase().includes(searchLower) || false) ||
          (replacement.brand?.toLowerCase().includes(searchLower) || false)
        );
      });
    }
    
    if (filterReplacementStatus !== "all") {
      filtered = filtered.filter(replacement => replacement.service_status === filterReplacementStatus);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(replacement => replacement.warranty_status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredSpares = () => {
    let filtered = [...spares];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(spare => 
        spare.battery_model?.toLowerCase().includes(searchLower) ||
        spare.battery_code?.toLowerCase().includes(searchLower) ||
        spare.battery_type?.toLowerCase().includes(searchLower) ||
        spare.manufacturer?.toLowerCase().includes(searchLower) ||
        spare.location?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterAllocationStatus !== "all") {
      filtered = filtered.filter(spare => spare.current_condition === filterAllocationStatus);
    }
    
    if (filterBatteryType !== "all") {
      filtered = filtered.filter(spare => spare.battery_type === filterBatteryType);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(spare => spare.warranty_status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const getFilteredShopClaims = () => {
    let filtered = [...shopClaims];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.claim_code?.toLowerCase().includes(searchLower) ||
        claim.customer_name?.toLowerCase().includes(searchLower) ||
        claim.customer_phone?.includes(searchTerm) ||
        claim.battery_serial?.toLowerCase().includes(searchLower) ||
        claim.battery_model?.toLowerCase().includes(searchLower) ||
        claim.service_code?.toLowerCase().includes(searchLower) ||
        claim.issue_description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterShopClaimStatus !== "all") {
      filtered = filtered.filter(claim => claim.status === filterShopClaimStatus);
    }
    
    if (filterShopClaimType !== "all") {
      filtered = filtered.filter(claim => claim.claim_type === filterShopClaimType);
    }
    
    if (filterShopClaimPriority !== "all") {
      filtered = filtered.filter(claim => claim.priority === filterShopClaimPriority);
    }
    
    if (filterWarrantyStatus !== "all") {
      filtered = filtered.filter(claim => claim.warranty_status === filterWarrantyStatus);
    }
    
    return filtered;
  };

  const handleReplacementSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const filteredServices = getFilteredServices();
  const filteredCustomers = getFilteredCustomers();
  const filteredBatteries = getFilteredBatteries();
  const filteredSunToComp = getFilteredSunToComp();
  const filteredComptosun = getFilteredComptosun();
  const filteredCompclaim = getFilteredCompclaim();
  const filteredDeliveries = getFilteredDeliveries();
  const filteredReplacements = getFilteredReplacements();
  const filteredSpares = getFilteredSpares();
  const filteredShopClaims = getFilteredShopClaims();
  
  // Show loading state while user is being loaded
  if (isLoadingUser) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }
  
  // If no user after loading, redirect to login
  if (!user) {
    onLogout();
    return null;
  }
  
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <Sidebar
            user={user}
            activeTab={activeTab}
            onNavItemClick={handleNavItemClick}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navigation */}
        <header className="top-nav">
          <div className="nav-left">
            {!sidebarOpen && (
              <motion.button 
                className="sidebar-toggle open"
                onClick={() => setSidebarOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981'
                }}
              >
                <FiMenu />
              </motion.button>
            )}
            <div className="brand-mobile">
              <div className="logo-circle" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <span>SP</span>
              </div>
              <div className="brand-info">
                <h2>Sun Powers</h2>
              </div>
            </div>
            <motion.div 
              className="search-box"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab === 'dashboard' ? 'dashboard by client name or mobile' : activeTab + '...'}`}
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '300px',
                  padding: '10px 15px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              )}
            </motion.div>
          </div>
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {activeTab === 'services' && (
              <motion.button 
                className="nav-btn scan-btn"
                onClick={handleStartBatterySerialScan}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Start Barcode Scanning"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981'
                }}
              >
                <FiRadio />
              </motion.button>
            )}
            <motion.button 
              className="nav-btn refresh-btn"
              onClick={handleRefresh}
              title="Refresh Data"
              disabled={loading}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                opacity: loading ? 0.6 : 1
              }}
              whileHover={{ scale: loading ? 1 : 1.1 }}
              whileTap={{ scale: loading ? 1 : 0.9 }}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </motion.button>
            <div className="notification-dropdown">
              <motion.button 
                className="nav-btn notification-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  position: 'relative'
                }}
              >
                <FiBell />
                <span className="notification-badge" style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>3</span>
              </motion.button>
            </div>
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <div className="user-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-menu-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px' }}>{user.name || 'User'}</span>
                <span style={{ fontSize: '12px', color: '#10B981' }}>{user.role || 'User'}</span>
                {user.email && <span style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div 
          className="dashboard-content" 
          ref={dashboardContentRef}
          style={{ 
            overflowY: 'auto',
            height: 'calc(100vh - 70px)',
            WebkitOverflowScrolling: 'touch',
            padding: '24px'
          }}
        >
          {/* Success Message */}
          {successMessage && (
            <div className="success-alert" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#10B981'
            }}>
              <FiCheckCircle />
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#10B981', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-alert" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ef4444'
            }}>
              <FiAlertCircle />
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
          )}

          {/* Header Section */}
          <div className="header-section" style={{ marginBottom: '30px' }}>
            <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Welcome, {user.name || 'User'}! ⚡</h1>
                <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Inverter & Battery Service, Buy and Service Shop</p>
                <p className="user-info-text" style={{ display: 'flex', gap: '15px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>📧 {user.email || 'No email found'}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>🔑 Role: {user.role || 'User'}</span>
                </p>
                <p className="data-info" style={{ fontSize: '12px', color: '#6b7280' }}>
                  Showing real-time data from database • Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                {activeTab === 'services' && (
                  <motion.button 
                    className="btn primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNewServiceOrder}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiPlus />
                    <span>New Service Order</span>
                  </motion.button>
                )}
                {activeTab === 'customers' && (
                  <motion.button 
                    className="btn primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerForm(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiPlus />
                    <span>New Client</span>
                  </motion.button>
                )}
                {activeTab === 'batteries' && (
                  <motion.button 
                    className="btn primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedBattery(null);
                      setShowProductForm(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiPlus />
                    <span>Add Battery</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state" style={{
              textAlign: 'center',
              padding: '50px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div className="loading-spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(16, 185, 129, 0.3)',
                borderTop: '3px solid #10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <p style={{ color: '#94a3b8' }}>Loading data from database...</p>
            </div>
          )}

          {/* Rest of your modals and tabs remain the same */}
          {/* ... (Service Form Modal, Service Detail Modal, Customer Form Modal, etc.) ... */}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              dashboardStats={dashboardStats}
              services={recentServices.slice(0, 5)}
              activities={activities}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getPaymentStatusColor={getPaymentStatusColor}
              getServiceTypeColor={getServiceTypeColor}
              getWarrantyColor={getWarrantyColor}
              onViewService={handleViewService}
              onEditService={handleEditService}
              onViewAllServices={() => setActiveTab('services')}
              loading={loading}
            />
          )}

          {/* Service Orders Tab */}
          {activeTab === 'services' && (
            <ServicesTab
              services={services}
              filteredServices={filteredServices}
              filterStatus={filterStatus}
              filterServiceType={filterServiceType}
              filterPriority={filterPriority}
              filterClaimType={filterClaimType}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              onViewService={handleViewService}
              onEditService={handleEditService}
              onDeleteService={handleDeleteService}
              onFilterStatusChange={setFilterStatus}
              onFilterServiceTypeChange={setFilterServiceType}
              onFilterPriorityChange={setFilterPriority}
              onFilterClaimTypeChange={setFilterClaimType}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onNewService={handleNewServiceOrder}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getPaymentStatusColor={getPaymentStatusColor}
              getServiceTypeColor={getServiceTypeColor}
              getWarrantyColor={getWarrantyColor}
              loading={loading}
            />
          )}

          {/* Clients Management Tab */}
          {activeTab === 'customers' && (
            <ClientsTab
              customers={customers}
              filteredCustomers={filteredCustomers}
              onViewCustomer={handleViewCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onNewCustomer={() => {
                setSelectedCustomer(null);
                setShowCustomerForm(true);
              }}
              loading={loading}
            />
          )}

          {/* Products Management Tab */}
          {activeTab === 'batteries' && (
            <ProductsTab
              batteries={batteries}
              filteredBatteries={filteredBatteries}
              filterBatteryType={filterBatteryType}
              filterSpareStatus={filterSpareStatus}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              onViewBattery={handleViewBattery}
              onEditBattery={handleEditBattery}
              onDeleteBattery={handleDeleteBattery}
              onNewBattery={() => {
                setSelectedBattery(null);
                setShowProductForm(true);
              }}
              onFilterBatteryTypeChange={setFilterBatteryType}
              onFilterSpareStatusChange={setFilterSpareStatus}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              getBatteryTypeColor={getBatteryTypeColor}
              getConditionColor={getConditionColor}
              getSpareStatusColor={getSpareStatusColor}
              getWarrantyColor={getWarrantyColor}
              loading={loading}
            />
          )}

          {/* Sun Powers to Company Tab */}
          {activeTab === 'sun_powers_to_company' && (
            <SunToCompTab
              batteries={sunToCompBatteries}
              filteredBatteries={filteredSunToComp}
              filterStatus={filterSunToCompStatus}
              filterBatteryType={filterBatteryType}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewBattery={handleViewSunToComp}
              onEditBattery={handleEditSunToComp}
              onDeleteBattery={handleDeleteSunToComp}
              onNewBattery={() => {
                setSelectedSunToComp(null);
                setShowSunToCompForm(true);
              }}
              onFilterStatusChange={setFilterSunToCompStatus}
              onFilterBatteryTypeChange={setFilterBatteryType}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getBatteryTypeColor={getBatteryTypeColor}
              getConditionColor={getConditionColor}
              getClaimColor={getClaimColor}
              getTrackingStatusColor={getTrackingStatusColor}
              getWarrantyColor={getWarrantyColor}
            />
          )}

          {/* Company to Sun Powers Tab */}
          {activeTab === 'company_to_sun_powers' && (
            <ComptosunTab
              batteries={comptosunBatteries}
              filteredBatteries={filteredComptosun}
              filterStatus={filterComptosunStatus}
              filterBatteryType={filterBatteryType}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewBattery={handleViewComptosun}
              onEditBattery={handleEditComptosun}
              onDeleteBattery={handleDeleteComptosun}
              onNewBattery={() => {
                setSelectedComptosun(null);
                setShowComptosunForm(true);
              }}
              onFilterStatusChange={setFilterComptosunStatus}
              onFilterBatteryTypeChange={setFilterBatteryType}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getBatteryTypeColor={getBatteryTypeColor}
              getConditionColor={getConditionColor}
              getClaimColor={getClaimColor}
              getTrackingStatusColor={getTrackingStatusColor}
              getWarrantyColor={getWarrantyColor}
            />
          )}

          {/* Company Claims Tab */}
          {activeTab === 'company_claims' && (
            <CompclaimTab
              batteries={compclaimBatteries}
              filteredBatteries={filteredCompclaim}
              filterStatus={filterCompclaimStatus}
              filterBatteryType={filterBatteryType}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewBattery={handleViewCompclaim}
              onEditBattery={handleEditCompclaim}
              onDeleteBattery={handleDeleteCompclaim}
              onNewBattery={() => {
                setSelectedCompclaim(null);
                setShowCompclaimForm(true);
              }}
              onFilterStatusChange={setFilterCompclaimStatus}
              onFilterBatteryTypeChange={setFilterBatteryType}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getBatteryTypeColor={getBatteryTypeColor}
              getConditionColor={getConditionColor}
              getClaimColor={getClaimColor}
              getTrackingStatusColor={getTrackingStatusColor}
              getWarrantyColor={getWarrantyColor}
            />
          )}

          {/* Deliveries Management Tab */}
          {activeTab === 'delivery' && (
            <DeliveriesTab
              deliveries={deliveries}
              filteredDeliveries={filteredDeliveries}
              filterStatus={filterDeliveryStatus}
              filterType={filterDeliveryType}
              searchTerm={searchTerm}
              onViewDelivery={handleViewDelivery}
              onEditDelivery={handleEditDelivery}
              onDeleteDelivery={handleDeleteDelivery}
              onNewDelivery={() => {
                setSelectedDelivery(null);
                setShowDeliveryForm(true);
              }}
              onUpdateStatus={handleUpdateDeliveryStatus}
              onFilterStatusChange={setFilterDeliveryStatus}
              onFilterTypeChange={setFilterDeliveryType}
              getStatusColor={getDeliveryStatusColor}
              getTypeColor={getDeliveryTypeColor}
              loading={loading}
            />
          )}

          {/* Replacement Management Tab */}
          {activeTab === 'replacement' && (
            <ReplacementTab
              replacements={replacements}
              filteredReplacements={filteredReplacements}
              filterStatus={filterReplacementStatus}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewReplacement={handleViewReplacement}
              onEditReplacement={handleEditReplacement}
              onDeleteReplacement={handleDeleteReplacement}
              onNewReplacement={handleNewReplacement}
              onFilterStatusChange={setFilterReplacementStatus}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getStatusColor={getReplacementStatusColor}
              onSearchChange={handleReplacementSearchChange}
            />
          )}

          {/* Spare Batteries Management Tab */}
          {activeTab === 'spare_batteries' && (
            <SpareTab
              spares={spares}
              filteredSpares={filteredSpares}
              filterAllocationStatus={filterAllocationStatus}
              filterBatteryType={filterBatteryType}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewSpare={handleViewSpare}
              onEditSpare={handleEditSpare}
              onDeleteSpare={handleDeleteSpare}
              onNewSpare={() => {
                setSelectedSpare(null);
                setShowSpareForm(true);
              }}
              onFilterAllocationStatusChange={setFilterAllocationStatus}
              onFilterBatteryTypeChange={setFilterBatteryType}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getBatteryTypeColor={getBatteryTypeColor}
              getAllocationStatusColor={getAllocationStatusColor}
              getConditionColor={getConditionColor}
              getWarrantyColor={getWarrantyColor}
            />
          )}

          {/* Shop Claims Management Tab */}
          {activeTab === 'shop_claims' && (
            <ShopClaimTab
              claims={shopClaims}
              filteredClaims={filteredShopClaims}
              filterStatus={filterShopClaimStatus}
              filterType={filterShopClaimType}
              filterPriority={filterShopClaimPriority}
              filterWarrantyStatus={filterWarrantyStatus}
              searchTerm={searchTerm}
              loading={loading}
              onViewClaim={handleViewShopClaim}
              onEditClaim={handleEditShopClaim}
              onDeleteClaim={handleDeleteShopClaim}
              onNewClaim={() => {
                setSelectedShopClaim(null);
                setShowShopClaimForm(true);
              }}
              onFilterStatusChange={setFilterShopClaimStatus}
              onFilterTypeChange={setFilterShopClaimType}
              onFilterPriorityChange={setFilterShopClaimPriority}
              onFilterWarrantyStatusChange={setFilterWarrantyStatus}
              onRefresh={handleRefresh}
              getStatusColor={getShopClaimStatusColor}
              getTypeColor={getShopClaimTypeColor}
              getPriorityColor={getPriorityColor}
              getWarrantyColor={getWarrantyColor}
            />
          )}

          {/* Scroll to Top Button */}
          <motion.button
            className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
            onClick={scrollToTop}
            initial={{ opacity: 0 }}
            animate={{ opacity: showScrollTop ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              background: '#10B981',
              border: 'none',
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}
          >
            <FiChevronUp />
          </motion.button>

          {/* Footer */}
          <footer className="dashboard-footer" style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <div className="footer-content">
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px' }}>© 2026 Sun Powers - Inverter & Battery Service. All rights reserved</p>
              <div className="footer-links" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Privacy Policy</a>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Terms of Service</a>
                <a href="#support" onClick={(e) => { e.preventDefault(); alert('Support Center'); }} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Support Center</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Contact Us'); }} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '12px' }}>Contact Us</a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;