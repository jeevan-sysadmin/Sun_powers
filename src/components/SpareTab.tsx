// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiHash,
  FiBattery,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCheckSquare,
  FiSquare,
  FiX,
  FiEye,
  FiTrash2,
  FiMapPin,
  FiList,
  FiArrowLeft,
  FiGrid,
  FiMenu
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SpareDetailModal from './modals/SpareDetailModal';
import SpareFormModal from './modals/SpareFormModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import './css/Spare.css';

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

interface SpareUsage {
    id: string;
    service_order_id: string;
    spare_battery_id: string;
    quantity_used: string;
    used_at: string;
    returned_at: string | null;
    status: string;
    notes: string | null;
    service_code?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    issue_description?: string;
    service_staff_name?: string;
    battery_code?: string;
    battery_model?: string;
    battery_type?: string;
    manufacturer?: string;
}

interface ServiceOrder {
    id: string;
    service_code: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    issue_description: string;
    service_staff_name: string;
}

interface SpareTabProps {
    spares: SpareBattery[];
    filteredSpares: SpareBattery[];
    filterAllocationStatus: string;
    filterBatteryType: string;
    filterWarrantyStatus: string;
    searchTerm: string;
    loading: boolean;
    onViewSpare: (spare: SpareBattery) => void;
    onEditSpare: (spare: SpareBattery) => void;
    onDeleteSpare: (id: string) => void;
    onNewSpare: () => void;
    onFilterAllocationStatusChange: (status: string) => void;
    onFilterBatteryTypeChange: (type: string) => void;
    onFilterWarrantyStatusChange: (status: string) => void;
    onRefresh: () => Promise<void>;
    getBatteryTypeColor: (type: string) => string;
    getAllocationStatusColor: (status: string) => string;
    getConditionColor: (condition: string) => string;
    getWarrantyColor: (status: string) => string;
}

const SpareTab: React.FC<SpareTabProps> = ({
    spares = [],
    filteredSpares = [],
    filterAllocationStatus = 'all',
    filterBatteryType = 'all',
    filterWarrantyStatus = 'all',
    searchTerm = '',
    loading = false,
    onViewSpare,
    onEditSpare,
    onDeleteSpare,
    onNewSpare,
    onFilterAllocationStatusChange,
    onFilterBatteryTypeChange,
    onFilterWarrantyStatusChange,
    onRefresh,
    getBatteryTypeColor,
    getAllocationStatusColor,
    getConditionColor,
    getWarrantyColor
}) => {
    // View mode state
    const [viewMode, setViewMode] = useState<'spares' | 'spare_out'>('spares');
    
    // Responsive state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    
    // State for date filter
    const [dateFilterType, setDateFilterType] = useState<string>("all");
    const [customDateRange, setCustomDateRange] = useState<{start: string; end: string}>({
        start: '',
        end: ''
    });
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    
    // State for checkbox selection
    const [selectedSpares, setSelectedSpares] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (window.innerWidth < 640) return 5;
        if (window.innerWidth < 1024) return 10;
        return 15;
    });
    const [pageInput, setPageInput] = useState('1');
    
    // State for search type
    const [searchType, setSearchType] = useState<"all" | "model" | "code" | "manufacturer" | "location" | "customer" | "service_code">("all");
    const [searchPlaceholder, setSearchPlaceholder] = useState("Search all fields...");
    const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm);
    
    // Modal states
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedSpare, setSelectedSpare] = useState<SpareBattery | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>('');
    
    // Spare usage states
    const [spareUsages, setSpareUsages] = useState<SpareUsage[]>([]);
    const [loadingSpareOut, setLoadingSpareOut] = useState<boolean>(false);
    const [serviceOrders, setServiceOrders] = useState<Record<string, ServiceOrder>>({});

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const itemsPerPageOptions = [5, 10, 15, 20, 50, 100];

    const dateFilterOptions = [
        { value: 'all', label: 'All Dates' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Get unique types and conditions for filters
    const batteryTypes = Array.from(new Set(spares.map(spare => spare.battery_type))).filter(Boolean);
    const conditions = Array.from(new Set(spares.map(spare => spare.current_condition))).filter(Boolean);
    const warrantyStatuses = ['all', 'active', 'expired', 'unknown'];

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            // Adjust items per page based on screen size
            if (window.innerWidth < 640) {
                setItemsPerPage(5);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(10);
            } else {
                setItemsPerPage(15);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
                setIsFilterMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Date filter function for spares
    const filterByDate = (spare: SpareBattery) => {
        if (dateFilterType === "all") return true;
        
        const spareDate = new Date(spare.purchase_date || spare.created_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        switch(dateFilterType) {
            case "today":
                return spareDate >= today;
            case "week": {
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return spareDate >= startOfWeek && spareDate <= endOfWeek;
            }
            case "month":
                return spareDate.getMonth() === today.getMonth() && 
                       spareDate.getFullYear() === today.getFullYear();
            case "year":
                return spareDate.getFullYear() === selectedYear;
            case "custom":
                if (customDateRange.start && customDateRange.end) {
                    const start = new Date(customDateRange.start);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(customDateRange.end);
                    end.setHours(23, 59, 59, 999);
                    return spareDate >= start && spareDate <= end;
                }
                return true;
            default:
                return true;
        }
    };

    // Date filter function for spare usages
    const filterUsageByDate = (usage: SpareUsage) => {
        if (dateFilterType === "all") return true;
        
        const usageDate = new Date(usage.used_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        switch(dateFilterType) {
            case "today":
                return usageDate >= today;
            case "week": {
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return usageDate >= startOfWeek && usageDate <= endOfWeek;
            }
            case "month":
                return usageDate.getMonth() === today.getMonth() && 
                       usageDate.getFullYear() === today.getFullYear();
            case "year":
                return usageDate.getFullYear() === selectedYear;
            case "custom":
                if (customDateRange.start && customDateRange.end) {
                    const start = new Date(customDateRange.start);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(customDateRange.end);
                    end.setHours(23, 59, 59, 999);
                    return usageDate >= start && usageDate <= end;
                }
                return true;
            default:
                return true;
        }
    };

    // Search function for spare usages
    const filterUsageBySearch = (usage: SpareUsage) => {
        if (!localSearchTerm) return true;
        
        const term = localSearchTerm.toLowerCase();
        
        switch(searchType) {
            case "service_code":
                return usage.service_code?.toLowerCase().includes(term) || false;
            case "code":
                return usage.battery_code?.toLowerCase().includes(term) || false;
            case "model":
                return usage.battery_model?.toLowerCase().includes(term) || false;
            case "manufacturer":
                return usage.manufacturer?.toLowerCase().includes(term) || false;
            case "customer":
                return (
                    usage.customer_name?.toLowerCase().includes(term) ||
                    usage.customer_phone?.toLowerCase().includes(term) ||
                    false
                );
            default:
                return (
                    usage.service_code?.toLowerCase().includes(term) ||
                    usage.customer_name?.toLowerCase().includes(term) ||
                    usage.customer_phone?.toLowerCase().includes(term) ||
                    usage.battery_code?.toLowerCase().includes(term) ||
                    usage.battery_model?.toLowerCase().includes(term) ||
                    usage.battery_type?.toLowerCase().includes(term) ||
                    usage.manufacturer?.toLowerCase().includes(term) ||
                    usage.service_staff_name?.toLowerCase().includes(term) ||
                    false
                );
        }
    };

    // Apply all filters to spares
    const filteredData = useMemo(() => {
        return filteredSpares.filter(spare => {
            if (!filterByDate(spare)) return false;
            return true;
        });
    }, [filteredSpares, dateFilterType, customDateRange, selectedYear, selectedMonth]);

    // Enhance spare usages with service and spare data
    const enhancedSpareUsages = useMemo(() => {
        return spareUsages.map(usage => {
            const spare = spares.find(s => s.id === usage.spare_battery_id);
            const service = serviceOrders[usage.service_order_id];
            
            return {
                ...usage,
                battery_code: spare?.battery_code,
                battery_model: spare?.battery_model,
                battery_type: spare?.battery_type,
                manufacturer: spare?.manufacturer,
                service_code: service?.service_code,
                customer_name: service?.customer_name,
                customer_phone: service?.customer_phone,
                customer_email: service?.customer_email,
                issue_description: service?.issue_description,
                service_staff_name: service?.service_staff_name
            };
        });
    }, [spareUsages, spares, serviceOrders]);

    // Apply filters to spare usages
    const filteredSpareUsages = useMemo(() => {
        return enhancedSpareUsages.filter(usage => {
            if (!filterUsageByDate(usage)) return false;
            if (!filterUsageBySearch(usage)) return false;
            return true;
        });
    }, [enhancedSpareUsages, dateFilterType, customDateRange, selectedYear, selectedMonth, localSearchTerm, searchType]);

    // Pagination for spares
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Pagination for spare usages
    const usageIndexOfLastItem = currentPage * itemsPerPage;
    const usageIndexOfFirstItem = usageIndexOfLastItem - itemsPerPage;
    const currentUsages = filteredSpareUsages.slice(usageIndexOfFirstItem, usageIndexOfLastItem);
    const usageTotalPages = Math.ceil(filteredSpareUsages.length / itemsPerPage);

    // Update local search term when prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
        setPageInput('1');
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [dateFilterType, filterAllocationStatus, filterBatteryType, filterWarrantyStatus, localSearchTerm, viewMode]);

    // Fetch spare usages from API
    const fetchSpareUsages = async () => {
        setLoadingSpareOut(true);
        setLocalError('');
        
        try {
            const usageResponse = await fetch('http://localhost/sun_powers/api/ServiceSpareUsage.php');
            const usageData = await usageResponse.json();
            
            if (usageData.status === 'success' && Array.isArray(usageData.data)) {
                setSpareUsages(usageData.data);
                await fetchServiceOrders(usageData.data);
                setViewMode('spare_out');
                setCurrentPage(1);
                setIsMobileMenuOpen(false);
            } else {
                setLocalError('Failed to fetch spare usage data');
                setSpareUsages([]);
            }
        } catch (err) {
            console.error('Error fetching spare usages:', err);
            setLocalError('Failed to fetch spare out list');
            setSpareUsages([]);
        } finally {
            setLoadingSpareOut(false);
        }
    };

    // Fetch service orders for the used spare batteries
    const fetchServiceOrders = async (usages: SpareUsage[]) => {
        try {
            const serviceIds = [...new Set(usages.map(u => u.service_order_id))];
            
            if (serviceIds.length === 0) return;
            
            const response = await fetch('http://localhost/sun_powers/api/services.php');
            const data = await response.json();
            
            if (data.success && Array.isArray(data.services)) {
                const serviceMap: Record<string, ServiceOrder> = {};
                data.services.forEach((service: any) => {
                    serviceMap[service.id] = {
                        id: service.id,
                        service_code: service.service_code,
                        customer_name: service.customer_name,
                        customer_phone: service.customer_phone,
                        customer_email: service.customer_email,
                        issue_description: service.issue_description,
                        service_staff_name: service.service_staff_name
                    };
                });
                setServiceOrders(serviceMap);
            }
        } catch (err) {
            console.error('Error fetching service orders:', err);
        }
    };

    // Handle view details
    const handleViewDetails = (spare: SpareBattery) => {
        setSelectedSpare(spare);
        setShowDetailModal(true);
    };

    // Handle row click for spares
    const handleRowClick = (spare: SpareBattery, e: React.MouseEvent) => {
        // Don't trigger if clicking on checkbox or action buttons
        const target = e.target as HTMLElement;
        if (target.closest('.checkbox-btn') || target.closest('.action-btn') || target.closest('.table-actions')) {
            return;
        }
        handleViewDetails(spare);
    };

    // Handle row click for spare usages
    const handleUsageRowClick = (usage: SpareUsage, e: React.MouseEvent) => {
        // Find the corresponding spare and show details
        const spare = spares.find(s => s.id === usage.spare_battery_id);
        if (spare) {
            handleViewDetails(spare);
        }
    };

    const handleEdit = (spare: SpareBattery) => {
        setSelectedSpare(spare);
        setIsEditing(true);
        onEditSpare(spare);
    };

    const handleDelete = (spare: SpareBattery) => {
        setSelectedSpare(spare);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedSpare) return;
        
        try {
            onDeleteSpare(selectedSpare.id);
            setShowDeleteModal(false);
            setSelectedSpare(null);
        } catch (err) {
            console.error('Error deleting spare battery:', err);
            setLocalError('Failed to delete spare battery');
        }
    };

    const handleFormSubmit = () => {
        setShowFormModal(false);
        setIsEditing(false);
        setSelectedSpare(null);
        if (onRefresh) onRefresh();
    };

    const handleCloseFormModal = () => {
        setShowFormModal(false);
        setIsEditing(false);
        setSelectedSpare(null);
    };

    const handleBackToSpares = () => {
        setViewMode('spares');
        setLocalSearchTerm('');
        setCurrentPage(1);
        setIsMobileMenuOpen(false);
    };

    const getStatusIcon = (condition: string) => {
        switch(condition?.toLowerCase()) {
            case 'excellent':
            case 'good':
            case 'new':
                return <FiCheckCircle className="inline-icon" />;
            case 'fair':
                return <FiClock className="inline-icon" />;
            case 'poor':
            case 'damaged':
            case 'defective':
                return <FiAlertCircle className="inline-icon" />;
            default:
                return <FiPackage className="inline-icon" />;
        }
    };

    const getUsageStatusIcon = (status: string) => {
        switch(status?.toLowerCase()) {
            case 'used':
                return <FiCheckCircle />;
            case 'returned':
                return <FiPackage />;
            default:
                return <FiClock />;
        }
    };

    const getUsageStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'used': '#3B82F6',
            'returned': '#10B981',
            'damaged': '#EF4444',
            'lost': '#F59E0B'
        };
        return statusColors[status?.toLowerCase()] || '#6B7280';
    };

    // Toggle row expansion for mobile
    const toggleRowExpand = (id: string) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter(rowId => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
    };

    // Handle search type change
    const handleSearchTypeChange = (type: "all" | "model" | "code" | "manufacturer" | "location" | "customer" | "service_code") => {
        setSearchType(type);
        switch (type) {
            case "model":
                setSearchPlaceholder(viewMode === 'spares' ? "Search by battery model..." : "Search by spare model...");
                break;
            case "code":
                setSearchPlaceholder(viewMode === 'spares' ? "Search by battery code..." : "Search by battery code...");
                break;
            case "manufacturer":
                setSearchPlaceholder(viewMode === 'spares' ? "Search by manufacturer..." : "Search by manufacturer...");
                break;
            case "location":
                setSearchPlaceholder("Search by location...");
                break;
            case "customer":
                setSearchPlaceholder("Search by customer name or phone...");
                break;
            case "service_code":
                setSearchPlaceholder("Search by service code...");
                break;
            default:
                setSearchPlaceholder(viewMode === 'spares' ? "Search all fields..." : "Search all fields...");
        }
        setCurrentPage(1);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setLocalSearchTerm('');
        setCurrentPage(1);
    };

    // Handle date filter change
    const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setDateFilterType(type);
        setCurrentPage(1);
        
        if (type === 'custom' && !customDateRange.start && !customDateRange.end) {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            setCustomDateRange({
                start: thirtyDaysAgo.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
            });
        }
    };

    const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
        setCustomDateRange(prev => ({...prev, [type]: value}));
        setCurrentPage(1);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(parseInt(year));
        setCurrentPage(1);
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(parseInt(month));
        setCurrentPage(1);
    };

    const getDateRangeText = (): string => {
        switch (dateFilterType) {
            case 'today':
                return `Today (${new Date().toLocaleDateString()})`;
            case 'week': {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
            }
            case 'month':
                return `${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
            case 'year':
                return `Year ${selectedYear}`;
            case 'custom':
                return customDateRange.start && customDateRange.end ? 
                    `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}` : 
                    'Custom Range';
            default:
                return 'All Dates';
        }
    };

    const clearFilters = () => {
        setLocalSearchTerm('');
        setDateFilterType('all');
        setCustomDateRange({ start: '', end: '' });
        setSelectedYear(currentYear);
        setSelectedMonth(new Date().getMonth() + 1);
        onFilterAllocationStatusChange('all');
        onFilterBatteryTypeChange('all');
        onFilterWarrantyStatusChange('all');
        setCurrentPage(1);
    };

    // Handle select all for spares
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedSpares([]);
        } else {
            setSelectedSpares(currentItems.map(s => s.id));
        }
        setSelectAll(!selectAll);
    };

    // Handle select single for spares
    const handleSelectSpare = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedSpares.includes(id)) {
            setSelectedSpares(selectedSpares.filter(itemId => itemId !== id));
            setSelectAll(false);
        } else {
            setSelectedSpares([...selectedSpares, id]);
            if (selectedSpares.length + 1 === currentItems.length) {
                setSelectAll(true);
            }
        }
    };

    useEffect(() => {
        if (currentItems.length > 0 && selectedSpares.length === currentItems.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedSpares, currentItems]);

    const getSelectedSpares = () => {
        return filteredData.filter(spare => selectedSpares.includes(spare.id));
    };

    // Export functions for spares
    const exportSparesToCSV = () => {
        try {
            const dataToExport = selectedSpares.length > 0 ? getSelectedSpares() : filteredData;
            
            if (dataToExport.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = [
                'Battery Code', 'Model', 'Type', 'Manufacturer', 'Capacity', 'Voltage',
                'Condition', 'Purchase Date', 'Warranty Months', 
                'Warranty Status', 'Warranty Expiry', 'Notes', 'Created Date'
            ];
            
            const rows = dataToExport.map(spare => [
                spare.battery_code,
                spare.battery_model,
                spare.battery_type,
                spare.manufacturer || 'N/A',
                spare.capacity || 'N/A',
                spare.voltage || 'N/A',
                spare.current_condition || 'N/A',
                spare.purchase_date ? new Date(spare.purchase_date).toLocaleDateString() : 'N/A',
                spare.warranty_months || 'N/A',
                spare.warranty_status || 'N/A',
                spare.warranty_expiry_date ? new Date(spare.warranty_expiry_date).toLocaleDateString() : 'N/A',
                spare.notes || 'N/A',
                new Date(spare.created_at).toLocaleDateString()
            ]);

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Spare Batteries');
            XLSX.writeFile(wb, `spare_batteries_export_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            console.error('CSV Export Error:', error);
            alert('Error generating CSV. Please try again.');
        }
    };

    const exportUsagesToCSV = () => {
        try {
            if (filteredSpareUsages.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = [
                'Service Code', 'Customer Name', 'Phone', 'Battery Code',
                'Battery Model', 'Battery Type', 'Manufacturer', 'Status',
                'Used Date', 'Staff Name', 'Issue Description', 'Notes'
            ];
            
            const rows = filteredSpareUsages.map(usage => [
                usage.service_code || 'N/A',
                usage.customer_name || 'N/A',
                usage.customer_phone || 'N/A',
                usage.battery_code || 'N/A',
                usage.battery_model || 'N/A',
                usage.battery_type || 'N/A',
                usage.manufacturer || 'N/A',
                usage.status || 'N/A',
                formatDateTime(usage.used_at),
                usage.service_staff_name || 'N/A',
                usage.issue_description || 'N/A',
                usage.notes || 'N/A'
            ]);

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Spare Out List');
            XLSX.writeFile(wb, `spare_out_list_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            console.error('CSV Export Error:', error);
            alert('Error generating CSV. Please try again.');
        }
    };

    const exportSparesToPDF = () => {
        try {
            const dataToExport = selectedSpares.length > 0 ? getSelectedSpares() : filteredData;
            
            if (dataToExport.length === 0) {
                alert('No data to export');
                return;
            }

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFillColor(16, 185, 129);
            doc.rect(0, 0, 297, 20, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('SUN POWERS - SPARE BATTERIES REPORT', 148.5, 13, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
            doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
            doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
            
            if (selectedSpares.length > 0) {
                doc.text(`Selected Records: ${selectedSpares.length}`, 14, 45);
            }

            const headers = [
                ['S.No', 'Code', 'Model', 'Type', 'Manufacturer', 'Condition', 'Warranty']
            ];
            
            const tableData = dataToExport.map((spare, index) => [
                (index + 1).toString(),
                spare.battery_code,
                spare.battery_model,
                spare.battery_type,
                spare.manufacturer || 'N/A',
                spare.current_condition || 'N/A',
                spare.warranty_status || 'N/A'
            ]);

            autoTable(doc, {
                head: headers,
                body: tableData,
                startY: selectedSpares.length > 0 ? 50 : 45,
                theme: 'grid',
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    textColor: [0, 0, 0],
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: { 
                    fillColor: [16, 185, 129], 
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    valign: 'middle'
                },
                alternateRowStyles: { 
                    fillColor: [240, 249, 255] 
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 35 },
                    5: { cellWidth: 30 },
                    6: { cellWidth: 30 }
                },
                margin: { top: 45, left: 10, right: 10 },
                didDrawPage: (data) => {
                    const pageCount = doc.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text(
                            `Page ${i} of ${pageCount} - Sun Powers Spare Batteries Report - ${getDateRangeText()}`,
                            doc.internal.pageSize.width / 2,
                            doc.internal.pageSize.height - 10,
                            { align: 'center' }
                        );
                    }
                }
            });

            doc.save(`spare_batteries_report_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error generating PDF report. Please try again.');
        }
    };

    const exportUsagesToPDF = () => {
        try {
            if (filteredSpareUsages.length === 0) {
                alert('No data to export');
                return;
            }

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFillColor(16, 185, 129);
            doc.rect(0, 0, 297, 20, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('SUN POWERS - SPARE BATTERY OUT REPORT', 148.5, 13, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
            doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
            doc.text(`Total Records: ${filteredSpareUsages.length}`, 14, 40);

            const headers = [
                ['S.No', 'Service Code', 'Customer', 'Phone', 'Battery Code', 'Battery Model', 'Battery Type', 'Status', 'Used Date', 'Staff']
            ];
            
            const tableData = filteredSpareUsages.map((usage, index) => [
                (index + 1).toString(),
                usage.service_code || 'N/A',
                usage.customer_name || 'N/A',
                usage.customer_phone || 'N/A',
                usage.battery_code || 'N/A',
                usage.battery_model || 'N/A',
                usage.battery_type || 'N/A',
                usage.status || 'N/A',
                formatDateTime(usage.used_at),
                usage.service_staff_name || 'N/A'
            ]);

            autoTable(doc, {
                head: headers,
                body: tableData,
                startY: 45,
                theme: 'grid',
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    textColor: [0, 0, 0],
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    overflow: 'linebreak'
                },
                headStyles: { 
                    fillColor: [16, 185, 129], 
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    textColor: [0, 0, 0]
                },
                alternateRowStyles: { 
                    fillColor: [240, 249, 255] 
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 35 },
                    4: { cellWidth: 30 },
                    5: { cellWidth: 35 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 25 },
                    8: { cellWidth: 30 },
                    9: { cellWidth: 35 }
                },
                margin: { top: 45, left: 10, right: 10 },
                didDrawPage: (data) => {
                    const pageCount = doc.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text(
                            `Page ${i} of ${pageCount} - Sun Powers Spare Battery Out Report`,
                            doc.internal.pageSize.width / 2,
                            doc.internal.pageSize.height - 10,
                            { align: 'center' }
                        );
                    }
                }
            });

            doc.save(`spare_out_list_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error generating PDF report. Please try again.');
        }
    };

    const handlePrintSpares = () => {
        const dataToExport = selectedSpares.length > 0 ? getSelectedSpares() : filteredData;
        
        if (dataToExport.length === 0) {
            alert('No data to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Sun Powers - Spare Batteries Report</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { box-sizing: border-box; margin: 0; padding: 0; }
                            body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
                            .print-container { max-width: 1400px; margin: 0 auto; }
                            h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
                            .header-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                            .stats { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0; font-weight: 500; color: #166534; }
                            .table-responsive { overflow-x: auto; margin-top: 20px; }
                            table { width: 100%; border-collapse: collapse; min-width: 800px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                            th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #059669; }
                            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
                            tr:nth-child(even) { background: #f8fafc; }
                            .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
                            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
                            .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
                            .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
                            .print-btn { background: #10b981; color: white; }
                            .close-btn { background: #64748b; color: white; }
                            @media (max-width: 768px) {
                                body { margin: 10px; }
                                h1 { font-size: 20px; }
                                .header-info { flex-direction: column; gap: 10px; }
                                .stats { font-size: 14px; }
                            }
                            @media print {
                                body { margin: 0.5in; background: white; }
                                .no-print { display: none; }
                                th { background: #10b981 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                .table-responsive { overflow-x: visible; }
                                table { min-width: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <h1>🔋 Sun Powers - Spare Batteries Report</h1>
                            
                            <div class="header-info">
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                                <div><strong>Generated By:</strong> System</div>
                            </div>
                            
                            <div class="stats">
                                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                                    Total Spare Batteries: ${dataToExport.length} | 
                                    Selected: ${selectedSpares.length || dataToExport.length}
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Code</th>
                                            <th>Model</th>
                                            <th>Type</th>
                                            <th>Manufacturer</th>
                                            <th>Condition</th>
                                            <th>Warranty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dataToExport.map((spare, index) => {
                                            const conditionColor = getConditionColor(spare.current_condition);
                                            return `
                                                <tr>
                                                    <td style="text-align: center;">${index + 1}</td>
                                                    <td><strong>${spare.battery_code}</strong></td>
                                                    <td>${spare.battery_model}</td>
                                                    <td>${spare.battery_type}</td>
                                                    <td>${spare.manufacturer || 'N/A'}</td>
                                                    <td>
                                                        <span class="status-badge" style="background: ${conditionColor}; color: white;">
                                                            ${spare.current_condition || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>${spare.warranty_status || 'N/A'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="footer">
                                <p>Thank you for choosing Sun Powers Battery Service</p>
                                <p>This is a computer generated document - valid without signature</p>
                                <p>© ${new Date().getFullYear()} Sun Powers. All rights reserved.</p>
                            </div>
                            
                            <div class="no-print">
                                <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
                                <button class="close-btn" onclick="window.close()">✕ Close Window</button>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handlePrintUsages = () => {
        if (filteredSpareUsages.length === 0) {
            alert('No data to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Sun Powers - Spare Battery Out Report</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { box-sizing: border-box; margin: 0; padding: 0; }
                            body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
                            .print-container { max-width: 1400px; margin: 0 auto; }
                            h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
                            .header-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                            .stats { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0; font-weight: 500; color: #166534; }
                            .table-responsive { overflow-x: auto; margin-top: 20px; }
                            table { width: 100%; border-collapse: collapse; min-width: 1000px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                            th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #059669; }
                            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
                            tr:nth-child(even) { background: #f8fafc; }
                            .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; color: white; }
                            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
                            .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
                            .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
                            .print-btn { background: #10b981; color: white; }
                            .close-btn { background: #64748b; color: white; }
                            @media (max-width: 768px) {
                                body { margin: 10px; }
                                h1 { font-size: 20px; }
                                .header-info { flex-direction: column; gap: 10px; }
                                .stats { font-size: 14px; }
                            }
                            @media print {
                                body { margin: 0.5in; background: white; }
                                .no-print { display: none; }
                                th { background: #10b981 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                .table-responsive { overflow-x: visible; }
                                table { min-width: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <h1>🔋 Sun Powers - Spare Battery Out Report</h1>
                            
                            <div class="header-info">
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                                <div><strong>Generated By:</strong> System</div>
                            </div>
                            
                            <div class="stats">
                                <div><strong>📊 Report Summary:</strong> 
                                    Total Spare Usages: ${filteredSpareUsages.length}
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Service Code</th>
                                            <th>Customer Name</th>
                                            <th>Phone</th>
                                            <th>Battery Code</th>
                                            <th>Battery Model</th>
                                            <th>Battery Type</th>
                                            <th>Status</th>
                                            <th>Used Date</th>
                                            <th>Staff</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${filteredSpareUsages.map((usage, index) => {
                                            const statusColor = getUsageStatusColor(usage.status);
                                            return `
                                                <tr>
                                                    <td style="text-align: center;">${index + 1}</td>
                                                    <td><strong>${usage.service_code || 'N/A'}</strong></td>
                                                    <td>${usage.customer_name || 'N/A'}</td>
                                                    <td>${usage.customer_phone || 'N/A'}</td>
                                                    <td>${usage.battery_code || 'N/A'}</td>
                                                    <td>${usage.battery_model || 'N/A'}</td>
                                                    <td>${usage.battery_type || 'N/A'}</td>
                                                    <td>
                                                        <span class="status-badge" style="background: ${statusColor};">
                                                            ${usage.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>${formatDateTime(usage.used_at)}</td>
                                                    <td>${usage.service_staff_name || 'N/A'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="footer">
                                <p>Thank you for choosing Sun Powers Battery Service</p>
                                <p>This is a computer generated document - valid without signature</p>
                                <p>© ${new Date().getFullYear()} Sun Powers. All rights reserved.</p>
                            </div>
                            
                            <div class="no-print">
                                <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
                                <button class="close-btn" onclick="window.close()">✕ Close Window</button>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // Pagination functions
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= (viewMode === 'spares' ? totalPages : usageTotalPages)) {
            setCurrentPage(pageNumber);
            setPageInput(pageNumber.toString());
            if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = 0;
            }
        }
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const pageNumber = parseInt(pageInput);
            if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= (viewMode === 'spares' ? totalPages : usageTotalPages)) {
                goToPage(pageNumber);
            }
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
        setPageInput('1');
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const total = viewMode === 'spares' ? totalPages : usageTotalPages;
        const pageNumbers = [];
        const maxPagesToShow = windowWidth < 640 ? 3 : 5;
        
        if (total <= maxPagesToShow) {
            for (let i = 1; i <= total; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(total - 1, currentPage + 1);
            
            if (start > 2) {
                pageNumbers.push('...');
            }
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            
            if (end < total - 1) {
                pageNumbers.push('...');
            }
            
            if (total > 1) {
                pageNumbers.push(total);
            }
        }
        
        return pageNumbers;
    };

    // Handle filter changes
    const handleAllocationStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterAllocationStatusChange(e.target.value);
        setCurrentPage(1);
    };

    const handleBatteryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterBatteryTypeChange(e.target.value);
        setCurrentPage(1);
    };

    const handleWarrantyStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterWarrantyStatusChange(e.target.value);
        setCurrentPage(1);
    };

    const handleRefresh = async () => {
        try {
            if (onRefresh) {
                await onRefresh();
            }
            if (viewMode === 'spare_out') {
                await fetchSpareUsages();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            setLocalError('Failed to refresh data');
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00') return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return 'N/A';
        return new Date(dateTimeString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate statistics for spares
    const calculateStats = () => {
        const totalSpareBatteries = spares.length;
        const goodCondition = spares.filter(s => 
            ['excellent', 'good', 'new'].includes(s.current_condition?.toLowerCase())
        ).length;
        
        return [
            {
                title: "Total Spare Batteries",
                value: totalSpareBatteries,
                icon: <FiPackage />,
                color: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
            },
            {
                title: "Good Condition",
                value: goodCondition,
                icon: <FiCheckCircle />,
                color: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
            }
        ];
    };

    // Calculate statistics for spare out - Only Total Usages
    const calculateSpareOutStats = () => {
        const totalUsages = filteredSpareUsages.length;
        
        return [
            {
                title: "Total Usages",
                value: totalUsages,
                icon: <FiList />,
                color: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
            }
        ];
    };

    const stats = calculateStats();
    const spareOutStats = calculateSpareOutStats();

    // Responsive column visibility for spares
    const getVisibleColumns = () => {
        if (windowWidth >= 1280) {
            return {
                checkbox: true,
                code: true,
                model: true,
                type: true,
                manufacturer: true,
                condition: true,
                warranty: true,
                actions: true
            };
        } else if (windowWidth >= 1024) {
            return {
                checkbox: true,
                code: true,
                model: true,
                type: true,
                manufacturer: true,
                condition: true,
                warranty: true,
                actions: true
            };
        } else if (windowWidth >= 768) {
            return {
                checkbox: true,
                code: true,
                model: true,
                type: true,
                manufacturer: false,
                condition: true,
                warranty: true,
                actions: true
            };
        } else {
            return {
                checkbox: true,
                code: true,
                model: true,
                type: false,
                manufacturer: false,
                condition: true,
                warranty: false,
                actions: true
            };
        }
    };

    const visibleColumns = getVisibleColumns();

    // Mobile card view for spares
    const renderMobileSpareCard = (spare: SpareBattery) => {
        const isExpanded = expandedRows.includes(spare.id);
        
        return (
            <motion.div 
                key={spare.id}
                className="mobile-spare-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ backgroundColor: '#f0f9ff' }}
                onClick={() => toggleRowExpand(spare.id)}
                style={{
                    padding: '16px',
                    margin: '8px',
                    backgroundColor: selectedSpares.includes(spare.id) ? '#f0f9ff' : '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <button 
                        className="checkbox-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSpare(spare.id, e);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: selectedSpares.includes(spare.id) ? '#3B82F6' : '#94a3b8',
                            fontSize: '18px',
                            padding: 0
                        }}
                    >
                        {selectedSpares.includes(spare.id) ? <FiCheckSquare /> : <FiSquare />}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#3B82F6', fontSize: '14px' }}>{spare.battery_code}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{spare.battery_model}</div>
                    </div>
                    
                    <div style={{ fontSize: '18px', color: '#94a3b8' }}>
                        {isExpanded ? '−' : '+'}
                    </div>
                </div>
                
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Type</div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{spare.battery_type}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Condition</div>
                        <div>
                            <span 
                                className="status-badge"
                                style={{ 
                                    backgroundColor: getConditionColor(spare.current_condition),
                                    padding: '4px 8px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {getStatusIcon(spare.current_condition)}
                                <span>{spare.current_condition || 'Unknown'}</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Warranty Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Warranty</div>
                        <span 
                            className="warranty-badge"
                            style={{ 
                                backgroundColor: getWarrantyColor(spare.warranty_status || 'unknown'),
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                color: 'white',
                                display: 'inline-block'
                            }}
                        >
                            {spare.warranty_status || 'Unknown'}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Manufacturer</div>
                        <div style={{ fontSize: '13px' }}>{spare.manufacturer || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}
                    >
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Capacity & Voltage</div>
                            <div style={{ fontSize: '13px' }}>
                                <span>Capacity: {spare.capacity || 'N/A'} | </span>
                                <span>Voltage: {spare.voltage || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Purchase Date</div>
                            <div style={{ fontSize: '13px' }}>{formatDate(spare.purchase_date)}</div>
                        </div>
                        
                        {spare.notes && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                    {spare.notes}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <motion.button 
                        className="action-btn view"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(spare);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FiEye size={18} />
                    </motion.button>
                    
                    <motion.button 
                        className="action-btn delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(spare);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FiTrash2 size={18} />
                    </motion.button>
                </div>
            </motion.div>
        );
    };

    // Mobile card view for spare usages
    const renderMobileUsageCard = (usage: SpareUsage) => {
        const isExpanded = expandedRows.includes(usage.id);
        
        return (
            <motion.div 
                key={usage.id}
                className="mobile-usage-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ backgroundColor: '#f0f9ff' }}
                onClick={() => toggleRowExpand(usage.id)}
                style={{
                    padding: '16px',
                    margin: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#3B82F6', fontSize: '14px' }}>{usage.service_code || 'N/A'}</div>
                    <div style={{ marginLeft: 'auto', fontSize: '18px', color: '#94a3b8' }}>
                        {isExpanded ? '−' : '+'}
                    </div>
                </div>
                
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Customer</div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{usage.customer_name || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{usage.customer_phone || ''}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Battery</div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{usage.battery_code || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{usage.battery_model || ''}</div>
                    </div>
                </div>
                
                {/* Status and Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                        className="status-badge"
                        style={{ 
                            backgroundColor: getUsageStatusColor(usage.status),
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            color: 'white',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {getUsageStatusIcon(usage.status)}
                        <span>{usage.status || 'N/A'}</span>
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {formatDateTime(usage.used_at)}
                    </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}
                    >
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Details</div>
                            <div style={{ fontSize: '13px' }}>
                                <div>Type: {usage.battery_type || 'N/A'}</div>
                                <div>Manufacturer: {usage.manufacturer || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Service Staff</div>
                            <div style={{ fontSize: '13px' }}>{usage.service_staff_name || 'N/A'}</div>
                        </div>
                        
                        {usage.issue_description && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Issue</div>
                                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                    {usage.issue_description}
                                </div>
                            </div>
                        )}
                        
                        {usage.notes && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                    {usage.notes}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="spare-tab">
            {/* Stats Section */}
            <div className="stats-section">
                <div className="stats-grid">
                    {(viewMode === 'spares' ? stats : spareOutStats).map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="stat-icon-wrapper">
                                <div className="stat-icon" style={{ background: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-title">{stat.title}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile Header */}
            {windowWidth < 768 && (
                <div className="mobile-header">
                    <div className="mobile-header-left">
                        <button 
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FiMenu />
                        </button>
                        <h3>{viewMode === 'spares' ? 'Spare Batteries' : 'Spare Out List'}</h3>
                    </div>
                    <div className="mobile-header-right">
                        <button 
                            className="mobile-filter-btn"
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                        >
                            <FiFilter />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Menu - View Toggle Buttons */}
            {isMobileMenuOpen && windowWidth < 768 && (
                <div className="mobile-menu" ref={menuRef}>
                    <div className="mobile-menu-content">
                        <button
                            className={`mobile-menu-item ${viewMode === 'spares' ? 'active' : ''}`}
                            onClick={() => {
                                setViewMode('spares');
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <FiPackage /> Spare Batteries
                        </button>
                        <button
                            className={`mobile-menu-item ${viewMode === 'spare_out' ? 'active' : ''}`}
                            onClick={() => {
                                fetchSpareUsages();
                                setIsMobileMenuOpen(false);
                            }}
                            disabled={loadingSpareOut}
                        >
                            <FiList /> Spare Out List
                            {loadingSpareOut && <span className="loading-dots">...</span>}
                        </button>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className={`filters-section ${windowWidth < 768 && isFilterMenuOpen ? 'mobile-filters-open' : ''}`}>
                <div className="filters-left">
                    {/* Desktop View Toggle */}
                    {windowWidth >= 768 && (
                        <div className="view-toggle">
                            <button
                                className={`view-toggle-btn ${viewMode === 'spares' ? 'active' : ''}`}
                                onClick={() => {
                                    setViewMode('spares');
                                    setCurrentPage(1);
                                }}
                            >
                                <FiPackage /> Spare Batteries
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'spare_out' ? 'active' : ''}`}
                                onClick={fetchSpareUsages}
                                disabled={loadingSpareOut}
                            >
                                <FiList /> Spare Out List
                                {loadingSpareOut && <span className="loading-dots">...</span>}
                            </button>
                        </div>
                    )}

                    {/* Search Box */}
                    <div className="search-container">
                        <div className="search-type-selector">
                            <button
                                className={`search-type-btn ${searchType === 'all' ? 'active' : ''}`}
                                onClick={() => handleSearchTypeChange('all')}
                                title="Search All"
                            >
                                {windowWidth < 640 ? 'All' : 'All'}
                            </button>
                            {viewMode === 'spares' ? (
                                <>
                                    <button
                                        className={`search-type-btn ${searchType === 'model' ? 'active' : ''}`}
                                        onClick={() => handleSearchTypeChange('model')}
                                        title="Search by Model"
                                    >
                                        <FiBattery />
                                    </button>
                                    <button
                                        className={`search-type-btn ${searchType === 'code' ? 'active' : ''}`}
                                        onClick={() => handleSearchTypeChange('code')}
                                        title="Search by Code"
                                    >
                                        <FiHash />
                                    </button>
                                    {windowWidth >= 640 && (
                                        <button
                                            className={`search-type-btn ${searchType === 'manufacturer' ? 'active' : ''}`}
                                            onClick={() => handleSearchTypeChange('manufacturer')}
                                            title="Search by Manufacturer"
                                        >
                                            <FiUser />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        className={`search-type-btn ${searchType === 'service_code' ? 'active' : ''}`}
                                        onClick={() => handleSearchTypeChange('service_code')}
                                        title="Search by Service Code"
                                    >
                                        <FiHash />
                                    </button>
                                    <button
                                        className={`search-type-btn ${searchType === 'customer' ? 'active' : ''}`}
                                        onClick={() => handleSearchTypeChange('customer')}
                                        title="Search by Customer"
                                    >
                                        <FiUser />
                                    </button>
                                    {windowWidth >= 640 && (
                                        <button
                                            className={`search-type-btn ${searchType === 'model' ? 'active' : ''}`}
                                            onClick={() => handleSearchTypeChange('model')}
                                            title="Search by Battery Model"
                                        >
                                            <FiBattery />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="search-input"
                                value={localSearchTerm}
                                onChange={handleSearchInputChange}
                            />
                            {localSearchTerm && (
                                <button
                                    className="clear-search-btn"
                                    onClick={handleClearSearch}
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="filter-group">
                        <FiCalendar className="filter-icon" />
                        <select
                            className="filter-select"
                            value={dateFilterType}
                            onChange={handleDateFilterChange}
                        >
                            {dateFilterOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {windowWidth < 640 ? option.label.split(' ')[0] : option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {dateFilterType === 'custom' && (
                        <div className="custom-date-range">
                            <input
                                type="date"
                                value={customDateRange.start}
                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                className="date-input"
                                placeholder="From"
                            />
                            <span className="date-separator">to</span>
                            <input
                                type="date"
                                value={customDateRange.end}
                                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                className="date-input"
                                placeholder="To"
                                min={customDateRange.start}
                            />
                        </div>
                    )}

                    {dateFilterType === 'year' && (
                        <div className="filter-group">
                            <FiCalendar className="filter-icon" />
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="filter-select"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {dateFilterType === 'month' && (
                        <>
                            <div className="filter-group">
                                <FiCalendar className="filter-icon" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleMonthChange(e.target.value)}
                                    className="filter-select"
                                >
                                    {monthOptions.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {windowWidth < 640 ? month.label.substring(0, 3) : month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <FiCalendar className="filter-icon" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                    className="filter-select"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Spare-specific filters */}
                    {viewMode === 'spares' && windowWidth >= 768 && (
                        <>
                            <div className="filter-group">
                                <FiFilter className="filter-icon" />
                                <select
                                    className="filter-select"
                                    value={filterBatteryType}
                                    onChange={handleBatteryTypeChange}
                                >
                                    <option value="all">All Types</option>
                                    {batteryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <FiPackage className="filter-icon" />
                                <select
                                    className="filter-select"
                                    value={filterAllocationStatus}
                                    onChange={handleAllocationStatusChange}
                                >
                                    <option value="all">All Conditions</option>
                                    {conditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <FiBattery className="filter-icon" />
                                <select
                                    className="filter-select"
                                    value={filterWarrantyStatus}
                                    onChange={handleWarrantyStatusChange}
                                >
                                    {warrantyStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'all' ? 'All Warranty' : 
                                             status === 'active' ? 'Active' :
                                             status === 'expired' ? 'Expired' :
                                             'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="filters-right">
                    {/* Export Buttons */}
                    {viewMode === 'spares' ? (
                        <>
                            <motion.button 
                                className="btn csv-btn"
                                onClick={exportSparesToCSV}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Export to CSV"
                                disabled={filteredData.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiDownload /> CSV</> : <FiDownload />}
                            </motion.button>
                            <motion.button 
                                className="btn pdf-btn"
                                onClick={exportSparesToPDF}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Export to PDF"
                                disabled={filteredData.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiFileText /> PDF</> : <FiFileText />}
                            </motion.button>
                            <motion.button 
                                className="btn print-btn"
                                onClick={handlePrintSpares}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Print Report"
                                disabled={filteredData.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiPrinter /> Print</> : <FiPrinter />}
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button 
                                className="btn csv-btn"
                                onClick={exportUsagesToCSV}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Export to CSV"
                                disabled={filteredSpareUsages.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiDownload /> CSV</> : <FiDownload />}
                            </motion.button>
                            <motion.button 
                                className="btn pdf-btn"
                                onClick={exportUsagesToPDF}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Export to PDF"
                                disabled={filteredSpareUsages.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiFileText /> PDF</> : <FiFileText />}
                            </motion.button>
                            <motion.button 
                                className="btn print-btn"
                                onClick={handlePrintUsages}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Print Report"
                                disabled={filteredSpareUsages.length === 0}
                            >
                                {windowWidth >= 640 ? <><FiPrinter /> Print</> : <FiPrinter />}
                            </motion.button>
                        </>
                    )}
                    <motion.button
                        className="btn secondary refresh-btn"
                        onClick={handleRefresh}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading || loadingSpareOut}
                        title="Refresh data"
                    >
                        <FiRefreshCw className={loading || loadingSpareOut ? 'spinning' : ''} />
                    </motion.button>
                </div>
            </div>

            {/* Active Filters Bar */}
            {dateFilterType !== 'all' && (
                <div className="active-filters-bar">
                    <div className="filter-info">
                        <FiCalendar size={14} />
                        <span>Showing: {getDateRangeText()}</span>
                    </div>
                    <button className="clear-filters" onClick={clearFilters}>
                        <FiX size={14} />
                        {windowWidth >= 640 ? 'Clear Filters' : ''}
                    </button>
                </div>
            )}

            {/* Selection Bar - Only for Spares */}
            {viewMode === 'spares' && (
                <div className="selection-bar" style={{ display: selectedSpares.length > 0 ? 'flex' : 'none' }}>
                    <FiCheckSquare />
                    <span>{selectedSpares.length} item{selectedSpares.length !== 1 ? 's' : ''} selected</span>
                    <button onClick={() => setSelectedSpares([])}>Clear</button>
                </div>
            )}

            {/* Error Message */}
            {localError && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{localError}</span>
                    <button onClick={() => setLocalError('')}>×</button>
                </div>
            )}

            {/* Loading State */}
            {(loading || loadingSpareOut) && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>{viewMode === 'spares' ? 'Loading spare batteries...' : 'Loading spare out list...'}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !loadingSpareOut && viewMode === 'spares' && filteredData.length === 0 && (
                <div className="empty-state">
                    <FiPackage className="empty-icon" />
                    <h3>No Spare Batteries Found</h3>
                    <p>No spare batteries match your search criteria.</p>
                    <div className="empty-state-tips">
                        <p>Try:</p>
                        <ul>
                            <li>Checking your search terms</li>
                            <li>Changing the type or condition filters</li>
                            <li>Adjusting the date range</li>
                        </ul>
                    </div>
                </div>
            )}

            {!loading && !loadingSpareOut && viewMode === 'spare_out' && filteredSpareUsages.length === 0 && (
                <div className="empty-state">
                    <FiList className="empty-icon" />
                    <h3>No Spare Out Records Found</h3>
                    <p>No spare battery usage records have been found.</p>
                    <div className="empty-state-tips">
                        <p>Try:</p>
                        <ul>
                            <li>Checking your search terms</li>
                            <li>Adjusting the date range</li>
                            <li>Creating service orders that use spare batteries</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Table/Card View - Spares */}
            {!loading && viewMode === 'spares' && filteredData.length > 0 && (
                <>
                    {windowWidth < 768 ? (
                        // Mobile Card View
                        <div style={{ marginBottom: '16px' }}>
                            {currentItems.map(spare => renderMobileSpareCard(spare))}
                        </div>
                    ) : (
                        // Desktop/Tablet Table View
                        <>
                            <div className="replacements-table-container" ref={tableContainerRef}>
                                <table className="replacements-table">
                                    <thead>
                                        <tr>
                                            {visibleColumns.checkbox && (
                                                <th className="checkbox-column">
                                                    <button className="checkbox-btn" onClick={handleSelectAll}>
                                                        {selectAll ? <FiCheckSquare /> : <FiSquare />}
                                                    </button>
                                                </th>
                                            )}
                                            {visibleColumns.code && <th>Code</th>}
                                            {visibleColumns.model && <th>Model</th>}
                                            {visibleColumns.type && <th>Type</th>}
                                            {visibleColumns.manufacturer && <th>Manufacturer</th>}
                                            {visibleColumns.condition && <th>Condition</th>}
                                            {visibleColumns.warranty && <th>Warranty</th>}
                                            {visibleColumns.actions && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((spare) => (
                                            <motion.tr 
                                                key={spare.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ backgroundColor: '#f0f9ff', cursor: 'pointer' }}
                                                className={selectedSpares.includes(spare.id) ? 'selected-row' : ''}
                                                onClick={(e) => handleRowClick(spare, e)}
                                            >
                                                {visibleColumns.checkbox && (
                                                    <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            className="checkbox-btn"
                                                            onClick={(e) => handleSelectSpare(spare.id, e)}
                                                        >
                                                            {selectedSpares.includes(spare.id) ? <FiCheckSquare /> : <FiSquare />}
                                                        </button>
                                                    </td>
                                                )}
                                                {visibleColumns.code && (
                                                    <td>
                                                        <span className="service-code-cell">
                                                            <FiHash className="inline-icon" />
                                                            {spare.battery_code}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.model && (
                                                    <td>
                                                        <div className="battery-cell">
                                                            <div className="battery-model">{spare.battery_model}</div>
                                                            {spare.battery_type && windowWidth < 768 && (
                                                                <div className="battery-type" style={{ 
                                                                    color: getBatteryTypeColor(spare.battery_type),
                                                                    fontSize: '0.8em',
                                                                    marginTop: '2px'
                                                                }}>
                                                                    {spare.battery_type}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.type && (
                                                    <td>
                                                        <span className="type-badge" style={{ 
                                                            backgroundColor: getBatteryTypeColor(spare.battery_type) 
                                                        }}>
                                                            {spare.battery_type}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.manufacturer && <td>{spare.manufacturer}</td>}
                                                {visibleColumns.condition && (
                                                    <td>
                                                        <span 
                                                            className="status-badge"
                                                            style={{ backgroundColor: getConditionColor(spare.current_condition) }}
                                                        >
                                                            {getStatusIcon(spare.current_condition)}
                                                            <span>{spare.current_condition || 'Unknown'}</span>
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.warranty && (
                                                    <td>
                                                        <span 
                                                            className="warranty-badge"
                                                            style={{ backgroundColor: getWarrantyColor(spare.warranty_status || 'unknown') }}
                                                        >
                                                            {spare.warranty_status || 'Unknown'}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.actions && (
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <div className="table-actions">
                                                            <motion.button
                                                                className="action-btn view"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetails(spare);
                                                                }}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                title="View Details"
                                                            >
                                                                <FiEye />
                                                            </motion.button>
                                                            <motion.button
                                                                className="action-btn delete"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(spare);
                                                                }}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for Spares */}
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    {windowWidth >= 640 ? (
                                        <>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries</>
                                    ) : (
                                        <>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}</>
                                    )}
                                </div>
                                
                                <div className="pagination-controls">
                                    {windowWidth >= 768 && (
                                        <div className="items-per-page">
                                            <span>Show:</span>
                                            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                                {itemsPerPageOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="pagination-buttons">
                                        <button 
                                            onClick={() => goToPage(1)} 
                                            disabled={currentPage === 1}
                                            className="pagination-btn"
                                            title="First Page"
                                        >
                                            <FiChevronsLeft />
                                        </button>
                                        <button 
                                            onClick={() => goToPage(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="pagination-btn"
                                            title="Previous Page"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        
                                        <div className="page-numbers">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => goToPage(page as number)}
                                                        className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => goToPage(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            className="pagination-btn"
                                            title="Next Page"
                                        >
                                            <FiChevronRight />
                                        </button>
                                        <button 
                                            onClick={() => goToPage(totalPages)} 
                                            disabled={currentPage === totalPages}
                                            className="pagination-btn"
                                            title="Last Page"
                                        >
                                            <FiChevronsRight />
                                        </button>
                                    </div>

                                    {windowWidth >= 1024 && (
                                        <div className="page-jump">
                                            <span>Go to page:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={totalPages}
                                                value={pageInput}
                                                onChange={handlePageInputChange}
                                                onKeyPress={handlePageInputKeyPress}
                                                className="page-input"
                                            />
                                            <span>of {totalPages}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary Footer */}
                            {windowWidth >= 768 && (
                                <div className="summary-footer">
                                    <div className="summary-info">
                                        <span className="results-count">
                                            Showing {filteredData.length} of {spares.length} spare batteries
                                        </span>
                                        {localSearchTerm && (
                                            <span className="search-info">
                                                <FiSearch /> Searching for "{localSearchTerm}" in {searchType === 'all' ? 'all fields' : searchType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="summary-totals">
                                        <div className="total-item">
                                            <span className="total-label">Good Condition:</span>
                                            <span className="total-value">
                                                {filteredData.filter(s => ['excellent', 'good', 'new'].includes(s.current_condition?.toLowerCase())).length}
                                            </span>
                                        </div>
                                        <div className="total-item">
                                            <span className="total-label">Fair/Poor:</span>
                                            <span className="total-value">
                                                {filteredData.filter(s => ['fair', 'poor', 'damaged', 'defective'].includes(s.current_condition?.toLowerCase())).length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Table/Card View - Spare Out */}
            {!loadingSpareOut && viewMode === 'spare_out' && filteredSpareUsages.length > 0 && (
                <>
                    {windowWidth < 768 ? (
                        // Mobile Card View
                        <div style={{ marginBottom: '16px' }}>
                            {currentUsages.map(usage => renderMobileUsageCard(usage))}
                        </div>
                    ) : (
                        // Desktop/Tablet Table View
                        <>
                            <div className="replacements-table-container" ref={tableContainerRef}>
                                <table className="replacements-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Service Code</th>
                                            {windowWidth >= 768 && <th>Customer</th>}
                                            {windowWidth >= 1024 && <th>Phone</th>}
                                            <th>Battery</th>
                                            {windowWidth >= 640 && <th>Type</th>}
                                            <th>Status</th>
                                            {windowWidth >= 768 && <th>Used Date</th>}
                                            {windowWidth >= 1024 && <th>Staff</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsages.map((usage, index) => (
                                            <motion.tr 
                                                key={usage.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                whileHover={{ backgroundColor: '#f0f9ff', cursor: 'pointer' }}
                                                onClick={(e) => handleUsageRowClick(usage, e)}
                                            >
                                                <td className="text-center">{usageIndexOfFirstItem + index + 1}</td>
                                                <td>
                                                    <span className="service-code-cell">
                                                        <FiHash className="inline-icon" />
                                                        {usage.service_code || 'N/A'}
                                                    </span>
                                                </td>
                                                {windowWidth >= 768 && (
                                                    <td>
                                                        <div className="customer-info">
                                                            <FiUser className="inline-icon" />
                                                            {usage.customer_name || 'N/A'}
                                                        </div>
                                                    </td>
                                                )}
                                                {windowWidth >= 1024 && (
                                                    <td>
                                                        <div className="phone-info">
                                                            <FiPhone className="inline-icon" />
                                                            {usage.customer_phone || 'N/A'}
                                                        </div>
                                                    </td>
                                                )}
                                                <td>
                                                    <div className="battery-info">
                                                        <span className="battery-code">{usage.battery_code || 'N/A'}</span>
                                                        {windowWidth >= 640 && (
                                                            <span className="battery-model-small">({usage.battery_model || 'N/A'})</span>
                                                        )}
                                                    </div>
                                                </td>
                                                {windowWidth >= 640 && (
                                                    <td>
                                                        <span className="type-badge-small" style={{ 
                                                            backgroundColor: getBatteryTypeColor(usage.battery_type || 'Unknown'),
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px'
                                                        }}>
                                                            {usage.battery_type || 'N/A'}
                                                        </span>
                                                    </td>
                                                )}
                                                <td>
                                                    <span 
                                                        className="status-badge"
                                                        style={{ backgroundColor: getUsageStatusColor(usage.status) }}
                                                    >
                                                        {getUsageStatusIcon(usage.status)}
                                                        <span>{usage.status || 'N/A'}</span>
                                                    </span>
                                                </td>
                                                {windowWidth >= 768 && (
                                                    <td>
                                                        <div className="date-info">
                                                            <FiCalendar className="inline-icon" />
                                                            {formatDateTime(usage.used_at)}
                                                        </div>
                                                    </td>
                                                )}
                                                {windowWidth >= 1024 && (
                                                    <td>{usage.service_staff_name || 'N/A'}</td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for Spare Out */}
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    {windowWidth >= 640 ? (
                                        <>Showing {usageIndexOfFirstItem + 1} to {Math.min(usageIndexOfLastItem, filteredSpareUsages.length)} of {filteredSpareUsages.length} entries</>
                                    ) : (
                                        <>{usageIndexOfFirstItem + 1}-{Math.min(usageIndexOfLastItem, filteredSpareUsages.length)} of {filteredSpareUsages.length}</>
                                    )}
                                </div>
                                
                                <div className="pagination-controls">
                                    {windowWidth >= 768 && (
                                        <div className="items-per-page">
                                            <span>Show:</span>
                                            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                                {itemsPerPageOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="pagination-buttons">
                                        <button 
                                            onClick={() => goToPage(1)} 
                                            disabled={currentPage === 1}
                                            className="pagination-btn"
                                            title="First Page"
                                        >
                                            <FiChevronsLeft />
                                        </button>
                                        <button 
                                            onClick={() => goToPage(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="pagination-btn"
                                            title="Previous Page"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        
                                        <div className="page-numbers">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => goToPage(page as number)}
                                                        className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => goToPage(currentPage + 1)} 
                                            disabled={currentPage === usageTotalPages}
                                            className="pagination-btn"
                                            title="Next Page"
                                        >
                                            <FiChevronRight />
                                        </button>
                                        <button 
                                            onClick={() => goToPage(usageTotalPages)} 
                                            disabled={currentPage === usageTotalPages}
                                            className="pagination-btn"
                                            title="Last Page"
                                        >
                                            <FiChevronsRight />
                                        </button>
                                    </div>

                                    {windowWidth >= 1024 && (
                                        <div className="page-jump">
                                            <span>Go to page:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={usageTotalPages}
                                                value={pageInput}
                                                onChange={handlePageInputChange}
                                                onKeyPress={handlePageInputKeyPress}
                                                className="page-input"
                                            />
                                            <span>of {usageTotalPages}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Modals */}
            {showDetailModal && selectedSpare && (
                <SpareDetailModal
                    spare={selectedSpare}
                    onClose={() => setShowDetailModal(false)}
                    onEdit={() => {
                        setShowDetailModal(false);
                        handleEdit(selectedSpare);
                    }}
                    getBatteryTypeColor={getBatteryTypeColor}
                    getConditionColor={getConditionColor}
                    getAllocationStatusColor={getAllocationStatusColor}
                />
            )}

            {showFormModal && (
                <SpareFormModal
                    spare={selectedSpare}
                    onClose={handleCloseFormModal}
                    onSave={handleFormSubmit}
                    loading={loading}
                />
            )}

            {showDeleteModal && selectedSpare && (
                <DeleteConfirmationModal
                    itemType="spare_battery"
                    itemId={selectedSpare.id}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedSpare(null);
                    }}
                    onConfirm={confirmDelete}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default SpareTab;
