import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShoppingBag,
  FiCalendar,
  FiEye,
  FiEdit,
  FiPrinter,
  FiTrash2,
  FiPlus,
  FiPower,
  FiBattery,
  FiDownload,
  FiFileText,
  FiCheckSquare,
  FiSquare,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiUser,
  FiClock,
  FiDollarSign,
  FiTag,
  FiArchive,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiAward,
  FiShield,
  FiX,
  FiRefreshCw,
  FiFilter,
  FiSliders
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
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
  service_date?: string;
  warranty_status: string;
  amc_status: string;
  estimated_completion_date: string;
  completed_date?: string;
  notes: string;
  customer_id?: number;
  battery_id?: number;
  service_staff_name?: string;
  deposit_amount?: string;
  payment_method?: string;
  tax_amount?: string;
  discount_amount?: string;
}

interface ServicesTabProps {
  services: ServiceOrder[];
  filteredServices: ServiceOrder[];
  filterStatus: string;
  filterPriority: string;
  onViewService: (service: ServiceOrder) => void;
  onEditService: (service: ServiceOrder) => void;
  onDeleteService: (id: number) => void;
  onFilterStatusChange: (status: string) => void;
  onFilterPriorityChange: (priority: string) => void;
  onNewService: () => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPaymentStatusColor: (status: string) => string;
  loading: boolean;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  filteredServices,
  filterStatus,
  filterPriority,
  onViewService,
  onEditService,
  onDeleteService,
  onFilterStatusChange,
  onFilterPriorityChange,
  onNewService,
  getStatusColor,
  getPriorityColor,
  getPaymentStatusColor,
  loading
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<ServiceOrder[]>(filteredServices);
  
  const [dateFilterType, setDateFilterType] = useState<string>('all');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
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

  useEffect(() => {
    let filtered = filteredServices;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.service_code.toLowerCase().includes(term) ||
        service.customer_name.toLowerCase().includes(term) ||
        service.customer_phone.includes(term) ||
        service.battery_model?.toLowerCase().includes(term) ||
        service.battery_serial?.toLowerCase().includes(term) ||
        service.inverter_model?.toLowerCase().includes(term) ||
        service.issue_description?.toLowerCase().includes(term)
      );
    }

    filtered = applyDateFilter(filtered);

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    setExpandedRows([]);
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm, filteredServices, dateFilterType, customFromDate, customToDate, selectedYear, selectedMonth]);

  const applyDateFilter = (data: ServiceOrder[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilterType) {
      case 'today':
        return data.filter(service => {
          const serviceDate = service.service_date ? new Date(service.service_date) : new Date(service.created_at);
          serviceDate.setHours(0, 0, 0, 0);
          return serviceDate.getTime() === today.getTime();
        });

      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return data.filter(service => {
          const serviceDate = service.service_date ? new Date(service.service_date) : new Date(service.created_at);
          return serviceDate >= startOfWeek && serviceDate <= endOfWeek;
        });
      }

      case 'month':
        return data.filter(service => {
          const serviceDate = service.service_date ? new Date(service.service_date) : new Date(service.created_at);
          return serviceDate.getMonth() === today.getMonth() && 
                 serviceDate.getFullYear() === today.getFullYear();
        });

      case 'year':
        return data.filter(service => {
          const serviceDate = service.service_date ? new Date(service.service_date) : new Date(service.created_at);
          return serviceDate.getFullYear() === selectedYear;
        });

      case 'custom':
        if (customFromDate && customToDate) {
          const from = new Date(customFromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(customToDate);
          to.setHours(23, 59, 59, 999);

          return data.filter(service => {
            const serviceDate = service.service_date ? new Date(service.service_date) : new Date(service.created_at);
            return serviceDate >= from && serviceDate <= to;
          });
        }
        return data;

      default:
        return data;
    }
  };

  const handleDateFilterChange = (type: string) => {
    setDateFilterType(type);
    setCurrentPage(1);
    
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
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
    setCurrentPage(1);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(parseInt(month));
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
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
    setDateFilterType('all');
    setCustomFromDate('');
    setCustomToDate('');
    setSelectedYear(currentYear);
    setSelectedMonth(new Date().getMonth() + 1);
    onFilterStatusChange('all');
    onFilterPriorityChange('all');
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [filterStatus, filterPriority, dateFilterType, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '₹0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(s => s.id));
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

  const getSelectedServices = () => {
    return filteredData.filter(service => selectedItems.includes(service.id));
  };

  const exportToCSV = () => {
    try {
      const dataToExport = selectedItems.length > 0 ? getSelectedServices() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Service Code', 'Customer Name', 'Phone', 'Email', 'Address',
        'Battery Model', 'Battery Serial', 'Inverter Model', 'Inverter Serial',
        'Issue Description', 'Status', 'Priority', 'Payment Status',
        'Estimated Cost', 'Final Cost', 'Deposit Amount', 'Tax Amount', 'Discount',
        'Created Date', 'Service Date', 'Completed Date', 'Warranty Status', 'AMC Status',
        'Service Staff', 'Notes'
      ];
      
      const rows = dataToExport.map(service => [
        service.service_code,
        service.customer_name,
        service.customer_phone,
        service.customer_email || 'N/A',
        service.customer_address || 'N/A',
        service.battery_model || 'N/A',
        service.battery_serial || 'N/A',
        service.inverter_model || 'N/A',
        service.inverter_serial || 'N/A',
        service.issue_description || 'N/A',
        service.status,
        service.priority,
        service.payment_status,
        formatCurrency(service.estimated_cost),
        formatCurrency(service.final_cost),
        formatCurrency(service.deposit_amount || '0'),
        formatCurrency(service.tax_amount || '0'),
        formatCurrency(service.discount_amount || '0'),
        formatDate(service.created_at),
        service.service_date ? formatDate(service.service_date) : formatDate(service.created_at),
        service.completed_date ? formatDate(service.completed_date) : 'N/A',
        service.warranty_status || 'N/A',
        service.amc_status || 'N/A',
        service.service_staff_name || 'N/A',
        service.notes || 'N/A'
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Services');
      XLSX.writeFile(wb, `services_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const generateServiceReceipt = (service: ServiceOrder) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Battery & Inverter Service Center', 105, 22, { align: 'center' });
      doc.text('123, Electronics City, Bangalore - 560100 | Tel: +91 9876543210', 105, 28, { align: 'center' });

      doc.setTextColor(16, 185, 129);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SERVICE RECEIPT', 105, 45, { align: 'center' });

      // Receipt Info Box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(20, 50, 170, 22);

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('Receipt No:', 25, 58);
      doc.text('Date:', 25, 65);
      doc.text('Service Code:', 25, 72);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`SRV-${new Date().getTime().toString().slice(-8)}`, 60, 58);
      doc.text(formatDateTime(new Date().toISOString()), 60, 65);
      doc.text(service.service_code, 60, 72);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Status:', 120, 58);
      doc.text('Priority:', 120, 65);
      doc.text('Payment:', 120, 72);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(getStatusColor(service.status));
      doc.text(service.status.replace(/_/g, ' ').toUpperCase(), 150, 58);
      doc.setTextColor(getPriorityColor(service.priority));
      doc.text(service.priority.toUpperCase(), 150, 65);
      doc.setTextColor(getPaymentStatusColor(service.payment_status));
      doc.text(service.payment_status.replace(/_/g, ' ').toUpperCase(), 150, 72);

      // Customer Information
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER INFORMATION', 20, 85);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(20, 87, 70, 87);

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Name:', 20, 95);
      doc.text('Phone:', 20, 102);
      doc.text('Email:', 20, 109);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(service.customer_name, 45, 95);
      doc.text(service.customer_phone, 45, 102);
      doc.text(service.customer_email || 'Not provided', 45, 109);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Address:', 110, 95);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const addressLines = doc.splitTextToSize(service.customer_address || 'Not provided', 70);
      doc.text(addressLines, 110, 102);

      // Equipment Details
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EQUIPMENT DETAILS', 20, 125);

      doc.setDrawColor(16, 185, 129);
      doc.line(20, 127, 80, 127);

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      const startY = 135;
      const col1X = 20;
      const col2X = 60;
      const col3X = 110;
      const col4X = 150;

      doc.setFont('helvetica', 'bold');
      doc.text('Battery Model:', col1X, startY);
      doc.text('Battery Serial:', col1X, startY + 7);
      doc.text('Inverter Model:', col1X, startY + 14);
      doc.text('Inverter Serial:', col1X, startY + 21);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(service.battery_model || 'N/A', col2X, startY);
      doc.text(service.battery_serial || 'N/A', col2X, startY + 7);
      doc.text(service.inverter_model || 'N/A', col2X, startY + 14);
      doc.text(service.inverter_serial || 'N/A', col2X, startY + 21);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Service Date:', col3X, startY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(service.service_date ? formatDate(service.service_date) : formatDate(service.created_at), col4X, startY);

      // Issue Description
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUE DESCRIPTION', 20, 165);

      doc.setDrawColor(16, 185, 129);
      doc.line(20, 167, 85, 167);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      
      const issueLines = doc.splitTextToSize(service.issue_description || 'No description provided', 170);
      doc.text(issueLines, 20, 175);

      const financialY = 175 + (issueLines.length * 5) + 10;
      
      // Financial Summary
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCIAL SUMMARY', 20, financialY);

      doc.setDrawColor(16, 185, 129);
      doc.line(20, financialY + 2, 85, financialY + 2);

      const tableY = financialY + 10;
      
      doc.setFillColor(16, 185, 129);
      doc.rect(20, tableY - 5, 170, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 25, tableY - 1);
      doc.text('Amount', 170, tableY - 1, { align: 'right' });

      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      
      const items = [
        { desc: 'Estimated Cost', amount: formatCurrency(service.estimated_cost) },
        { desc: 'Deposit Paid', amount: formatCurrency(service.deposit_amount || '0') },
        { desc: 'Tax Amount', amount: formatCurrency(service.tax_amount || '0') },
        { desc: 'Discount', amount: formatCurrency(service.discount_amount || '0') }
      ];

      items.forEach((item, index) => {
        const y = tableY + 5 + (index * 5);
        doc.text(item.desc, 25, y);
        doc.text(item.amount, 170, y, { align: 'right' });
      });

      const totalY = tableY + 5 + (items.length * 5) + 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, totalY - 2, 190, totalY - 2);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('FINAL AMOUNT', 25, totalY);
      doc.text(formatCurrency(service.final_cost || service.estimated_cost), 170, totalY, { align: 'right' });

      if (service.payment_method) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8);
        doc.text(`Payment Method: ${service.payment_method}`, 20, totalY + 8);
      }

      const warrantyY = totalY + 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Warranty:', 20, warrantyY);
      doc.text('AMC:', 100, warrantyY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(service.warranty_status || 'Standard Warranty', 50, warrantyY);
      doc.text(service.amc_status || 'Not Enrolled', 120, warrantyY);

      let finalY = warrantyY + 10;
      
      // Service Staff
      if (service.service_staff_name) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(75, 85, 99);
        doc.text('Service Staff:', 20, finalY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(service.service_staff_name, 60, finalY);
        finalY += 7;
      }

      // Notes
      if (service.notes) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(75, 85, 99);
        doc.text('Notes:', 20, finalY);
        
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(service.notes, 170);
        doc.text(noteLines, 20, finalY + 5);
        finalY += noteLines.length * 5 + 10;
      } else {
        finalY += 5;
      }

      // Footer
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(20, 270, 190, 270);

      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer generated receipt - valid without signature', 105, 278, { align: 'center' });
      doc.text('Thank you for choosing Sun Powers Battery Service', 105, 283, { align: 'center' });
      doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 105, 288, { align: 'center' });

      doc.save(`service_receipt_${service.service_code}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Receipt Generation Error:', error);
      alert('Error generating service receipt. Please try again.');
    }
  };

  const exportDataToPDF = () => {
    try {
      const dataToExport = selectedItems.length > 0 ? getSelectedServices() : filteredData;
      
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
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - SERVICE ORDERS REPORT', 148.5, 13, { align: 'center' });
      
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
        ['S.No', 'Service Code', 'Customer', 'Phone', 'Equipment', 'Issue', 'Status', 'Priority', 'Payment', 'Amount', 'Service Date']
      ];
      
      const tableData = dataToExport.map((service, index) => [
        (index + 1).toString(),
        service.service_code,
        service.customer_name,
        service.customer_phone,
        service.battery_model || service.inverter_model || 'N/A',
        (service.issue_description || 'N/A').substring(0, 25) + (service.issue_description?.length > 25 ? '...' : ''),
        service.status.replace(/_/g, ' ').toUpperCase(),
        service.priority.toUpperCase(),
        service.payment_status.replace(/_/g, ' ').toUpperCase(),
        formatCurrency(service.final_cost || service.estimated_cost),
        service.service_date ? formatDate(service.service_date) : formatDate(service.created_at)
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
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 28 },
          3: { cellWidth: 22 },
          4: { cellWidth: 28 },
          5: { cellWidth: 35 },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18, halign: 'center' },
          9: { cellWidth: 20, halign: 'right' },
          10: { cellWidth: 20, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Service Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`services_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const printServices = () => {
    const dataToExport = selectedItems.length > 0 ? getSelectedServices() : filteredData;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Service Orders Report</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1200px; margin: 0 auto; }
              h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bae6fd; font-weight: 500; color: #0369a1; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #10b981; color: white; padding: 10px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; border: 1px solid #059669; }
              td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .status-badge, .priority-badge, .payment-badge { padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; text-transform: capitalize; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #10b981; color: white; }
              .close-btn { background: #64748b; color: white; }
              .amount { font-weight: 600; color: #059669; text-align: right; }
              .date-range { font-size: 14px; color: #0369a1; margin-bottom: 10px; }
              @media print {
                body { margin: 0.5in; background: white; }
                .no-print { display: none; }
                th { background: #10b981 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .status-badge, .priority-badge, .payment-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🏭 Sun Powers - Service Orders Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Records: ${dataToExport.length} | 
                  Selected Records: ${selectedItems.length || dataToExport.length} |
                  Report Type: ${selectedItems.length > 0 ? 'Selected Items' : 'All Filtered Items'}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th style="width: 5%;">S.No</th>
                    <th style="width: 10%;">Service Code</th>
                    <th style="width: 12%;">Customer</th>
                    <th style="width: 8%;">Phone</th>
                    <th style="width: 10%;">Equipment</th>
                    <th style="width: 15%;">Issue</th>
                    <th style="width: 8%;">Status</th>
                    <th style="width: 8%;">Priority</th>
                    <th style="width: 8%;">Payment</th>
                    <th style="width: 8%;">Amount</th>
                    <th style="width: 8%;">Service Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map((service, index) => {
                    const statusColor = getStatusColor(service.status);
                    const priorityColor = getPriorityColor(service.priority);
                    const paymentColor = getPaymentStatusColor(service.payment_status);
                    
                    return `
                      <tr>
                        <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                        <td><strong>${service.service_code}</strong></td>
                        <td>${service.customer_name}</td>
                        <td>${service.customer_phone}</td>
                        <td>${service.battery_model || service.inverter_model || 'N/A'}</td>
                        <td>${(service.issue_description || 'N/A').substring(0, 30)}${service.issue_description?.length > 30 ? '...' : ''}</td>
                        <td>
                          <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                            ${service.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span class="priority-badge" style="background: ${priorityColor}20; color: ${priorityColor}; border: 1px solid ${priorityColor}40;">
                            ${service.priority}
                          </span>
                        </td>
                        <td>
                          <span class="payment-badge" style="background: ${paymentColor}20; color: ${paymentColor}; border: 1px solid ${paymentColor}40;">
                            ${service.payment_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td class="amount">${formatCurrency(service.final_cost || service.estimated_cost)}</td>
                        <td>${service.service_date ? formatDate(service.service_date) : formatDate(service.created_at)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
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

  const getEquipmentIcon = (service: ServiceOrder) => {
    if (service.battery_model) return <FiBattery className="product-icon" />;
    if (service.inverter_model) return <FiPower className="product-icon" />;
    return <FiShoppingBag className="product-icon" />;
  };

  const getEquipmentModel = (service: ServiceOrder) => {
    return service.battery_model || service.inverter_model || 'No equipment';
  };

  const getEquipmentSerial = (service: ServiceOrder) => {
    return service.battery_serial || service.inverter_serial || '';
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
  const renderMobileCard = (service: ServiceOrder) => {
    const isExpanded = expandedRows.includes(service.id);
    
    return (
      <motion.div 
        key={service.id}
        className="mobile-service-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedItems.includes(service.id) ? '#eff6ff' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => toggleRowExpand(service.id)}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectItem(service.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: selectedItems.includes(service.id) ? '#10b981' : '#94a3b8',
              fontSize: '18px'
            }}
          >
            {selectedItems.includes(service.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div className="client-avatar-placeholder" style={{ 
            background: '#10b981', 
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {service.customer_name?.charAt(0) || 'C'}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#10b981' }}>{service.service_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Created: {formatDate(service.created_at)}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Customer</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{service.customer_name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{service.customer_phone}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Equipment</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{getEquipmentModel(service)}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{getEquipmentSerial(service)}</div>
          </div>
        </div>
        
        {/* Status Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: `${getStatusColor(service.status)}20`,
            color: getStatusColor(service.status),
            border: `1px solid ${getStatusColor(service.status)}40`
          }}>
            {service.status.replace(/_/g, ' ')}
          </span>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: `${getPriorityColor(service.priority)}20`,
            color: getPriorityColor(service.priority),
            border: `1px solid ${getPriorityColor(service.priority)}40`
          }}>
            {service.priority}
          </span>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: `${getPaymentStatusColor(service.payment_status)}20`,
            color: getPaymentStatusColor(service.payment_status),
            border: `1px solid ${getPaymentStatusColor(service.payment_status)}40`
          }}>
            {service.payment_status.replace(/_/g, ' ')}
          </span>
        </div>
        
        {/* Amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Amount:</span>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
            {formatCurrency(service.final_cost || service.estimated_cost)}
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Issue Description</div>
              <div style={{ fontSize: '13px' }}>{service.issue_description || 'No description'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Service Date</div>
              <div style={{ fontSize: '13px' }}>{service.service_date ? formatDate(service.service_date) : formatDate(service.created_at)}</div>
            </div>
            
            {service.battery_model && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Details</div>
                <div style={{ fontSize: '13px' }}>{service.battery_model} - {service.battery_serial}</div>
              </div>
            )}
            
            {service.inverter_model && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Inverter Details</div>
                <div style={{ fontSize: '13px' }}>{service.inverter_model} - {service.inverter_serial}</div>
              </div>
            )}
            
            {service.warranty_status && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Warranty Status</div>
                <div style={{ fontSize: '13px' }}>{service.warranty_status}</div>
              </div>
            )}
            
            {service.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px' }}>{service.notes}</div>
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
              onViewService(service);
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
              onEditService(service);
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
              generateServiceReceipt(service);
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
              onDeleteService(service.id);
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

  // Tablet card view render (simplified)
  const renderTabletRow = (service: ServiceOrder) => {
    return (
      <motion.tr 
        key={service.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        className={selectedItems.includes(service.id) ? 'selected-row' : ''}
        onClick={() => onViewService(service)}
        style={{ fontSize: '13px' }}
      >
        <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
          <button 
            className="checkbox-btn"
            onClick={() => handleSelectItem(service.id)}
          >
            {selectedItems.includes(service.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
        </td>
        <td>
          <div className="order-id-cell">
            <span className="order-id">{service.service_code}</span>
            <span className="order-date" style={{ fontSize: '10px' }}>{formatDate(service.created_at)}</span>
          </div>
        </td>
        <td>
          <div className="client-cell">
            <div className="client-avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
              {service.customer_name?.charAt(0) || 'C'}
            </div>
            <div className="client-info">
              <span className="client-name" style={{ fontSize: '12px' }}>{service.customer_name}</span>
              <span className="client-phone" style={{ fontSize: '10px' }}>{service.customer_phone}</span>
            </div>
          </div>
        </td>
        <td>
          <div className="product-cell">
            {getEquipmentIcon(service)}
            <div className="equipment-info">
              <span className="equipment-model" style={{ fontSize: '11px' }}>
                {getEquipmentModel(service)}
              </span>
              <span className="equipment-serial" style={{ fontSize: '9px' }}>
                {getEquipmentSerial(service)}
              </span>
            </div>
          </div>
        </td>
        <td>
          <span className="status-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
            {service.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          <span className="priority-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
            {service.priority}
          </span>
        </td>
        <td>
          <span className="payment-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
            {service.payment_status.replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          <span style={{ fontWeight: '600', color: '#059669' }}>
            {formatCurrency(service.final_cost || service.estimated_cost)}
          </span>
        </td>
        <td>
          <div className="action-buttons" style={{ gap: '4px' }}>
            <motion.button 
              className="action-btn view"
              onClick={(e) => {
                e.stopPropagation();
                onViewService(service);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEye size={14} />
            </motion.button>
            <motion.button 
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditService(service);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEdit size={14} />
            </motion.button>
            <motion.button 
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteService(service.id);
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
    <div className="orders-section" style={{ padding: isMobile ? '12px' : '20px' }}>
      {/* Section Header */}
      <div className="section-header" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div className="section-title">
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Service Orders</h2>
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            Showing {filteredData.length} of {services.length} service orders
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
                  background: showMobileSearch ? '#10b981' : '#f8fafc',
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
                  background: showMobileFilters ? '#10b981' : '#f8fafc',
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
                placeholder="Search by code, customer, phone..."
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
                placeholder="Search..."
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
                className="filter-select"
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select 
                className="filter-select"
                value={filterPriority}
                onChange={(e) => onFilterPriorityChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
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
                    color: '#10b981',
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
                  value={filterStatus}
                  onChange={(e) => onFilterStatusChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select 
                  value={filterPriority}
                  onChange={(e) => onFilterPriorityChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Action Buttons - Only Export buttons remain, New Service button removed */}
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
                    fontSize: isTablet ? '0.8rem' : '0.875rem'
                  }}
                >
                  <FiDownload /> {!isTablet && 'CSV'}
                </motion.button>
                <motion.button 
                  className="btn pdf-btn"
                  onClick={exportDataToPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export Data to PDF"
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem'
                  }}
                >
                  <FiFileText /> {!isTablet && 'PDF'}
                </motion.button>
                <motion.button 
                  className="btn print-btn"
                  onClick={printServices}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Print Report"
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem'
                  }}
                >
                  <FiPrinter /> {!isTablet && 'Print'}
                </motion.button>
              </>
            )}

            {/* Mobile action buttons - Only Export */}
            {isMobile && (
              <>
                <motion.button 
                  className="btn csv-btn"
                  onClick={exportToCSV}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: '12px' }}
                >
                  <FiDownload /> CSV
                </motion.button>
                <motion.button 
                  className="btn pdf-btn"
                  onClick={exportDataToPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: '12px' }}
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
          <span>{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</span>
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
          {loading ? (
            <div className="loading-state" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              gap: '16px'
            }}>
              <div className="loading-spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Loading service orders...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {/* Desktop/Tablet Table View */}
              {!isMobile && (
                <table className="orders-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isTablet ? '1000px' : '1200px'
                }}>
                  <thead>
                    <tr>
                      <th className="checkbox-column" style={{ width: '40px', padding: isTablet ? '12px' : '16px' }}>
                        <button className="checkbox-btn" onClick={handleSelectAll}>
                          {selectAll ? <FiCheckSquare /> : <FiSquare />}
                        </button>
                      </th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Service ID</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Client Details</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Equipment</th>
                      {!isTablet && <th style={{ padding: '16px' }}>Issue</th>}
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Status</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Priority</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Payment</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Amount</th>
                      {!isTablet && <th style={{ padding: '16px' }}>Service Date</th>}
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isTablet 
                      ? currentItems.map(service => renderTabletRow(service))
                      : currentItems.map((service, index) => (
                          <motion.tr 
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: '#f0f9ff' }}
                            className={selectedItems.includes(service.id) ? 'selected-row' : ''}
                            onClick={() => onViewService(service)}
                          >
                            <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="checkbox-btn"
                                onClick={() => handleSelectItem(service.id)}
                              >
                                {selectedItems.includes(service.id) ? <FiCheckSquare /> : <FiSquare />}
                              </button>
                            </td>
                            <td>
                              <div className="order-id-cell">
                                <span className="order-id">{service.service_code}</span>
                                <span className="order-date">Created: {formatDate(service.created_at)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="client-cell">
                                <div className="client-avatar-placeholder" style={{ background: '#10b981', color: 'white' }}>
                                  {service.customer_name?.charAt(0) || 'C'}
                                </div>
                                <div className="client-info">
                                  <span className="client-name">{service.customer_name}</span>
                                  <span className="client-phone">{service.customer_phone}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="product-cell">
                                {getEquipmentIcon(service)}
                                <div className="equipment-info">
                                  <span className="equipment-model">
                                    {getEquipmentModel(service)}
                                  </span>
                                  <span className="equipment-serial">
                                    {getEquipmentSerial(service)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="issue-description">
                                {service.issue_description && service.issue_description.length > 50 
                                  ? `${service.issue_description.substring(0, 50)}...`
                                  : service.issue_description || 'No description'}
                              </span>
                            </td>
                            <td>
                              <div className="status-cell">
                                <div 
                                  className="status-indicator"
                                  style={{ backgroundColor: getStatusColor(service.status) }}
                                ></div>
                                <span className="status-label">
                                  {service.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span 
                                className="priority-badge"
                                style={{ 
                                  backgroundColor: `${getPriorityColor(service.priority)}20`,
                                  color: getPriorityColor(service.priority),
                                  border: `1px solid ${getPriorityColor(service.priority)}40`
                                }}
                              >
                                {service.priority}
                              </span>
                            </td>
                            <td>
                              <span 
                                className="payment-badge"
                                style={{ 
                                  backgroundColor: `${getPaymentStatusColor(service.payment_status)}20`,
                                  color: getPaymentStatusColor(service.payment_status),
                                  border: `1px solid ${getPaymentStatusColor(service.payment_status)}40`
                                }}
                              >
                                {service.payment_status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              <div className="amount-cell">
                                <span className="estimated-cost">{formatCurrency(service.estimated_cost)}</span>
                                {service.final_cost && service.final_cost !== '0.00' && (
                                  <span className="final-cost">{formatCurrency(service.final_cost)}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="date-cell">
                                <FiCalendar color="#10b981" />
                                <span>{service.service_date ? formatDate(service.service_date) : formatDate(service.created_at)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <motion.button 
                                  className="action-btn view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewService(service);
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
                                    onEditService(service);
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
                                    generateServiceReceipt(service);
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
                                    onDeleteService(service.id);
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
                  {currentItems.map(service => renderMobileCard(service))}
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
              <FiShoppingBag className="empty-icon" style={{ fontSize: isMobile ? '40px' : '48px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>No service orders found</h3>
              <p style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>Try adjusting your filters or create a new service order</p>
              {/* Removed the "Create New Service Order" button from empty state */}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
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
                          background: currentPage === page ? '#10b981' : 'white',
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

export default ServicesTab;