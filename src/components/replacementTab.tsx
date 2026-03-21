// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiPackage,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCheckSquare,
  FiSquare,
  FiX,
  FiCalendar,
  FiUser,
  FiPhone,
  FiHash,
  FiBattery,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTruck,
  FiMenu
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

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

interface ReplacementTabProps {
  replacements: ReplacementBattery[];
  filteredReplacements: ReplacementBattery[];
  filterWarrantyStatus: string;
  searchTerm: string;
  loading: boolean;
  onViewReplacement: (replacement: ReplacementBattery) => void;
  onDeleteReplacement: (id: string) => void;
  onFilterWarrantyStatusChange: (status: string) => void;
  onRefresh: () => void;
  getStatusColor: (status: string) => string;
  onSearchChange: (term: string) => void;
}

const ReplacementTab: React.FC<ReplacementTabProps> = ({
  replacements,
  filteredReplacements: propFilteredReplacements,
  filterWarrantyStatus,
  searchTerm,
  loading,
  onViewReplacement,
  onDeleteReplacement,
  onFilterWarrantyStatusChange,
  onRefresh,
  getStatusColor,
  onSearchChange
}) => {
  
  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // State for delete modal - initially closed
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    id: '',
    title: 'Delete Replacement',
    message: 'Are you sure you want to delete this battery replacement record? This action cannot be undone.'
  });
  
  // State for date filter
  const [dateFilterType, setDateFilterType] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // State for checkbox selection
  const [selectedReplacements, setSelectedReplacements] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (window.innerWidth < 640) return 10;
    if (window.innerWidth < 1024) return 12;
    return 15;
  });
  const [pageInput, setPageInput] = useState('1');
  
  // State for local search
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filteredData, setFilteredData] = useState<ReplacementBattery[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsPerPageOptions = [5, 10, 15, 20, 50, 100];

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Adjust items per page based on screen size
      if (window.innerWidth < 640) {
        setItemsPerPage(10);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(12);
      } else {
        setItemsPerPage(15);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  // Date filter function
  const filterByDate = (replacement: ReplacementBattery) => {
    if (dateFilterType === "all") return true;
    
    const replacementDate = new Date(replacement.installation_date || replacement.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    switch(dateFilterType) {
      case "today":
        return replacementDate >= today;
      case "week": {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return replacementDate >= startOfWeek && replacementDate <= endOfWeek;
      }
      case "month":
        return replacementDate.getMonth() === selectedMonth - 1 && 
               replacementDate.getFullYear() === selectedYear;
      case "year":
        return replacementDate.getFullYear() === selectedYear;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
          return replacementDate >= start && replacementDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Apply all filters
  useEffect(() => {
    let filtered = propFilteredReplacements.filter(replacement => {
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        if (!(
          replacement.service_code?.toLowerCase().includes(searchLower) ||
          replacement.customer_name?.toLowerCase().includes(searchLower) ||
          replacement.customer_phone?.toLowerCase().includes(searchLower) ||
          replacement.battery_serial?.toLowerCase().includes(searchLower) ||
          replacement.original_battery_serial?.toLowerCase().includes(searchLower) ||
          replacement.battery_model?.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }
      
      // Date filter
      if (!filterByDate(replacement)) return false;
      
      return true;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [propFilteredReplacements, localSearchTerm, dateFilterType, customDateRange, selectedYear, selectedMonth]);

  // Sync local search term with prop
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getDateRangeText = (): string => {
    switch (dateFilterType) {
      case 'today':
        return `Today (${new Date().toLocaleDateString('en-IN')})`;
      case 'week': {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-IN')} - ${endOfWeek.toLocaleDateString('en-IN')}`;
      }
      case 'month':
        return `${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
      case 'year':
        return `Year ${selectedYear}`;
      case 'custom':
        return customDateRange.start && customDateRange.end ? 
          `${new Date(customDateRange.start).toLocaleDateString('en-IN')} - ${new Date(customDateRange.end).toLocaleDateString('en-IN')}` : 
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
    onFilterWarrantyStatusChange('all');
    setCurrentPage(1);
  };

  // Handle delete click - open modal only when button is clicked
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setDeleteModal({
      isOpen: true,
      id,
      title: 'Delete Replacement',
      message: 'Are you sure you want to delete this battery replacement record? This action cannot be undone.'
    });
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deleteModal.id) {
      onDeleteReplacement(deleteModal.id);
      setDeleteModal(prev => ({ ...prev, isOpen: false, id: '' }));
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false, id: '' }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReplacements([]);
    } else {
      setSelectedReplacements(currentItems.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single
  const handleSelectReplacement = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedReplacements.includes(id)) {
      setSelectedReplacements(selectedReplacements.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedReplacements([...selectedReplacements, id]);
      if (selectedReplacements.length + 1 === currentItems.length) {
        setSelectAll(true);
      }
    }
  };

  useEffect(() => {
    if (currentItems.length > 0 && selectedReplacements.length === currentItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedReplacements, currentItems]);

  const getSelectedReplacements = () => {
    return filteredData.filter(replacement => selectedReplacements.includes(replacement.id));
  };

  // Handle row click for view details
  const handleRowClick = (replacement: ReplacementBattery, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.checkbox-btn') || target.closest('.action-btn')) {
      return;
    }
    onViewReplacement(replacement);
  };

  // Toggle row expansion for mobile
  const toggleRowExpand = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  // Export functions
  const exportToCSV = () => {
    try {
      const dataToExport = selectedReplacements.length > 0 ? getSelectedReplacements() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Service Code', 'Customer Name', 'Phone', 'Original Battery Model', 'Original Battery Serial',
        'New Battery Model', 'New Battery Serial', 'Brand', 'Type', 'Capacity', 'Voltage',
        'Price', 'Warranty Period', 'Installation Date', 'Status', 'Warranty Status',
        'Warranty Expiry', 'Notes', 'Created Date'
      ];
      
      const rows = dataToExport.map(replacement => [
        replacement.service_code,
        replacement.customer_name,
        replacement.customer_phone,
        replacement.original_battery_model || 'N/A',
        replacement.original_battery_serial || 'N/A',
        replacement.battery_model,
        replacement.battery_serial,
        replacement.brand || 'N/A',
        replacement.battery_type?.replace('_', ' ') || 'N/A',
        replacement.capacity || 'N/A',
        replacement.voltage || 'N/A',
        parseFloat(replacement.price || '0').toFixed(2),
        replacement.warranty_period || 'N/A',
        formatDate(replacement.installation_date),
        replacement.service_status,
        replacement.warranty_status || 'N/A',
        replacement.warranty_expiry_date ? formatDate(replacement.warranty_expiry_date) : 'N/A',
        replacement.notes || 'N/A',
        formatDate(replacement.created_at)
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Replacements');
      XLSX.writeFile(wb, `replacements_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedReplacements.length > 0 ? getSelectedReplacements() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFillColor(139, 92, 246);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - BATTERY REPLACEMENTS REPORT', 148.5, 13, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
      doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
      
      if (selectedReplacements.length > 0) {
        doc.text(`Selected Records: ${selectedReplacements.length}`, 14, 45);
      }

      const headers = [
        ['S.No', 'Service Code', 'Customer', 'Phone', 'Original Battery', 'New Battery', 'Type', 'Price', 'Install Date', 'Status']
      ];
      
      const tableData = dataToExport.map((replacement, index) => [
        (index + 1).toString(),
        replacement.service_code,
        replacement.customer_name,
        replacement.customer_phone,
        replacement.original_battery_model || 'N/A',
        replacement.battery_model,
        replacement.battery_type?.replace('_', ' ') || 'N/A',
        `₹${parseFloat(replacement.price || '0').toFixed(2)}`,
        formatDate(replacement.installation_date),
        replacement.service_status
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: selectedReplacements.length > 0 ? 50 : 45,
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
          fillColor: [139, 92, 246], 
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
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 },
          7: { cellWidth: 22, halign: 'right' },
          8: { cellWidth: 22, halign: 'center' },
          9: { cellWidth: 20, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Replacements Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`replacements_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handlePrint = () => {
    const dataToExport = selectedReplacements.length > 0 ? getSelectedReplacements() : filteredData;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Battery Replacements Report</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #f5f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd6fe; font-weight: 500; color: #6d28d9; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #8b5cf6; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #7c3aed; }
              td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #8b5cf6; color: white; }
              .close-btn { background: #64748b; color: white; }
              @media print {
                body { margin: 0.5in; background: white; }
                .no-print { display: none; }
                th { background: #8b5cf6 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🔋 Sun Powers - Battery Replacements Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN')}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Replacements: ${dataToExport.length} | 
                  Selected: ${selectedReplacements.length || dataToExport.length} |
                  Report Type: ${selectedReplacements.length > 0 ? 'Selected Items' : 'All Filtered Items'}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Service Code</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Original Battery</th>
                    <th>New Battery</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Install Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map((replacement, index) => {
                    return `
                      <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td><strong>${replacement.service_code}</strong></td>
                        <td>${replacement.customer_name}</td>
                        <td>${replacement.customer_phone}</td>
                        <td>${replacement.original_battery_model || 'N/A'}</td>
                        <td>${replacement.battery_model}</td>
                        <td>${replacement.battery_type?.replace('_', ' ') || 'N/A'}</td>
                        <td style="text-align: right;">₹${parseFloat(replacement.price || '0').toFixed(2)}</td>
                        <td>${formatDate(replacement.installation_date)}</td>
                        <td>${replacement.service_status}</td>
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
    const total = totalPages;
    const pageNumbers = [];
    const maxPagesToShow = windowWidth < 640 ? 3 : 5;
    
    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let start = Math.max(2, currentPage - (windowWidth < 640 ? 1 : 1));
      let end = Math.min(total - 1, currentPage + (windowWidth < 640 ? 1 : 1));
      
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <FiCheckCircle className="status-icon delivered" size={windowWidth < 640 ? 12 : 14} />;
      case 'scheduled':
        return <FiClock className="status-icon scheduled" size={windowWidth < 640 ? 12 : 14} />;
      case 'in_progress':
        return <FiTruck className="status-icon in-progress" size={windowWidth < 640 ? 12 : 14} />;
      case 'pending':
        return <FiAlertCircle className="status-icon pending" size={windowWidth < 640 ? 12 : 14} />;
      default:
        return <FiPackage className="status-icon" size={windowWidth < 640 ? 12 : 14} />;
    }
  };

  // Get responsive column visibility
  const getVisibleColumns = () => {
    if (windowWidth >= 1280) {
      return {
        checkbox: true,
        serviceCode: true,
        customer: true,
        phone: true,
        originalBattery: true,
        newBattery: true,
        installationDate: true,
        price: true,
        status: true,
        actions: true
      };
    } else if (windowWidth >= 1024) {
      return {
        checkbox: true,
        serviceCode: true,
        customer: true,
        phone: true,
        originalBattery: true,
        newBattery: true,
        installationDate: true,
        price: true,
        status: true,
        actions: true
      };
    } else if (windowWidth >= 768) {
      return {
        checkbox: true,
        serviceCode: true,
        customer: true,
        phone: true,
        originalBattery: true,
        newBattery: true,
        installationDate: false,
        price: true,
        status: true,
        actions: true
      };
    } else {
      return {
        checkbox: true,
        serviceCode: true,
        customer: true,
        phone: false,
        originalBattery: false,
        newBattery: true,
        installationDate: false,
        price: false,
        status: true,
        actions: true
      };
    }
  };

  const visibleColumns = getVisibleColumns();

  // Stats data
  const stats = [
    {
      title: "Total Replacements",
      value: replacements.length,
      icon: <FiPackage />,
      color: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
    }
  ];

  // Mobile card view render
  const renderMobileCard = (replacement: ReplacementBattery) => {
    const isExpanded = expandedRows.includes(replacement.id);
    
    return (
      <motion.div 
        key={replacement.id}
        className="mobile-replacement-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f5f3ff' }}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedReplacements.includes(replacement.id) ? '#f5f3ff' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => toggleRowExpand(replacement.id)}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectReplacement(replacement.id, e);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: selectedReplacements.includes(replacement.id) ? '#8b5cf6' : '#94a3b8',
              fontSize: '18px',
              padding: 0
            }}
          >
            {selectedReplacements.includes(replacement.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6', fontSize: '14px' }}>{replacement.service_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Install: {formatDate(replacement.installation_date)}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Customer</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{replacement.customer_name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{replacement.customer_phone}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>New Battery</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{replacement.battery_model}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{replacement.battery_serial}</div>
          </div>
        </div>
        
        {/* Price and Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#059669'
          }}>
            ₹{parseFloat(replacement.price || '0').toFixed(2)}
          </span>
          
          <span 
            className="status-badge"
            style={{ 
              backgroundColor: getStatusColor(replacement.service_status) + '20',
              color: getStatusColor(replacement.service_status),
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {getStatusIcon(replacement.service_status)}
            <span>{replacement.service_status}</span>
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Original Battery</div>
              <div style={{ fontSize: '13px' }}>
                <div>{replacement.original_battery_model || 'N/A'}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{replacement.original_battery_serial || ''}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Details</div>
              <div style={{ fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span>Type: {replacement.battery_type || 'N/A'}</span>
                <span>Brand: {replacement.brand || 'N/A'}</span>
                <span>Capacity: {replacement.capacity || 'N/A'}</span>
                <span>Voltage: {replacement.voltage || 'N/A'}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Warranty</div>
              <div style={{ fontSize: '13px' }}>
                <div>Period: {replacement.warranty_period || 'N/A'}</div>
                <div>Status: {replacement.warranty_status || 'N/A'}</div>
                {replacement.warranty_expiry_date && (
                  <div>Expiry: {formatDate(replacement.warranty_expiry_date)}</div>
                )}
              </div>
            </div>
            
            {replacement.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  {replacement.notes}
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
              onViewReplacement(replacement);
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
            onClick={(e) => handleDeleteClick(replacement.id, e)}
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
    <div className="replacement-tab" style={{ 
      padding: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '16px' : '24px',
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={deleteModal.title}
          message={deleteModal.message}
        />
      )}

      {/* Mobile Header */}
      {windowWidth < 768 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '0 4px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Battery Replacements
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: '8px',
                background: isMobileMenuOpen ? '#8b5cf6' : '#f3f4f6',
                color: isMobileMenuOpen ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiMenu size={20} />
            </button>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              style={{
                padding: '8px',
                background: isFilterMenuOpen ? '#8b5cf6' : '#f3f4f6',
                color: isFilterMenuOpen ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiFilter size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && windowWidth < 768 && (
        <div ref={menuRef} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '280px',
            height: '100%',
            background: 'white',
            padding: '20px',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>Menu</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    exportToCSV();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiDownload /> Export CSV
                </button>
                <button
                  onClick={() => {
                    exportToPDF();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiFileText /> Export PDF
                </button>
                <button
                  onClick={() => {
                    handlePrint();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiPrinter /> Print
                </button>
                <button
                  onClick={() => {
                    onRefresh();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop/Laptop Header */}
      {windowWidth >= 768 && (
        <div className="section-header" style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div className="section-title">
            <h2 style={{ 
              fontSize: windowWidth >= 1024 ? '1.5rem' : '1.25rem', 
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Battery Replacements
            </h2>
            <p style={{ 
              fontSize: windowWidth >= 1024 ? '0.875rem' : '0.8rem', 
              color: '#6b7280',
              margin: '4px 0 0'
            }}>
              Showing {filteredData.length} of {replacements.length} replacements
            </p>
          </div>
          
          <div className="section-actions" style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            {/* Export Buttons */}
            <motion.button 
              className="btn csv-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export to CSV"
              disabled={filteredData.length === 0}
              style={{
                padding: windowWidth >= 1024 ? '10px 16px' : '8px 12px',
                fontSize: windowWidth >= 1024 ? '0.875rem' : '0.8rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredData.length === 0 ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500'
              }}
            >
              <FiDownload size={windowWidth >= 1024 ? 16 : 14} /> {windowWidth >= 1024 && 'CSV'}
            </motion.button>
            <motion.button 
              className="btn pdf-btn"
              onClick={exportToPDF}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export to PDF"
              disabled={filteredData.length === 0}
              style={{
                padding: windowWidth >= 1024 ? '10px 16px' : '8px 12px',
                fontSize: windowWidth >= 1024 ? '0.875rem' : '0.8rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredData.length === 0 ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500'
              }}
            >
              <FiFileText size={windowWidth >= 1024 ? 16 : 14} /> {windowWidth >= 1024 && 'PDF'}
            </motion.button>
            <motion.button 
              className="btn print-btn"
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Print Report"
              disabled={filteredData.length === 0}
              style={{
                padding: windowWidth >= 1024 ? '10px 16px' : '8px 12px',
                fontSize: windowWidth >= 1024 ? '0.875rem' : '0.8rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredData.length === 0 ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500'
              }}
            >
              <FiPrinter size={windowWidth >= 1024 ? 16 : 14} /> {windowWidth >= 1024 && 'Print'}
            </motion.button>
            <motion.button
              className="btn secondary refresh-btn"
              onClick={onRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              title="Refresh data"
              style={{
                padding: windowWidth >= 1024 ? '10px 16px' : '8px 12px',
                fontSize: windowWidth >= 1024 ? '0.875rem' : '0.8rem',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500'
              }}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} size={windowWidth >= 1024 ? 16 : 14} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: windowWidth < 640 ? '12px' : '16px',
        marginBottom: '24px',
        maxWidth: windowWidth >= 768 ? '300px' : '100%'
      }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: windowWidth < 640 ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="stat-icon-wrapper">
              <div className="stat-icon" style={{ 
                background: stat.color,
                width: windowWidth < 640 ? '48px' : '56px',
                height: windowWidth < 640 ? '48px' : '56px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: windowWidth < 640 ? '24px' : '28px'
              }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ 
                fontSize: windowWidth < 640 ? '1.8rem' : '2rem',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1.2'
              }}>{stat.value}</div>
              <div className="stat-title" style={{ 
                fontSize: windowWidth < 640 ? '0.875rem' : '1rem',
                color: '#6b7280'
              }}>{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="filters-section" style={{
        display: 'flex',
        flexDirection: windowWidth < 768 ? 'column' : 'row',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div className="search-wrapper" style={{
          position: 'relative',
          flex: 1,
          minWidth: windowWidth < 768 ? '100%' : '300px'
        }}>
          <FiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: windowWidth < 640 ? '16px' : '18px'
          }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by code, customer, phone, serial..."
            value={localSearchTerm}
            onChange={handleSearchInputChange}
            style={{
              width: '100%',
              padding: windowWidth < 640 ? '12px 16px 12px 40px' : '12px 20px 12px 45px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: windowWidth < 640 ? '0.875rem' : '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          {localSearchTerm && (
            <button
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '12px',
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
              <FiX size={windowWidth < 640 ? 16 : 18} />
            </button>
          )}
        </div>

        <div className="filter-group" style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          width: windowWidth < 768 ? '100%' : 'auto'
        }}>
          {/* Date Filter */}
          <select
            value={dateFilterType}
            onChange={handleDateFilterChange}
            className="filter-select"
            style={{
              padding: windowWidth < 640 ? '10px 12px' : '10px 16px',
              fontSize: windowWidth < 640 ? '0.8rem' : '0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              minWidth: windowWidth < 640 ? '100%' : windowWidth < 768 ? '150px' : '120px',
              flex: windowWidth < 640 ? '1' : 'none',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {dateFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Mobile Filters Panel */}
          {isFilterMenuOpen && windowWidth < 768 && (
            <div style={{
              width: '100%',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '8px'
            }}>
              {dateFilterType === 'custom' && (
                <div className="custom-date-range" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="date-input"
                    style={{
                      padding: '10px',
                      fontSize: '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ textAlign: 'center', color: '#64748b' }}>to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="date-input"
                    style={{
                      padding: '10px',
                      fontSize: '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    min={customDateRange.start}
                  />
                </div>
              )}

              {dateFilterType === 'year' && (
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="filter-select"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.875rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '12px'
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
                    onChange={handleMonthChange}
                    className="filter-select"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '8px'
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
                    onChange={handleYearChange}
                    className="filter-select"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Warranty Status Filter */}
              <select
                className="filter-select"
                value={filterWarrantyStatus}
                onChange={(e) => onFilterWarrantyStatusChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.875rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              >
                <option value="all">All Warranty</option>
                <option value="in_warranty">In Warranty</option>
                <option value="out_of_warranty">Out of Warranty</option>
                <option value="expired">Expired</option>
              </select>

              {/* Clear Filters Button */}
              {(localSearchTerm || dateFilterType !== 'all' || filterWarrantyStatus !== 'all') && (
                <motion.button
                  onClick={() => {
                    clearFilters();
                    setIsFilterMenuOpen(false);
                  }}
                  className="clear-filters-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.875rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: '500'
                  }}
                >
                  <FiX size={16} />
                  Clear Filters
                </motion.button>
              )}
            </div>
          )}

          {/* Desktop Filters */}
          {windowWidth >= 768 && (
            <>
              {dateFilterType === 'custom' && (
                <div className="custom-date-range" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f8fafc',
                  padding: '4px',
                  borderRadius: '8px',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="date-input"
                    style={{
                      padding: windowWidth < 1024 ? '6px' : '8px 12px',
                      fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ padding: '0 4px', color: '#64748b' }}>to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="date-input"
                    style={{
                      padding: windowWidth < 1024 ? '6px' : '8px 12px',
                      fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    min={customDateRange.start}
                  />
                </div>
              )}

              {dateFilterType === 'year' && (
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="filter-select"
                  style={{
                    padding: windowWidth < 1024 ? '8px 12px' : '10px 16px',
                    fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    minWidth: '100px',
                    outline: 'none',
                    cursor: 'pointer'
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
                    onChange={handleMonthChange}
                    className="filter-select"
                    style={{
                      padding: windowWidth < 1024 ? '8px 12px' : '10px 16px',
                      fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      minWidth: '120px',
                      outline: 'none',
                      cursor: 'pointer'
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
                    onChange={handleYearChange}
                    className="filter-select"
                    style={{
                      padding: windowWidth < 1024 ? '8px 12px' : '10px 16px',
                      fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      minWidth: '100px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Warranty Status Filter */}
              <select
                className="filter-select"
                value={filterWarrantyStatus}
                onChange={(e) => onFilterWarrantyStatusChange(e.target.value)}
                style={{
                  padding: windowWidth < 1024 ? '8px 12px' : '10px 16px',
                  fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  minWidth: '130px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Warranty</option>
                <option value="in_warranty">In Warranty</option>
                <option value="out_of_warranty">Out of Warranty</option>
                <option value="expired">Expired</option>
              </select>
            </>
          )}

          {/* Clear Filters Button - Desktop */}
          {windowWidth >= 768 && (localSearchTerm || dateFilterType !== 'all' || filterWarrantyStatus !== 'all') && (
            <motion.button
              onClick={clearFilters}
              className="clear-filters-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: windowWidth < 1024 ? '8px 12px' : '10px 16px',
                fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              <FiX size={windowWidth < 1024 ? 14 : 16} />
              Clear Filters
            </motion.button>
          )}
        </div>
      </div>

      {/* Active Filters Bar */}
      {dateFilterType !== 'all' && windowWidth >= 768 && (
        <div className="active-filters-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: windowWidth < 1024 ? '10px 12px' : '12px 16px',
          background: '#f5f3ff',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #ddd6fe'
        }}>
          <div className="filter-info" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: windowWidth < 1024 ? '0.8rem' : '0.875rem',
            color: '#6d28d9'
          }}>
            <FiCalendar size={14} />
            <span>Showing: {getDateRangeText()}</span>
          </div>
          <button className="clear-filters" onClick={clearFilters} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: 'none',
            border: '1px solid #ddd6fe',
            borderRadius: '6px',
            color: '#8b5cf6',
            cursor: 'pointer',
            fontSize: windowWidth < 1024 ? '0.75rem' : '0.8rem'
          }}>
            <FiX size={14} />
            Clear
          </button>
        </div>
      )}

      {/* Selection Bar */}
      {selectedReplacements.length > 0 && (
        <div className="selection-bar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: windowWidth < 640 ? '10px 12px' : '12px 16px',
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <FiCheckSquare color="#8b5cf6" size={windowWidth < 640 ? 16 : 18} />
          <span style={{ fontSize: windowWidth < 640 ? '0.8rem' : '0.875rem', color: '#6d28d9', fontWeight: '500' }}>
            {selectedReplacements.length} item{selectedReplacements.length !== 1 ? 's' : ''} selected
          </span>
          <button 
            onClick={() => setSelectedReplacements([])} 
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#8b5cf6',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: windowWidth < 640 ? '0.75rem' : '0.8rem'
            }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: windowWidth < 640 ? '40px 16px' : '60px',
          gap: '16px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: windowWidth < 640 ? '0.875rem' : '1rem' }}>Loading replacement data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="empty-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: windowWidth < 640 ? '40px 16px' : '60px',
          gap: '16px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <FiPackage style={{ fontSize: windowWidth < 640 ? '48px' : '64px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: windowWidth < 640 ? '1.1rem' : '1.25rem', color: '#1f2937', margin: 0 }}>
            {localSearchTerm || dateFilterType !== 'all' || filterWarrantyStatus !== 'all'
              ? 'No matching replacement records found'
              : 'No replacement records found'
            }
          </h3>
          <p style={{ fontSize: windowWidth < 640 ? '0.875rem' : '1rem', color: '#6b7280', margin: 0 }}>
            {localSearchTerm || dateFilterType !== 'all' || filterWarrantyStatus !== 'all'
              ? 'Try adjusting your filters or clear them to see all records'
              : 'No battery replacements have been recorded yet'
            }
          </p>
          {(localSearchTerm || dateFilterType !== 'all' || filterWarrantyStatus !== 'all') && (
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
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: windowWidth < 640 ? '0.875rem' : '1rem',
                color: '#374151',
                fontWeight: '500',
                marginTop: '8px'
              }}
            >
              <FiRefreshCw size={14} /> Clear All Filters
            </motion.button>
          )}
        </div>
      )}

      {/* Table/Card Container */}
      {!loading && filteredData.length > 0 && (
        <>
          {/* Mobile Card View */}
          {windowWidth < 768 ? (
            <div style={{ marginBottom: '16px' }}>
              {currentItems.map(replacement => renderMobileCard(replacement))}
            </div>
          ) : (
            /* Desktop/Tablet Table View */
            <div className="table-wrapper" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'white',
              marginBottom: '16px'
            }}>
              <div className="table-container" ref={tableContainerRef} style={{
                overflowX: 'auto',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                <table className="replacements-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: windowWidth < 1024 ? '1000px' : '1200px'
                }}>
                  <thead style={{
                    position: 'sticky',
                    top: 0,
                    background: '#f8fafc',
                    zIndex: 10,
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <tr>
                      {visibleColumns.checkbox && (
                        <th className="checkbox-column" style={{ 
                          width: '40px', 
                          padding: windowWidth < 1024 ? '12px' : '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                          color: '#4b5563'
                        }}>
                          <button className="checkbox-btn" onClick={handleSelectAll} style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: selectAll ? '#8b5cf6' : '#94a3b8',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {selectAll ? <FiCheckSquare /> : <FiSquare />}
                          </button>
                        </th>
                      )}
                      {visibleColumns.serviceCode && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Service Code</th>
                      )}
                      {visibleColumns.customer && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Customer</th>
                      )}
                      {visibleColumns.phone && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Phone</th>
                      )}
                      {visibleColumns.originalBattery && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Original Battery</th>
                      )}
                      {visibleColumns.newBattery && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>New Battery</th>
                      )}
                      {visibleColumns.installationDate && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Install Date</th>
                      )}
                      {visibleColumns.price && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Price</th>
                      )}
                      {visibleColumns.status && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Status</th>
                      )}
                      {visibleColumns.actions && (
                        <th style={{ padding: windowWidth < 1024 ? '12px' : '16px', textAlign: 'left', fontWeight: '600', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((replacement, index) => (
                      <motion.tr 
                        key={replacement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#f5f3ff', cursor: 'pointer' }}
                        className={selectedReplacements.includes(replacement.id) ? 'selected-row' : ''}
                        onClick={(e) => handleRowClick(replacement, e)}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: selectedReplacements.includes(replacement.id) ? '#f5f3ff' : 'white',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {visibleColumns.checkbox && (
                          <td className="checkbox-column" style={{ padding: windowWidth < 1024 ? '12px' : '16px' }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="checkbox-btn"
                              onClick={(e) => handleSelectReplacement(replacement.id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: selectedReplacements.includes(replacement.id) ? '#8b5cf6' : '#94a3b8',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {selectedReplacements.includes(replacement.id) ? <FiCheckSquare /> : <FiSquare />}
                            </button>
                          </td>
                        )}
                        {visibleColumns.serviceCode && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#8b5cf6', 
                              fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem'
                            }}>
                              {replacement.service_code}
                            </span>
                          </td>
                        )}
                        {visibleColumns.customer && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <div style={{ 
                              fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', 
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {replacement.customer_name}
                            </div>
                          </td>
                        )}
                        {visibleColumns.phone && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                              color: '#4b5563'
                            }}>
                              <FiPhone size={windowWidth < 1024 ? 12 : 14} style={{ color: '#64748b' }} />
                              {replacement.customer_phone}
                            </div>
                          </td>
                        )}
                        {visibleColumns.originalBattery && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <div style={{ 
                              fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {replacement.original_battery_model || 'N/A'}
                            </div>
                            {replacement.original_battery_serial && (
                              <div style={{ 
                                fontSize: windowWidth < 1024 ? '0.7rem' : '0.75rem', 
                                color: '#64748b',
                                marginTop: '2px'
                              }}>
                                {replacement.original_battery_serial}
                              </div>
                            )}
                          </td>
                        )}
                        {visibleColumns.newBattery && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <div style={{ 
                              fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {replacement.battery_model}
                            </div>
                            <div style={{ 
                              fontSize: windowWidth < 1024 ? '0.7rem' : '0.75rem', 
                              color: '#64748b',
                              marginTop: '2px'
                            }}>
                              {replacement.battery_serial}
                            </div>
                          </td>
                        )}
                        {visibleColumns.installationDate && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px', fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', color: '#4b5563' }}>
                            {formatDate(replacement.installation_date)}
                          </td>
                        )}
                        {visibleColumns.price && (
                          <td style={{ 
                            padding: windowWidth < 1024 ? '12px' : '16px', 
                            fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem', 
                            fontWeight: '600', 
                            color: '#059669'
                          }}>
                            ₹{parseFloat(replacement.price || '0').toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }}>
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: getStatusColor(replacement.service_status) + '20',
                                color: getStatusColor(replacement.service_status),
                                padding: windowWidth < 1024 ? '4px 6px' : '4px 8px',
                                borderRadius: '20px',
                                fontSize: windowWidth < 1024 ? '0.7rem' : '0.75rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {getStatusIcon(replacement.service_status)}
                              <span>{replacement.service_status}</span>
                            </span>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td style={{ padding: windowWidth < 1024 ? '12px' : '16px' }} onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                              <motion.button
                                className="action-btn view"
                                onClick={() => onViewReplacement(replacement)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title="View Details"
                                style={{
                                  width: windowWidth < 1024 ? '28px' : '32px',
                                  height: windowWidth < 1024 ? '28px' : '32px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#e0f2fe',
                                  color: '#0284c7',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <FiEye size={windowWidth < 1024 ? 14 : 16} />
                              </motion.button>
                              <motion.button
                                className="action-btn delete"
                                onClick={(e) => handleDeleteClick(replacement.id, e)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete"
                                style={{
                                  width: windowWidth < 1024 ? '28px' : '32px',
                                  height: windowWidth < 1024 ? '28px' : '32px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <FiTrash2 size={windowWidth < 1024 ? 14 : 16} />
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination-container" style={{
            padding: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '14px' : '16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderRadius: '0 0 12px 12px',
            display: 'flex',
            flexDirection: windowWidth < 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: windowWidth < 768 ? 'stretch' : 'center',
            gap: windowWidth < 768 ? '12px' : '0'
          }}>
            <div className="pagination-info" style={{
              fontSize: windowWidth < 640 ? '0.75rem' : '0.875rem',
              color: '#64748b',
              textAlign: windowWidth < 768 ? 'center' : 'left'
            }}>
              {windowWidth < 640 ? (
                <>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}</>
              ) : (
                <>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries</>
              )}
            </div>
            
            <div className="pagination-controls" style={{
              display: 'flex',
              alignItems: 'center',
              gap: windowWidth < 640 ? '8px' : '16px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {windowWidth >= 768 && (
                <div className="items-per-page" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem'
                }}>
                  <span>Show:</span>
                  <select value={itemsPerPage} onChange={handleItemsPerPageChange} style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: windowWidth < 1024 ? '0.75rem' : '0.875rem',
                    outline: 'none'
                  }}>
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pagination-buttons" style={{
                display: 'flex',
                alignItems: 'center',
                gap: windowWidth < 640 ? '2px' : '4px'
              }}>
                <button 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  style={{
                    padding: windowWidth < 640 ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563'
                  }}
                >
                  <FiChevronsLeft size={windowWidth < 640 ? 14 : 16} />
                </button>
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  style={{
                    padding: windowWidth < 640 ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563'
                  }}
                >
                  <FiChevronLeft size={windowWidth < 640 ? 14 : 16} />
                </button>
                
                <div className="page-numbers" style={{
                  display: 'flex',
                  gap: windowWidth < 640 ? '2px' : '4px'
                }}>
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} style={{
                        padding: windowWidth < 640 ? '6px 8px' : '8px 12px',
                        color: '#64748b',
                        fontSize: windowWidth < 640 ? '0.75rem' : '0.875rem'
                      }}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page as number)}
                        className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
                        style={{
                          padding: windowWidth < 640 ? '6px 10px' : '8px 12px',
                          background: currentPage === page ? '#8b5cf6' : 'white',
                          color: currentPage === page ? 'white' : '#4b5563',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: windowWidth < 640 ? '0.75rem' : '0.875rem',
                          fontWeight: currentPage === page ? '600' : '400'
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
                    padding: windowWidth < 640 ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563'
                  }}
                >
                  <FiChevronRight size={windowWidth < 640 ? 14 : 16} />
                </button>
                <button 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  style={{
                    padding: windowWidth < 640 ? '6px' : '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563'
                  }}
                >
                  <FiChevronsRight size={windowWidth < 640 ? 14 : 16} />
                </button>
              </div>

              {windowWidth >= 1024 && (
                <div className="page-jump" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem'
                }}>
                  <span>Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyPress={handlePageInputKeyPress}
                    style={{
                      width: '50px',
                      padding: '4px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        .search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .filter-select:hover {
          border-color: #8b5cf6;
        }
        
        .filter-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #8b5cf6;
        }
        
        .pagination-btn.page-number.active:hover {
          background: #7c3aed;
        }
        
        .action-btn.view:hover {
          background: #bae6fd !important;
        }
        
        .action-btn.delete:hover {
          background: #fecaca !important;
        }
        
        .checkbox-btn:hover {
          color: #8b5cf6;
        }
        
        .selected-row {
          background-color: #f5f3ff !important;
        }
        
        .status-icon.delivered {
          color: #10b981;
        }
        
        .status-icon.scheduled {
          color: #8b5cf6;
        }
        
        .status-icon.in-progress {
          color: #f59e0b;
        }
        
        .status-icon.pending {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .replacements-table th,
          .replacements-table td {
            font-size: 0.8rem;
            padding: 10px;
          }
        }

        @media (max-width: 480px) {
          .replacements-table th,
          .replacements-table td {
            font-size: 0.75rem;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReplacementTab;
