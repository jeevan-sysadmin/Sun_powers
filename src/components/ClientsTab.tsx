import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUsers,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiEye,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiCheckSquare,
  FiSquare,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiTag,
  FiHome,
  FiMap,
  FiGlobe,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiSliders
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "./css/Clients.css";

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
  total_services: string;
  service_count: number;
}

interface ClientsTabProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: number) => void;
  onNewCustomer: () => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({
  customers,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onNewCustomer
}) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterServiceCount, setFilterServiceCount] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  
  // Date filter states
  const [dateFilterType, setDateFilterType] = useState<string>('all');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // Selection state
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pageInput, setPageInput] = useState('1');
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const itemsPerPageOptions = [5, 10, 15, 20, 50, 100];

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

  // Adjust items per page based on screen size
  useEffect(() => {
    if (isMobile) {
      setItemsPerPage(10);
    } else if (isTablet) {
      setItemsPerPage(15);
    } else {
      setItemsPerPage(20);
    }
  }, [isMobile, isTablet]);

  // Date filter options
  const dateFilterOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Month options
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

  // Year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Get unique cities for filters
  const uniqueCities = useMemo(() => {
    const cities = customers
      .map(c => c.city)
      .filter((city, index, self) => city && self.indexOf(city) === index)
      .sort();
    return ['all', ...cities];
  }, [customers]);

  // Get unique states for filters
  const uniqueStates = useMemo(() => {
    const states = customers
      .map(c => c.state)
      .filter((state, index, self) => state && self.indexOf(state) === index)
      .sort();
    return ['all', ...states];
  }, [customers]);

  // Service count filter options
  const serviceCountOptions = [
    { value: 'all', label: 'All Services' },
    { value: '0', label: 'No Services' },
    { value: '1-5', label: '1-5 Services' },
    { value: '6-10', label: '6-10 Services' },
    { value: '10+', label: '10+ Services' }
  ];

  // Apply date filter function
  const applyDateFilter = (data: Customer[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilterType) {
      case 'today':
        return data.filter(customer => {
          const customerDate = new Date(customer.created_at);
          customerDate.setHours(0, 0, 0, 0);
          return customerDate.getTime() === today.getTime();
        });

      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return data.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate >= startOfWeek && customerDate <= endOfWeek;
        });
      }

      case 'month':
        return data.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate.getMonth() === selectedMonth - 1 && 
                 customerDate.getFullYear() === selectedYear;
        });

      case 'year':
        return data.filter(customer => {
          const customerDate = new Date(customer.created_at);
          return customerDate.getFullYear() === selectedYear;
        });

      case 'custom':
        if (customFromDate && customToDate) {
          const from = new Date(customFromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(customToDate);
          to.setHours(23, 59, 59, 999);

          return data.filter(customer => {
            const customerDate = new Date(customer.created_at);
            return customerDate >= from && customerDate <= to;
          });
        }
        return data;

      default:
        return data;
    }
  };

  // Filter customers based on all filters
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        return (
          customer.customer_code.toLowerCase().includes(term) ||
          customer.full_name.toLowerCase().includes(term) ||
          customer.phone.includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.city?.toLowerCase().includes(term)
        );
      });
    }

    // Apply city filter
    if (filterCity !== 'all') {
      filtered = filtered.filter(customer => customer.city === filterCity);
    }

    // Apply state filter
    if (filterState !== 'all') {
      filtered = filtered.filter(customer => customer.state === filterState);
    }

    // Apply service count filter
    if (filterServiceCount !== 'all') {
      switch (filterServiceCount) {
        case '0':
          filtered = filtered.filter(c => (parseInt(c.service_count?.toString()) || 0) === 0);
          break;
        case '1-5':
          filtered = filtered.filter(c => {
            const cnt = parseInt(c.service_count?.toString()) || 0;
            return cnt >= 1 && cnt <= 5;
          });
          break;
        case '6-10':
          filtered = filtered.filter(c => {
            const cnt = parseInt(c.service_count?.toString()) || 0;
            return cnt >= 6 && cnt <= 10;
          });
          break;
        case '10+':
          filtered = filtered.filter(c => (parseInt(c.service_count?.toString()) || 0) > 10);
          break;
      }
    }

    // Apply date filter
    filtered = applyDateFilter(filtered);

    return filtered;
  }, [customers, searchTerm, filterCity, filterState, filterServiceCount, dateFilterType, customFromDate, customToDate, selectedYear, selectedMonth]);

  // Handle date filter change
  const handleDateFilterChange = (type: string) => {
    setDateFilterType(type);
    setCurrentPage(1);
    setPageInput('1');
    
    if (type === 'custom' && !customFromDate && !customToDate) {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      setCustomFromDate(sevenDaysAgo.toISOString().split('T')[0]);
      setCustomToDate(today.toISOString().split('T')[0]);
    }
  };

  const handleCustomDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setCustomFromDate(value);
    } else {
      setCustomToDate(value);
    }
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(parseInt(month));
    setCurrentPage(1);
    setPageInput('1');
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
        return customFromDate && customToDate ? 
          `${new Date(customFromDate).toLocaleDateString()} - ${new Date(customToDate).toLocaleDateString()}` : 
          'Custom Range';
      default:
        return 'All Dates';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCity('all');
    setFilterState('all');
    setFilterServiceCount('all');
    setDateFilterType('all');
    setCustomFromDate('');
    setCustomToDate('');
    setSelectedYear(currentYear);
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedItems([]);
    setCurrentPage(1);
    setPageInput('1');
    setShowMobileFilters(false);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
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
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        goToPage(pageNumber);
      }
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
    setPageInput('1');
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setPageInput('1');
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedItems([...selectedItems, id]);
      if (selectedItems.length + 1 === currentItems.length) {
        setSelectAll(true);
      }
    }
  };

  useEffect(() => {
    if (currentItems.length > 0 && selectedItems.length === currentItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, currentItems]);

  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const getSelectedCustomers = () => {
    return filteredCustomers.filter(customer => selectedItems.includes(customer.id));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // ============== EXPORT FUNCTIONS ==============

  const exportToCSV = () => {
    try {
      const dataToExport = selectedItems.length > 0 ? getSelectedCustomers() : filteredCustomers;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Customer Code', 'Full Name', 'Email', 'Phone', 'Address',
        'City', 'State', 'Zip Code', 'Service Count', 'Total Services Amount',
        'Notes', 'Created Date'
      ];
      
      const rows = dataToExport.map(customer => [
        customer.customer_code,
        customer.full_name,
        customer.email || 'N/A',
        customer.phone,
        customer.address || 'N/A',
        customer.city || 'N/A',
        customer.state || 'N/A',
        customer.zip_code || 'N/A',
        customer.service_count || 0,
        customer.total_services || '0',
        customer.notes || 'N/A',
        formatDate(customer.created_at)
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clients');
      XLSX.writeFile(wb, `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const generateCustomerPDF = (customer: Customer) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Battery & Inverter Service Center', 105, 22, { align: 'center' });
      doc.text('123, Electronics City, Bangalore - 560100 | Tel: +91 9876543210', 105, 28, { align: 'center' });

      doc.setTextColor(59, 130, 246);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER PROFILE', 105, 45, { align: 'center' });

      // Customer Info Box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(20, 50, 170, 22);

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('Customer ID:', 25, 58);
      doc.text('Customer Code:', 25, 65);
      doc.text('Registered On:', 25, 72);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`CUST-${customer.id.toString().padStart(6, '0')}`, 60, 58);
      doc.text(customer.customer_code, 60, 65);
      doc.text(formatDateTime(customer.created_at), 60, 72);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Total Services:', 120, 58);
      doc.text('Service Value:', 120, 65);
      doc.text('Status:', 120, 72);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(customer.service_count?.toString() || '0', 160, 58);
      doc.text(`₹${customer.total_services || '0'}`, 160, 65);
      doc.setTextColor(customer.service_count > 0 ? '#059669' : '#dc2626');
      doc.text(customer.service_count > 0 ? 'Active' : 'Inactive', 160, 72);

      // Personal Information
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PERSONAL INFORMATION', 20, 85);

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 87, 80, 87);

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Full Name:', 20, 95);
      doc.text('Phone Number:', 20, 102);
      doc.text('Email Address:', 20, 109);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(customer.full_name, 60, 95);
      doc.text(customer.phone, 60, 102);
      doc.text(customer.email || 'Not provided', 60, 109);

      // Address Information
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ADDRESS INFORMATION', 20, 125);

      doc.setDrawColor(59, 130, 246);
      doc.line(20, 127, 80, 127);

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      const startY = 135;
      const col1X = 20;
      const col2X = 60;

      doc.setFont('helvetica', 'bold');
      doc.text('Address:', col1X, startY);
      doc.text('City:', col1X, startY + 7);
      doc.text('State:', col1X, startY + 14);
      doc.text('Zip Code:', col1X, startY + 21);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const addressLines = doc.splitTextToSize(customer.address || 'Not provided', 80);
      doc.text(addressLines, col2X, startY);
      doc.text(customer.city || 'N/A', col2X, startY + 7);
      doc.text(customer.state || 'N/A', col2X, startY + 14);
      doc.text(customer.zip_code || 'N/A', col2X, startY + 21);

      // Service Summary
      const summaryY = startY + 35;
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SERVICE SUMMARY', 20, summaryY);

      doc.setDrawColor(59, 130, 246);
      doc.line(20, summaryY + 2, 80, summaryY + 2);

      const tableY = summaryY + 10;
      
      doc.setFillColor(59, 130, 246);
      doc.rect(20, tableY - 5, 170, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Metric', 25, tableY - 1);
      doc.text('Value', 180, tableY - 1, { align: 'right' });

      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      
      const items = [
        { metric: 'Total Services', value: customer.service_count?.toString() || '0' },
        { metric: 'Total Service Value', value: `₹${customer.total_services || '0'}` },
        { metric: 'Average Service Value', value: `₹${(parseFloat(customer.total_services || '0') / (customer.service_count || 1)).toFixed(2)}` }
      ];

      items.forEach((item, index) => {
        const y = tableY + 5 + (index * 5);
        doc.text(item.metric, 25, y);
        doc.text(item.value, 180, y, { align: 'right' });
      });

      // Notes
      if (customer.notes) {
        const notesY = tableY + 30;
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', 20, notesY);
        
        doc.setDrawColor(59, 130, 246);
        doc.line(20, notesY + 2, 50, notesY + 2);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        const noteLines = doc.splitTextToSize(customer.notes, 170);
        doc.text(noteLines, 20, notesY + 10);
      }

      // Footer
      const footerY = 270;
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, footerY, 190, footerY);

      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer generated customer profile - valid without signature', 105, footerY + 8, { align: 'center' });
      doc.text('Thank you for choosing Sun Powers Battery Service', 105, footerY + 13, { align: 'center' });
      doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 105, footerY + 18, { align: 'center' });

      doc.save(`customer_profile_${customer.customer_code}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Error generating customer profile. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedItems.length > 0 ? getSelectedCustomers() : filteredCustomers;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - CLIENTS REPORT', 148.5, 13, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, 14, 30);
      doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
      
      if (selectedItems.length > 0) {
        doc.text(`Selected Records: ${selectedItems.length}`, 14, 45);
      }

      const headers = [
        ['S.No', 'Customer Code', 'Name', 'Phone', 'Email', 'City', 'State', 'Services', 'Service Value', 'Created Date']
      ];
      
      const tableData = dataToExport.map((customer, index) => [
        (index + 1).toString(),
        customer.customer_code,
        customer.full_name,
        customer.phone,
        customer.email || 'N/A',
        customer.city || 'N/A',
        customer.state || 'N/A',
        (customer.service_count || 0).toString(),
        `₹${customer.total_services || '0'}`,
        formatDate(customer.created_at)
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: selectedItems.length > 0 ? 50 : 45,
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
          fillColor: [59, 130, 246], 
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
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 22 },
          4: { cellWidth: 30 },
          5: { cellWidth: 18 },
          6: { cellWidth: 18 },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 22, halign: 'right' },
          9: { cellWidth: 22, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Clients Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`clients_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const printCustomers = () => {
    const dataToExport = selectedItems.length > 0 ? getSelectedCustomers() : filteredCustomers;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Clients Report</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1200px; margin: 0 auto; }
              h1 { color: #3b82f6; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bfdbfe; font-weight: 500; color: #1e40af; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #3b82f6; color: white; padding: 10px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; border: 1px solid #2563eb; }
              td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #3b82f6; color: white; }
              .close-btn { background: #64748b; color: white; }
              .date-range { color: #1e40af; margin-bottom: 10px; font-size: 14px; }
              @media print {
                body { margin: 0.5in; background: white; }
                .no-print { display: none; }
                th { background: #3b82f6 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🏭 Sun Powers - Clients Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Clients: ${dataToExport.length} | 
                  Selected Clients: ${selectedItems.length || dataToExport.length} |
                  Report Type: ${selectedItems.length > 0 ? 'Selected Items' : 'All Filtered Items'}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th style="width: 5%;">S.No</th>
                    <th style="width: 10%;">Code</th>
                    <th style="width: 15%;">Name</th>
                    <th style="width: 10%;">Phone</th>
                    <th style="width: 15%;">Email</th>
                    <th style="width: 8%;">City</th>
                    <th style="width: 8%;">State</th>
                    <th style="width: 8%;">Services</th>
                    <th style="width: 10%;">Service Value</th>
                    <th style="width: 10%;">Created</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map((customer, index) => `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td><strong>${customer.customer_code}</strong></td>
                      <td>${customer.full_name}</td>
                      <td>${customer.phone}</td>
                      <td>${customer.email || 'N/A'}</td>
                      <td>${customer.city || 'N/A'}</td>
                      <td>${customer.state || 'N/A'}</td>
                      <td style="text-align: center;">${customer.service_count || 0}</td>
                      <td style="text-align: right;">₹${customer.total_services || '0'}</td>
                      <td>${formatDate(customer.created_at)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = isMobile ? 3 : 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let start = Math.max(2, currentPage - (isMobile ? 1 : 1));
      let end = Math.min(totalPages - 1, currentPage + (isMobile ? 1 : 1));
      
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Mobile card view render
  const renderMobileCard = (customer: Customer) => {
    const isExpanded = expandedRows.includes(customer.id);
    
    return (
      <motion.div 
        key={customer.id}
        className="mobile-client-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedItems.includes(customer.id) ? '#eff6ff' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => toggleRowExpand(customer.id)}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectItem(customer.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: selectedItems.includes(customer.id) ? '#3b82f6' : '#94a3b8',
              fontSize: '18px'
            }}
          >
            {selectedItems.includes(customer.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div className="client-avatar-placeholder" style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ed8 100%)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {customer.full_name?.charAt(0) || 'C'}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#3b82f6', fontSize: '14px' }}>{customer.customer_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Created: {formatDate(customer.created_at)}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Customer</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{customer.full_name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{customer.phone}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Location</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{customer.city || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{customer.state || 'N/A'}</div>
          </div>
        </div>
        
        {/* Service Count Badge */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: customer.service_count > 0 ? '#ecfdf5' : '#fef2f2',
            color: customer.service_count > 0 ? '#059669' : '#dc2626',
            border: `1px solid ${customer.service_count > 0 ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FiPackage size={12} />
            {customer.service_count || 0} Services
          </span>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FiDollarSign size={12} />
            ₹{customer.total_services || '0'}
          </span>
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Email Address</div>
              <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMail size={12} color="#3b82f6" />
                {customer.email || 'Not provided'}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Full Address</div>
              <div style={{ fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <FiHome size={12} color="#3b82f6" style={{ marginTop: '2px' }} />
                  <div>
                    {customer.address || 'N/A'}<br />
                    {customer.city && customer.state ? `${customer.city}, ${customer.state}` : (customer.city || customer.state || '')}
                    {customer.zip_code && ` - ${customer.zip_code}`}
                  </div>
                </div>
              </div>
            </div>
            
            {customer.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  {customer.notes}
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
              onViewCustomer(customer);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: '#e0f2fe',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiEye size={16} />
          </motion.button>
          
          <motion.button 
            className="action-btn edit"
            onClick={(e) => {
              e.stopPropagation();
              onEditCustomer(customer);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: '#fef3c7',
              color: '#d97706',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiEdit size={16} />
          </motion.button>
          
          <motion.button 
            className="action-btn print"
            onClick={(e) => {
              e.stopPropagation();
              generateCustomerPDF(customer);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: '#dbeafe',
              color: '#2563eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiPrinter size={16} />
          </motion.button>
          
          <motion.button 
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCustomer(customer.id);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiTrash2 size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Tablet row render
  const renderTabletRow = (customer: Customer) => {
    return (
      <motion.tr 
        key={customer.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        className={selectedItems.includes(customer.id) ? 'selected-row' : ''}
        onClick={() => onViewCustomer(customer)}
        style={{ fontSize: '13px' }}
      >
        <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
          <button 
            className="checkbox-btn"
            onClick={() => handleSelectItem(customer.id)}
          >
            {selectedItems.includes(customer.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
        </td>
        <td>
          <span className="client-code" style={{ fontSize: '11px' }}>{customer.customer_code}</span>
        </td>
        <td>
          <div className="client-cell">
            <div className="client-avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
              {customer.full_name?.charAt(0) || 'C'}
            </div>
            <div className="client-info">
              <span className="client-name" style={{ fontSize: '12px' }}>{customer.full_name}</span>
            </div>
          </div>
        </td>
        <td>
          <div className="contact-info">
            <div className="contact-item" style={{ fontSize: '11px' }}>
              <FiPhone size={10} /> {customer.phone}
            </div>
          </div>
        </td>
        <td>
          <div className="location-info">
            <span style={{ fontSize: '11px' }}>{customer.city || 'N/A'}</span>
          </div>
        </td>
        <td>
          <span className="service-count" style={{ 
            fontSize: '12px',
            fontWeight: '600',
            color: '#059669',
            background: '#ecfdf5',
            padding: '4px 8px',
            borderRadius: '20px'
          }}>
            {customer.service_count || 0}
          </span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{formatDate(customer.created_at)}</span>
        </td>
        <td>
          <div className="action-buttons" style={{ gap: '4px' }}>
            <motion.button 
              className="action-btn view"
              onClick={(e) => {
                e.stopPropagation();
                onViewCustomer(customer);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEye size={14} />
            </motion.button>
            <motion.button 
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditCustomer(customer);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEdit size={14} />
            </motion.button>
            <motion.button 
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCustomer(customer.id);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiTrash2 size={14} />
            </motion.button>
          </div>
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="clients-section" style={{ padding: isMobile ? '12px' : '24px' }}>
      {/* Section Header */}
      <div className="section-header" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div className="section-title">
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Clients Management</h2>
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            Showing {filteredCustomers.length} of {customers.length} clients
          </p>
        </div>
        
        <div className="section-actions" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: showMobileSearch ? '#3b82f6' : '#f8fafc',
                  color: showMobileSearch ? 'white' : '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FiSearch />
                Search
              </button>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: showMobileFilters ? '#3b82f6' : '#f8fafc',
                  color: showMobileFilters ? 'white' : '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FiFilter />
                Filters
              </button>
            </div>
          )}

          {/* Search Box - Desktop */}
          {!isMobile && (
            <div className="search-wrapper" style={{ position: 'relative', minWidth: isTablet ? '200px' : '250px' }}>
              <FiSearch className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by code, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '35px', 
                  paddingRight: '35px',
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  fontSize: isTablet ? '0.8rem' : '0.875rem'
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          )}

          {/* Mobile Search Input */}
          {isMobile && showMobileSearch && (
            <div className="search-wrapper" style={{ position: 'relative', width: '100%' }}>
              <FiSearch className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by code, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '35px', 
                  paddingRight: '35px',
                  width: '100%',
                  padding: '12px 16px 12px 40px'
                }}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          )}

          {/* Filter Group - Desktop */}
          {!isMobile && (
            <div className="filter-group" style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}>
              <select
                value={dateFilterType}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className="filter-select"
                style={{
                  padding: '10px',
                  fontSize: isTablet ? '0.8rem' : '0.875rem',
                  minWidth: isTablet ? '100px' : '120px'
                }}
              >
                {dateFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {dateFilterType === 'custom' && (
                <div className="custom-date-range" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f8fafc',
                  padding: '4px',
                  borderRadius: '8px'
                }}>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => handleCustomDateChange('from', e.target.value)}
                    className="date-input"
                    style={{ padding: '6px', fontSize: isTablet ? '0.75rem' : '0.875rem' }}
                  />
                  <span style={{ padding: '0 4px' }}>to</span>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => handleCustomDateChange('to', e.target.value)}
                    className="date-input"
                    style={{ padding: '6px', fontSize: isTablet ? '0.75rem' : '0.875rem' }}
                  />
                </div>
              )}

              {dateFilterType === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="filter-select"
                  style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}

              {dateFilterType === 'month' && (
                <>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="filter-select"
                    style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
                  >
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="filter-select"
                    style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}

              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="filter-select"
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Cities</option>
                {uniqueCities.filter(c => c !== 'all').map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="filter-select"
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All States</option>
                {uniqueStates.filter(s => s !== 'all').map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={filterServiceCount}
                onChange={(e) => setFilterServiceCount(e.target.value)}
                className="filter-select"
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                {serviceCountOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mobile Filters Panel */}
          {isMobile && showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Filters</h3>
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={dateFilterType}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  {dateFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {dateFilterType === 'custom' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => handleCustomDateChange('from', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => handleCustomDateChange('to', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}

                {dateFilterType === 'year' && (
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    style={{
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}

                {dateFilterType === 'month' && (
                  <>
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </>
                )}

                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.filter(c => c !== 'all').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All States</option>
                  {uniqueStates.filter(s => s !== 'all').map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>

                <select
                  value={filterServiceCount}
                  onChange={(e) => setFilterServiceCount(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  {serviceCountOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Action Buttons - Add Client button removed */}
          <div className="action-buttons-group" style={{
            display: 'flex',
            gap: '8px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            marginTop: isMobile ? '8px' : 0
          }}>
            {!isMobile && (
              <>
                <motion.button 
                  className="btn csv-btn"
                  onClick={exportToCSV}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export to CSV"
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiDownload /> {!isTablet && 'CSV'}
                </motion.button>
                <motion.button 
                  className="btn pdf-btn"
                  onClick={exportToPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export to PDF"
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiFileText /> {!isTablet && 'PDF'}
                </motion.button>
                <motion.button 
                  className="btn print-btn"
                  onClick={printCustomers}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Print Report"
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiPrinter /> {!isTablet && 'Print'}
                </motion.button>
              </>
            )}

            {/* Mobile action buttons - Add button removed */}
            {isMobile && (
              <>
                <motion.button 
                  className="btn csv-btn"
                  onClick={exportToCSV}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                  <FiDownload /> CSV
                </motion.button>
                <motion.button 
                  className="btn pdf-btn"
                  onClick={exportToPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                  <FiFileText /> PDF
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {dateFilterType !== 'all' && !isMobile && (
        <div className="active-filters-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#eff6ff',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div className="filter-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCalendar size={14} />
            <span>Showing: {getDateRangeText()}</span>
          </div>
          <button className="clear-filters" onClick={clearFilters} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            background: 'none',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            color: '#1e40af',
            cursor: 'pointer'
          }}>
            <FiX size={14} />
            Clear Filters
          </button>
        </div>
      )}

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <div className="selection-bar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: isMobile ? '12px' : '12px 16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <FiCheckSquare />
          <span>{selectedItems.length} client{selectedItems.length !== 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelectedItems([])} style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#0369a1',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}>
            Clear selection
          </button>
        </div>
      )}

      {/* Table/Card Container */}
      <div className="table-wrapper" style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'white'
      }}>
        <div className="table-container" ref={tableContainerRef} style={{
          overflowX: 'auto',
          maxHeight: isMobile ? 'none' : '600px',
          overflowY: isMobile ? 'visible' : 'auto'
        }}>
          {filteredCustomers.length > 0 ? (
            <>
              {/* Desktop/Tablet Table View */}
              {!isMobile && (
                <table className="orders-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isTablet ? '900px' : '1000px'
                }}>
                  <thead>
                    <tr>
                      <th className="checkbox-column" style={{ width: '40px', padding: isTablet ? '12px' : '16px' }}>
                        <button className="checkbox-btn" onClick={handleSelectAll}>
                          {selectAll ? <FiCheckSquare /> : <FiSquare />}
                        </button>
                      </th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Code</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Client Details</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Contact</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Location</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Services</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Created</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isTablet 
                      ? currentItems.map(customer => renderTabletRow(customer))
                      : currentItems.map((customer, index) => (
                          <motion.tr 
                            key={customer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: '#f0f9ff' }}
                            className={selectedItems.includes(customer.id) ? 'selected-row' : ''}
                            onClick={() => onViewCustomer(customer)}
                          >
                            <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="checkbox-btn"
                                onClick={() => handleSelectItem(customer.id)}
                              >
                                {selectedItems.includes(customer.id) ? <FiCheckSquare /> : <FiSquare />}
                              </button>
                            </td>
                            <td>
                              <span className="client-code">{customer.customer_code}</span>
                            </td>
                            <td>
                              <div className="client-cell">
                                <div className="client-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ed8 100%)' }}>
                                  {customer.full_name?.charAt(0) || 'C'}
                                </div>
                                <div className="client-info">
                                  <span className="client-name">{customer.full_name}</span>
                                  {customer.address && (
                                    <span className="client-address">{customer.address.substring(0, 30)}...</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="contact-info">
                                <div className="contact-item">
                                  <FiPhone className="contact-icon" />
                                  <span className="client-phone">{customer.phone}</span>
                                </div>
                                {customer.email && (
                                  <div className="contact-item">
                                    <FiMail className="contact-icon" />
                                    <span className="client-email">{customer.email}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="location-info">
                                <div className="location-item">
                                  <FiMapPin className="location-icon" />
                                  <span className="client-city">{customer.city || 'N/A'}</span>
                                </div>
                                <span className="client-zip">{customer.zip_code || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <div className="service-count-container">
                                <span className="service-count">{customer.service_count || 0}</span>
                                <span className="service-count-label">services</span>
                              </div>
                            </td>
                            <td>
                              <div className="date-cell">
                                <FiCalendar />
                                <span className="client-date">{formatDate(customer.created_at)}</span>
                              </div>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="action-buttons">
                                <motion.button 
                                  className="action-btn view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewCustomer(customer);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEye />
                                </motion.button>
                                <motion.button 
                                  className="action-btn edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCustomer(customer);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEdit />
                                </motion.button>
                                <motion.button 
                                  className="action-btn print"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generateCustomerPDF(customer);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiPrinter />
                                </motion.button>
                                <motion.button 
                                  className="action-btn delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCustomer(customer.id);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiTrash2 />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                    }
                  </tbody>
                </table>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <div style={{ padding: '8px' }}>
                  {currentItems.map(customer => renderMobileCard(customer))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '32px 16px' : '60px',
              gap: '16px'
            }}>
              <FiUsers className="empty-icon" style={{ fontSize: isMobile ? '40px' : '48px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                {searchTerm || dateFilterType !== 'all' || filterCity !== 'all' || filterServiceCount !== 'all'
                  ? 'No matching clients found'
                  : 'No clients found'
                }
              </h3>
              <p style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                {searchTerm || dateFilterType !== 'all' || filterCity !== 'all' || filterServiceCount !== 'all'
                  ? 'Try adjusting your filters or clear them to see all clients'
                  : 'Start by adding your first client'
                }
              </p>
              {(searchTerm || dateFilterType !== 'all' || filterCity !== 'all' || filterServiceCount !== 'all') ? (
                <motion.button 
                  className="btn secondary"
                  onClick={clearFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiRefreshCw /> Clear All Filters
                </motion.button>
              ) : (
                <motion.button 
                  className="btn primary"
                  onClick={onNewCustomer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiPlus /> Add New Client
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="pagination-container" style={{
            padding: isMobile ? '12px' : '16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <div className="pagination-info" style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: '#64748b',
              marginBottom: isMobile ? '12px' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} entries
            </div>
            
            <div className="pagination-controls" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '12px' : '0'
            }}>
              <div className="items-per-page" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}>
                <span>Show:</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} style={{
                  padding: isMobile ? '6px' : '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="pagination-buttons" style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '4px' : '8px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  style={{
                    padding: isMobile ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  <FiChevronsLeft size={isMobile ? 14 : 16} />
                </button>
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  style={{
                    padding: isMobile ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  <FiChevronLeft size={isMobile ? 14 : 16} />
                </button>
                
                <div className="page-numbers" style={{
                  display: 'flex',
                  gap: isMobile ? '2px' : '4px'
                }}>
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis" style={{
                        padding: isMobile ? '6px 8px' : '8px 12px',
                        color: '#64748b'
                      }}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page as number)}
                        className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
                        style={{
                          padding: isMobile ? '6px 10px' : '8px 12px',
                          background: currentPage === page ? '#3b82f6' : 'white',
                          color: currentPage === page ? 'white' : '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
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
                  style={{
                    padding: isMobile ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  <FiChevronRight size={isMobile ? 14 : 16} />
                </button>
                <button 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  style={{
                    padding: isMobile ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  <FiChevronsRight size={isMobile ? 14 : 16} />
                </button>
              </div>

              <div className="page-jump" style={{
                display: isMobile ? 'flex' : 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                justifyContent: isMobile ? 'center' : 'flex-end',
                marginTop: isMobile ? '8px' : '0'
              }}>
                <span>Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyPress={handlePageInputKeyPress}
                  className="page-input"
                  style={{
                    width: '60px',
                    padding: isMobile ? '4px' : '6px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
                <span>of {totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsTab;