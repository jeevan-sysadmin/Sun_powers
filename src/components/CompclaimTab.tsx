import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFilter, 
  FiTrash2, 
  FiEye, 
  FiRefreshCw, 
  FiSearch, 
  FiBattery, 
  FiPackage,
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
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiMenu,
  FiGrid,
  FiList
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CompclaimDetailModal from './modals/CompclaimDetailModal';
import './css/Compclaim.css';

interface CompanyClaim {
  id: number;
  claim_code: string;
  service_order_id: number | null;
  customer_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address?: string | null;
  battery_id: number;
  battery_model: string;
  battery_serial: string;
  brand: string;
  capacity: string;
  voltage: string;
  battery_type: string;
  warranty_period: string;
  purchase_date?: string;
  issue_description: string;
  claim_type: string;
  priority: string;
  status: string;
  claim_date: string;
  expected_resolution_date: string | null;
  resolution_notes: string;
  warranty_status: string;
  service_code: string;
  estimated_cost: string;
  final_cost: string;
  service_staff_name: string | null;
  replacement_battery_serial: string | null;
  source: 'service' | 'battery';
  age_days: number;
  is_overdue: boolean;
  spare_battery_id?: number | null;
  spare_battery_model?: string | null;
  spare_battery_type?: string | null;
}

interface CompclaimTabProps {
  onViewClaim?: (claim: CompanyClaim) => void;
  onDeleteClaim?: (id: number) => void;
  onRefresh?: () => void;
  getStatusColor?: (status: string) => string;
  getPriorityColor?: (priority: string) => string;
  getClaimColor?: (claim: string) => string;
  getWarrantyColor?: (status: string) => string;
  getBatteryTypeColor?: (type: string) => string;
  getConditionColor?: (condition: string) => string;
  getTrackingStatusColor?: (status: string) => string;
}

const API_BASE_URL = "http://localhost/sun_powers/api";

const CompclaimTab: React.FC<CompclaimTabProps> = ({
  onViewClaim,
  onDeleteClaim,
  onRefresh,
  getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': case 'resolved': case 'delivered': return '#10B981';
      case 'in_progress': case 'testing': case 'ready': return '#F59E0B';
      case 'scheduled': return '#6366F1';
      case 'pending': case 'under_review': return '#6B7280';
      case 'cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  },
  getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  },
  getClaimColor = (claim) => {
    switch(claim?.toLowerCase()) {
      case 'company_claim': case 'company': return '#3B82F6';
      case 'shop_claim': case 'shop': return '#F59E0B';
      case 'warranty': return '#10B981';
      case 'replacement': return '#EC4899';
      default: return '#6B7280';
    }
  },
  getWarrantyColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'in_warranty': return '#10B981';
      case 'extended_warranty': return '#3B82F6';
      case 'out_of_warranty': case 'expired': return '#DC2626';
      case 'active': return '#10B981';
      default: return '#6B7280';
    }
  },
  getBatteryTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'lead_acid': return '#3B82F6';
      case 'lithium_ion': case 'li-ion': return '#10B981';
      case 'gel': return '#EC4899';
      case 'agm': return '#F59E0B';
      case 'tubular': return '#8B5CF6';
      default: return '#6B7280';
    }
  },
  getConditionColor = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'good': case 'new': return '#10B981';
      case 'average': case 'fair': return '#F59E0B';
      case 'poor': case 'bad': return '#EF4444';
      case 'damaged': case 'faulty': return '#DC2626';
      default: return '#6B7280';
    }
  },
  getTrackingStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': case 'in_transit': return '#3B82F6';
      case 'delivered': case 'completed': return '#10B981';
      case 'pending': case 'processing': return '#F59E0B';
      case 'cancelled': case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  }
}) => {
  
  // State for detail modal
  const [selectedClaim, setSelectedClaim] = useState<CompanyClaim | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // State for data
  const [claims, setClaims] = useState<CompanyClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<CompanyClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterWarrantyStatus, setFilterWarrantyStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // State for date filter
  const [dateFilterType, setDateFilterType] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // State for checkbox selection
  const [selectedClaims, setSelectedClaims] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (window.innerWidth < 640) return 5;
    if (window.innerWidth < 1024) return 10;
    return 15;
  });
  const [pageInput, setPageInput] = useState('1');
  
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

  // Load company claims from API
  const loadCompanyClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/company_claims.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setClaims(data.data);
      } else {
        throw new Error(data.message || 'Failed to load company claims');
      }
      
    } catch (error: any) {
      console.error('Error loading company claims:', error);
      setError('Failed to load company claims: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCompanyClaims();
  }, []);

  // Date filter function
  const filterByDate = (claim: CompanyClaim) => {
    if (dateFilterType === "all") return true;
    
    const claimDate = new Date(claim.claim_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    switch(dateFilterType) {
      case "today":
        return claimDate >= today;
      case "week": {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return claimDate >= startOfWeek && claimDate <= endOfWeek;
      }
      case "month":
        return claimDate.getMonth() === today.getMonth() && 
               claimDate.getFullYear() === today.getFullYear();
      case "year":
        return claimDate.getFullYear() === selectedYear;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
          return claimDate >= start && claimDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Filter claims based on all filters
  useEffect(() => {
    let filtered = claims.filter(claim => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchFields = [
          claim.claim_code,
          claim.service_code,
          claim.customer_name,
          claim.customer_phone,
          claim.battery_model,
          claim.battery_serial,
          claim.brand,
          claim.issue_description
        ].filter(Boolean);
        
        const matchesSearch = searchFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filterStatus !== 'all' && claim.status !== filterStatus) {
        return false;
      }
      
      // Priority filter
      if (filterPriority !== 'all' && claim.priority !== filterPriority) {
        return false;
      }
      
      // Source filter
      if (filterSource !== 'all' && claim.source !== filterSource) {
        return false;
      }
      
      // Warranty Status filter
      if (filterWarrantyStatus !== "all") {
        const isInWarranty = claim.warranty_status === 'in_warranty' || claim.warranty_status === 'active';
        const isExpired = claim.warranty_status === 'expired' || claim.warranty_status === 'out_of_warranty';
        
        switch(filterWarrantyStatus) {
          case 'in_warranty':
            if (!isInWarranty) return false;
            break;
          case 'out_of_warranty':
            if (!isExpired) return false;
            break;
          case 'expired':
            if (!isExpired) return false;
            break;
        }
      }
      
      // Date filter
      if (!filterByDate(claim)) return false;
      
      return true;
    });

    setFilteredClaims(filtered);
    setCurrentPage(1);
    setPageInput('1');
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [claims, searchTerm, filterStatus, filterPriority, filterSource, filterWarrantyStatus, dateFilterType, customDateRange, selectedYear]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClaims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);

  // Handle view claim
  const handleViewClaim = (claim: CompanyClaim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
    if (onViewClaim) {
      onViewClaim(claim);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedClaim(null);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(currentItems.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single
  const handleSelectClaim = (id: number) => {
    if (selectedClaims.includes(id)) {
      setSelectedClaims(selectedClaims.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedClaims([...selectedClaims, id]);
      if (selectedClaims.length + 1 === currentItems.length) {
        setSelectAll(true);
      }
    }
  };

  useEffect(() => {
    if (currentItems.length > 0 && selectedClaims.length === currentItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedClaims, currentItems]);

  const getSelectedClaims = () => {
    return filteredClaims.filter(claim => selectedClaims.includes(claim.id));
  };

  // Handle delete claim
  const handleDeleteClaim = (id: number) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      if (onDeleteClaim) {
        onDeleteClaim(id);
      } else {
        // Default delete behavior if no callback provided
        setClaims(prevClaims => prevClaims.filter(claim => claim.id !== id));
      }
    }
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
    setSearchTerm('');
    setDateFilterType('all');
    setCustomDateRange({ start: '', end: '' });
    setSelectedYear(currentYear);
    setSelectedMonth(new Date().getMonth() + 1);
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterSource('all');
    setFilterWarrantyStatus('all');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadCompanyClaims();
    if (onRefresh) onRefresh();
  };

  // Export functions
  const exportToCSV = () => {
    try {
      const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredClaims;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Claim Code', 'Service Code', 'Customer Name', 'Customer Phone', 
        'Battery Model', 'Battery Serial', 'Brand', 'Type', 'Capacity', 'Voltage',
        'Issue Description', 'Claim Date', 'Warranty Status', 'Estimated Cost', 'Final Cost'
      ];
      
      const rows = dataToExport.map(claim => [
        claim.claim_code,
        claim.service_code || 'N/A',
        claim.customer_name || 'N/A',
        claim.customer_phone || 'N/A',
        claim.battery_model || 'N/A',
        claim.battery_serial || 'N/A',
        claim.brand || 'N/A',
        claim.battery_type || 'N/A',
        claim.capacity || 'N/A',
        claim.voltage || 'N/A',
        claim.issue_description || 'N/A',
        claim.claim_date,
        claim.warranty_status || 'N/A',
        parseFloat(claim.estimated_cost || '0').toFixed(2),
        parseFloat(claim.final_cost || claim.estimated_cost || '0').toFixed(2)
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Company Claims');
      XLSX.writeFile(wb, `company_claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredClaims;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - COMPANY CLAIMS REPORT', 148.5, 13, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
      doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
      
      if (selectedClaims.length > 0) {
        doc.text(`Selected Records: ${selectedClaims.length}`, 14, 45);
      }

      const headers = [
        ['S.No', 'Claim Code', 'Customer', 'Battery Model', 'Claim Date']
      ];
      
      const tableData = dataToExport.map((claim, index) => [
        (index + 1).toString(),
        claim.claim_code,
        claim.customer_name || 'N/A',
        claim.battery_model || 'N/A',
        claim.claim_date
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: selectedClaims.length > 0 ? 50 : 45,
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
          fillColor: [59, 130, 246], 
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
          fillColor: [239, 246, 255] 
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Company Claims Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`company_claims_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handlePrint = () => {
    const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredClaims;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Company Claims Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #3b82f6; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bfdbfe; font-weight: 500; color: #1e40af; }
              .table-responsive { overflow-x: auto; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; min-width: 600px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #2563eb; }
              td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #3b82f6; color: white; }
              .close-btn { background: #64748b; color: white; }
              @media (max-width: 768px) {
                body { margin: 10px; }
                h1 { font-size: 20px; }
                .header-info { flex-direction: column; gap: 10px; }
              }
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
              <h1>🏭 Sun Powers - Company Claims Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Claims: ${dataToExport.length} | 
                  Selected: ${selectedClaims.length || dataToExport.length}
                </div>
              </div>
              
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Claim Code</th>
                      <th>Customer</th>
                      <th>Battery Model</th>
                      <th>Battery Serial</th>
                      <th>Issue</th>
                      <th>Claim Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataToExport.map((claim, index) => {
                      return `
                        <tr>
                          <td style="text-align: center;">${index + 1}</td>
                          <td><strong>${claim.claim_code}</strong></td>
                          <td>${claim.customer_name || 'N/A'}<br><small>${claim.customer_phone || ''}</small></td>
                          <td>${claim.battery_model || 'N/A'}</td>
                          <td>${claim.battery_serial || 'N/A'}</td>
                          <td>${claim.issue_description?.substring(0, 50) || 'N/A'}${claim.issue_description?.length > 50 ? '...' : ''}</td>
                          <td>${claim.claim_date}</td>
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = windowWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
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

  // Get unique values for filters
  const statuses = [...new Set(claims.map(c => c.status).filter(Boolean))];
  const priorities = [...new Set(claims.map(c => c.priority).filter(Boolean))];
  const sources = [...new Set(claims.map(c => c.source).filter(Boolean))];

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    if (isNaN(num)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusText = (status: string) => {
    if (!status || status === '') return 'N/A';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  // Toggle row expansion for mobile
  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  // Mobile card view
  const renderMobileCard = (claim: CompanyClaim) => {
    const isExpanded = expandedRows.includes(claim.id);
    const batteryTypeColor = getBatteryTypeColor(claim.battery_type);
    
    return (
      <motion.div 
        key={claim.id}
        className="mobile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        onClick={() => toggleRowExpand(claim.id)}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedClaims.includes(claim.id) ? '#f0f9ff' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderLeft: claim.is_overdue ? '4px solid #ef4444' : '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectClaim(claim.id);
            }}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              color: selectedClaims.includes(claim.id) ? '#3b82f6' : '#94a3b8',
              fontSize: '18px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedClaims.includes(claim.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#3b82f6', fontSize: '14px' }}>{claim.claim_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{claim.customer_name || 'No customer'}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Battery</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{claim.battery_model || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Serial</div>
            <div style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'monospace' }}>{claim.battery_serial || 'N/A'}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Claim Date</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{formatDate(claim.claim_date)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Phone</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{claim.customer_phone || 'N/A'}</div>
          </div>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Issue Description</div>
              <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                {claim.issue_description || 'No description'}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Details</div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: batteryTypeColor + '20',
                  color: batteryTypeColor,
                  fontSize: '11px',
                  fontWeight: '500',
                  marginRight: '4px'
                }}>
                  {claim.battery_type || 'N/A'}
                </span>
                {claim.brand && <span style={{ color: '#64748b' }}>{claim.brand}</span>}
              </div>
            </div>
          </motion.div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <motion.button 
            className="action-btn view"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClaim(claim);
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
              handleDeleteClaim(claim.id);
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

  return (
    <>
      <div className="compclaim-section">
        {/* Mobile Header */}
        {windowWidth < 768 && (
          <div className="mobile-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div className="mobile-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <FiMenu />
              </button>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Company Claims</h3>
            </div>
            <div className="mobile-header-right">
              <button 
                className="mobile-filter-btn"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#3b82f6',
                  cursor: 'pointer'
                }}
              >
                <FiFilter />
              </button>
            </div>
          </div>
        )}

        {/* Section Header - Desktop */}
        {windowWidth >= 768 && (
          <div className="section-header" style={{
            padding: '20px',
            background: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div className="section-title" style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>Company Claims Management</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Batteries claimed under company warranty - Showing {filteredClaims.length} of {claims.length} claims
              </p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className={`filters-section ${windowWidth < 768 && isFilterMenuOpen ? 'mobile-filters-open' : ''}`} style={{
          background: 'white',
          padding: windowWidth < 768 ? '16px' : '20px',
          borderBottom: '1px solid #e2e8f0',
          display: windowWidth < 768 && !isFilterMenuOpen ? 'none' : 'block'
        }}>
          <div className="filters-row" style={{
            display: 'flex',
            flexDirection: windowWidth < 1024 ? 'column' : 'row',
            gap: '16px',
            alignItems: windowWidth < 1024 ? 'stretch' : 'center',
            justifyContent: 'space-between'
          }}>
            <div className="filters-left" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              flex: 1
            }}>
              {/* Search Box */}
              <div className="search-wrapper" style={{
                position: 'relative',
                minWidth: windowWidth < 640 ? '100%' : '300px'
              }}>
                <FiSearch className="search-icon" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder={windowWidth < 640 ? "Search..." : "Search by claim code, customer, battery..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
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

              {/* Date Filter */}
              <select
                value={dateFilterType}
                onChange={handleDateFilterChange}
                className="filter-select"
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: windowWidth < 640 ? '100%' : '150px',
                  background: 'white'
                }}
              >
                {dateFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {windowWidth < 640 ? option.label.split(' ')[0] : option.label}
                  </option>
                ))}
              </select>

              {dateFilterType === 'custom' && (
                <div className="custom-date-range" style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="date-input"
                    style={{
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="date-input"
                    min={customDateRange.start}
                    style={{
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
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
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
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
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
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
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Status Filter */}
              {windowWidth >= 768 && (
                <div className="filter-group">
                  <FiFilter className="filter-icon" />
                  <select 
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minWidth: '130px'
                    }}
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority Filter */}
              {windowWidth >= 1024 && (
                <div className="filter-group">
                  <FiFilter className="filter-icon" />
                  <select 
                    className="filter-select"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minWidth: '130px'
                    }}
                  >
                    <option value="all">All Priority</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority?.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="filters-right" style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: windowWidth < 640 ? 'stretch' : 'flex-end'
            }}>
              {/* Export Buttons */}
              <motion.button 
                className="btn csv-btn"
                onClick={exportToCSV}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Export to CSV"
                disabled={filteredClaims.length === 0}
                style={{
                  padding: '10px 16px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: filteredClaims.length === 0 ? 0.5 : 1,
                  flex: windowWidth < 640 ? 1 : 'none'
                }}
              >
                <FiDownload /> {windowWidth >= 640 && 'CSV'}
              </motion.button>
              <motion.button 
                className="btn pdf-btn"
                onClick={exportToPDF}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Export to PDF"
                disabled={filteredClaims.length === 0}
                style={{
                  padding: '10px 16px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: filteredClaims.length === 0 ? 0.5 : 1,
                  flex: windowWidth < 640 ? 1 : 'none'
                }}
              >
                <FiFileText /> {windowWidth >= 640 && 'PDF'}
              </motion.button>
              <motion.button 
                className="btn print-btn"
                onClick={handlePrint}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Print Report"
                disabled={filteredClaims.length === 0}
                style={{
                  padding: '10px 16px',
                  background: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: filteredClaims.length === 0 ? 0.5 : 1,
                  flex: windowWidth < 640 ? 1 : 'none'
                }}
              >
                <FiPrinter /> {windowWidth >= 640 && 'Print'}
              </motion.button>
              <motion.button
                className="btn secondary refresh-btn"
                onClick={handleRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                title="Refresh data"
                style={{
                  padding: '10px 16px',
                  background: 'white',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: windowWidth < 640 ? 1 : 'none'
                }}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Simplified to just Total Claims */}
        <div className="stats-cards" style={{
          display: 'grid',
          gridTemplateColumns: windowWidth < 480 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '20px'
        }}>
          <div className="stat-card" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="stat-icon total" style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>
              <FiPackage />
            </div>
            <div className="stat-content">
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{claims.length}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Claims</p>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {dateFilterType !== 'all' && (
          <div className="active-filters-bar" style={{
            margin: '0 20px 20px',
            padding: '12px 16px',
            background: '#eff6ff',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <div className="filter-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
              <FiCalendar size={14} />
              <span>Showing: {getDateRangeText()}</span>
            </div>
            <button className="clear-filters" onClick={clearFilters} style={{
              background: 'none',
              border: 'none',
              color: '#1e40af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              <FiX size={14} />
              {windowWidth >= 640 ? 'Clear Filters' : ''}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="error-alert" style={{
            margin: '16px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#b91c1c'
            }}>×</button>
          </div>
        )}

        {/* Selection Bar */}
        <div className="selection-bar" style={{
          display: selectedClaims.length > 0 ? 'flex' : 'none',
          margin: '0 20px 20px',
          padding: '12px 16px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <FiCheckSquare />
          <span>{selectedClaims.length} item{selectedClaims.length !== 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelectedClaims([])} style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}>
            Clear
          </button>
        </div>

        {/* Table Container */}
        <div className="table-wrapper" style={{ padding: '0 20px 20px' }}>
          <div className="table-container" ref={tableContainerRef} style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div className="loading-state" style={{
                padding: '60px 20px',
                textAlign: 'center'
              }}>
                <div className="loading-spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <p style={{ color: '#64748b', margin: 0 }}>Loading company claims...</p>
              </div>
            ) : filteredClaims.length > 0 ? (
              windowWidth < 768 ? (
                // Mobile Card View
                <div style={{ padding: '8px' }}>
                  {currentItems.map(claim => renderMobileCard(claim))}
                </div>
              ) : (
                // Desktop/Tablet Table View
                <table className="orders-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th className="checkbox-column" style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e2e8f0'
                      }}>
                        <button className="checkbox-btn" onClick={handleSelectAll} style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: selectAll ? '#3b82f6' : '#94a3b8',
                          fontSize: '18px'
                        }}>
                          {selectAll ? <FiCheckSquare /> : <FiSquare />}
                        </button>
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Claim Code</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Customer</th>
                      {windowWidth >= 1024 && <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Phone</th>}
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Battery Model</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Battery Serial</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Claim Date</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((claim, index) => {
                      return (
                        <motion.tr 
                          key={claim.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: '#eff6ff' }}
                          className={selectedClaims.includes(claim.id) ? 'selected-row' : ''}
                          onClick={() => handleViewClaim(claim)}
                          style={{
                            backgroundColor: selectedClaims.includes(claim.id) ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            borderBottom: '1px solid #e2e8f0'
                          }}
                        >
                          <td className="checkbox-column" style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="checkbox-btn"
                              onClick={() => handleSelectClaim(claim.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: selectedClaims.includes(claim.id) ? '#3b82f6' : '#94a3b8',
                                fontSize: '18px'
                              }}
                            >
                              {selectedClaims.includes(claim.id) ? <FiCheckSquare /> : <FiSquare />}
                            </button>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontWeight: 600, color: '#3b82f6' }}>{claim.claim_code}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div className="customer-cell" style={{ display: 'flex', alignItems: 'center' }}>
                              <FiUser style={{ color: '#64748b', marginRight: '8px' }} />
                              <span>{claim.customer_name || 'N/A'}</span>
                            </div>
                          </td>
                          {windowWidth >= 1024 && (
                            <td style={{ padding: '16px' }}>
                              <div className="phone-info" style={{ display: 'flex', alignItems: 'center' }}>
                                <FiPhone style={{ color: '#64748b', marginRight: '8px' }} />
                                {claim.customer_phone || 'N/A'}
                              </div>
                            </td>
                          )}
                          <td style={{ padding: '16px' }}>
                            <span>{claim.battery_model || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontFamily: 'monospace' }}>{claim.battery_serial || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span>{formatDate(claim.claim_date)}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div className="action-buttons" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                              <motion.button 
                                className="action-btn view"
                                onClick={() => handleViewClaim(claim)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="View Details"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#dbeafe',
                                  color: '#1e40af',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiEye />
                              </motion.button>
                              <motion.button 
                                className="action-btn delete"
                                onClick={() => handleDeleteClaim(claim.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete"
                                style={{
                                  width: '32px',
                                  height: '32px',
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
                                <FiTrash2 />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              <div className="empty-state" style={{
                padding: '60px 20px',
                textAlign: 'center'
              }}>
                <FiPackage className="empty-icon" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '20px' }} />
                <h3 style={{ color: '#64748b', marginBottom: '10px', fontWeight: 500 }}>No company claims found</h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Try adjusting your filters</p>
                <motion.button 
                  className="btn primary"
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiRefreshCw />
                  Refresh Data
                </motion.button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredClaims.length > 0 && (
            <div className="pagination-container" style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: windowWidth < 768 ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: windowWidth < 768 ? 'stretch' : 'center',
              gap: '16px',
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div className="pagination-info" style={{ color: '#64748b', fontSize: '14px' }}>
                {windowWidth >= 640 ? (
                  <>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClaims.length)} of {filteredClaims.length} entries</>
                ) : (
                  <>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClaims.length)} of {filteredClaims.length}</>
                )}
              </div>
              
              <div className="pagination-controls" style={{
                display: 'flex',
                flexDirection: windowWidth < 768 ? 'column' : 'row',
                gap: '16px',
                alignItems: windowWidth < 768 ? 'stretch' : 'center'
              }}>
                {windowWidth >= 768 && (
                  <div className="items-per-page" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Show:</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} style={{
                      padding: '6px 10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}>
                      {itemsPerPageOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pagination-buttons" style={{
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => goToPage(1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="First Page"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      background: currentPage === 1 ? '#f1f5f9' : 'white',
                      color: currentPage === 1 ? '#94a3b8' : '#334155',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronsLeft />
                  </button>
                  <button 
                    onClick={() => goToPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="Previous Page"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      background: currentPage === 1 ? '#f1f5f9' : 'white',
                      color: currentPage === 1 ? '#94a3b8' : '#334155',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  <div className="page-numbers" style={{ display: 'flex', gap: '4px' }}>
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis" style={{
                          padding: '8px 12px',
                          color: '#94a3b8'
                        }}>...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            background: currentPage === page ? '#3b82f6' : 'white',
                            color: currentPage === page ? 'white' : '#334155',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            minWidth: '36px'
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
                    title="Next Page"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      background: currentPage === totalPages ? '#f1f5f9' : 'white',
                      color: currentPage === totalPages ? '#94a3b8' : '#334155',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronRight />
                  </button>
                  <button 
                    onClick={() => goToPage(totalPages)} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    title="Last Page"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      background: currentPage === totalPages ? '#f1f5f9' : 'white',
                      color: currentPage === totalPages ? '#94a3b8' : '#334155',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronsRight />
                  </button>
                </div>

                {windowWidth >= 1024 && (
                  <div className="page-jump" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Go to page:</span>
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
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>of {totalPages}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer - Simplified */}
        {!loading && filteredClaims.length > 0 && (
          <div className="summary-footer" style={{
            margin: '0 20px 20px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div className="summary-info" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span className="claim-type-badge" style={{
                padding: '4px 12px',
                background: '#3b82f620',
                color: '#3b82f6',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                COMPANY CLAIMS
              </span>
              <span className="divider" style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '14px', color: '#334155' }}>
                Showing {filteredClaims.length} of {claims.length} claims
              </span>
              {selectedClaims.length > 0 && (
                <>
                  <span className="divider" style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '14px', color: '#334155' }}>
                    {selectedClaims.length} selected
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            .spinning {
              animation: spin 1s linear infinite;
            }
            
            @media (max-width: 640px) {
              .pagination-btn {
                padding: 10px !important;
              }
            }
          `}
        </style>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedClaim && (
        <CompclaimDetailModal
          battery={{
            id: selectedClaim.id,
            battery_code: selectedClaim.claim_code,
            battery_model: selectedClaim.battery_model,
            battery_serial: selectedClaim.battery_serial,
            brand: selectedClaim.brand,
            capacity: selectedClaim.capacity,
            voltage: selectedClaim.voltage,
            battery_type: selectedClaim.battery_type,
            category: selectedClaim.source === 'service' ? 'Service Claim' : 'Battery Claim',
            price: selectedClaim.estimated_cost,
            warranty_period: selectedClaim.warranty_period,
            amc_period: '',
            inverter_model: '',
            battery_condition: selectedClaim.is_overdue ? 'poor' : 'good',
            is_spare: false,
            created_at: selectedClaim.claim_date,
            total_services: selectedClaim.age_days,
            specifications: selectedClaim.issue_description,
            purchase_date: selectedClaim.purchase_date,
            installation_date: '',
            last_service_date: '',
            stock_quantity: '0',
            claim_type: selectedClaim.claim_type,
            status: selectedClaim.status,
            shop_stock_quantity: '0',
            company_stock_quantity: '0',
            tracking_status: selectedClaim.status
          }}
          onClose={handleCloseModal}
          getBatteryTypeColor={getBatteryTypeColor}
          getConditionColor={getConditionColor}
          getClaimColor={getClaimColor}
          getTrackingStatusColor={getStatusColor}
        />
      )}
    </>
  );
};

export default CompclaimTab;