import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFilter, 
  FiTrash2, 
  FiEye, 
  FiRefreshCw, 
  FiSearch, 
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
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
  FiUser,
  FiPhone,
  FiHash,
  FiInfo,
  FiMenu,
  FiGrid,
  FiList
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "./css/ShopClaim.css";

// ShopClaim interface based on service_orders table
interface ShopClaim {
  id: number;
  claim_code: string;
  service_order_id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  battery_id?: number;
  battery_model: string;
  battery_serial: string;
  brand?: string;
  capacity?: string;
  voltage?: string;
  battery_type?: string;
  issue_description: string;
  claim_type: string;
  priority: string;
  status: string;
  claim_date: string;
  expected_resolution_date: string | null;
  resolved_date: string | null;
  resolution_notes: string | null;
  warranty_status: string;
  service_code: string;
  estimated_cost?: string;
  final_cost?: string;
  payment_status?: string;
  service_staff_name?: string;
  replacement_battery_serial?: string;
  spare_battery_id?: number;
  spare_battery_model?: string;
  spare_battery_quantity?: number;
  age_days?: number;
  is_overdue?: boolean;
  warranty_period?: string;
  warranty_expiry_date?: string;
  warranty_remarks?: string;
}

interface ShopClaimTabProps {
  claims: ShopClaim[];
  filteredClaims: ShopClaim[];
  filterStatus: string;
  filterType: string;
  filterPriority: string;
  searchTerm: string;
  loading: boolean;
  onViewClaim: (claim: ShopClaim) => void;
  onDeleteClaim: (id: number) => void;
  onRefresh: () => void;
  onFilterStatusChange: (status: string) => void;
  onFilterTypeChange: (type: string) => void;
  onFilterPriorityChange: (priority: string) => void;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
  getPriorityColor: (priority: string) => string;
}

const ShopClaimTab: React.FC<ShopClaimTabProps> = ({
  claims,
  filteredClaims,
  filterStatus,
  filterType,
  filterPriority,
  searchTerm,
  loading,
  onViewClaim,
  onDeleteClaim,
  onRefresh,
  onFilterStatusChange,
  onFilterTypeChange,
  onFilterPriorityChange,
  getStatusColor,
  getTypeColor,
  getPriorityColor
}) => {
  
  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
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
  
  // State for local search
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filteredData, setFilteredData] = useState<ShopClaim[]>([]);
  
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

  // Date filter function
  const filterByDate = (claim: ShopClaim) => {
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
    let filtered = filteredClaims.filter(claim => {
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        if (!(
          claim.claim_code?.toLowerCase().includes(searchLower) ||
          claim.customer_name?.toLowerCase().includes(searchLower) ||
          claim.customer_phone?.toLowerCase().includes(searchLower) ||
          claim.battery_model?.toLowerCase().includes(searchLower) ||
          claim.battery_serial?.toLowerCase().includes(searchLower) ||
          claim.service_code?.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }
      
      // Type filter
      if (filterType !== 'all' && claim.claim_type !== filterType) {
        return false;
      }
      
      // Date filter
      if (!filterByDate(claim)) return false;
      
      return true;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [filteredClaims, localSearchTerm, filterType, dateFilterType, customDateRange, selectedYear, selectedMonth]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
    return filteredData.filter(claim => selectedClaims.includes(claim.id));
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
    onFilterTypeChange('all');
    setCurrentPage(1);
  };

  // Toggle row expansion for mobile
  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  // Export functions
  const exportToCSV = () => {
    try {
      const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Claim Code', 'Customer Name', 'Customer Phone', 'Battery Model', 'Battery Serial',
        'Service Code', 'Claim Type', 'Claim Date', 'Expected Resolution',
        'Issue Description'
      ];
      
      const rows = dataToExport.map(claim => [
        claim.claim_code,
        claim.customer_name,
        claim.customer_phone,
        claim.battery_model || 'N/A',
        claim.battery_serial || 'N/A',
        claim.service_code || 'N/A',
        claim.claim_type || 'N/A',
        claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : 'N/A',
        claim.expected_resolution_date ? new Date(claim.expected_resolution_date).toLocaleDateString() : 'N/A',
        claim.issue_description || 'N/A'
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Shop Claims');
      XLSX.writeFile(wb, `shop_claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredData;
      
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
      doc.text('SUN POWERS - SHOP CLAIMS REPORT', 148.5, 13, { align: 'center' });
      
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
        ['S.No', 'Claim Code', 'Customer', 'Phone', 'Battery Model', 'Battery Serial', 'Claim Type', 'Claim Date']
      ];
      
      const tableData = dataToExport.map((claim, index) => [
        (index + 1).toString(),
        claim.claim_code,
        claim.customer_name,
        claim.customer_phone,
        claim.battery_model || 'N/A',
        claim.battery_serial || 'N/A',
        claim.claim_type || 'N/A',
        claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : 'N/A'
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
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
          6: { cellWidth: 30 },
          7: { cellWidth: 30, halign: 'center' }
        },
        margin: { top: 45, left: 8, right: 8 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Shop Claims Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`shop_claims_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handlePrint = () => {
    const dataToExport = selectedClaims.length > 0 ? getSelectedClaims() : filteredData;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Shop Claims Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #a7f3d0; font-weight: 500; color: #065f46; }
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
              <h1>🔋 Sun Powers - Shop Claims Report</h1>
              
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
                      <th>Phone</th>
                      <th>Battery Model</th>
                      <th>Battery Serial</th>
                      <th>Claim Type</th>
                      <th>Claim Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataToExport.map((claim, index) => {
                      const typeColor = getTypeColor(claim.claim_type);
                      return `
                        <tr>
                          <td style="text-align: center;">${index + 1}</td>
                          <td><strong>${claim.claim_code}</strong></td>
                          <td>${claim.customer_name}</td>
                          <td>${claim.customer_phone}</td>
                          <td>${claim.battery_model || 'N/A'}</td>
                          <td>${claim.battery_serial || 'N/A'}</td>
                          <td>
                            <span class="status-badge" style="background: ${typeColor}; color: white;">
                              ${claim.claim_type || 'N/A'}
                            </span>
                          </td>
                          <td>${new Date(claim.claim_date).toLocaleDateString()}</td>
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
  const claimTypes = [...new Set(claims.map(c => c.claim_type).filter(Boolean))];

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

  // Mobile card view
  const renderMobileCard = (claim: ShopClaim) => {
    const isExpanded = expandedRows.includes(claim.id);
    
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
              color: selectedClaims.includes(claim.id) ? '#10B981' : '#94a3b8',
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
            <div style={{ fontWeight: '600', color: '#10b981', fontSize: '14px' }}>{claim.claim_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{claim.customer_name}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Phone</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{claim.customer_phone}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Battery</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{claim.battery_model || 'N/A'}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Claim Type</div>
            <span 
              style={{ 
                backgroundColor: getTypeColor(claim.claim_type) + '20',
                color: getTypeColor(claim.claim_type),
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'inline-block'
              }}
            >
              {claim.claim_type || 'N/A'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Claim Date</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{formatDate(claim.claim_date)}</div>
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Serial</div>
              <div style={{ fontSize: '13px' }}>{claim.battery_serial || 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Service Code</div>
              <div style={{ fontSize: '13px' }}>{claim.service_code || 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Expected Resolution</div>
              <div style={{ fontSize: '13px' }}>{claim.expected_resolution_date ? formatDate(claim.expected_resolution_date) : 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Issue Description</div>
              <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                {claim.issue_description || 'N/A'}
              </div>
            </div>
          </motion.div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <motion.button 
            className="action-btn view"
            onClick={(e) => {
              e.stopPropagation();
              onViewClaim(claim);
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
              onDeleteClaim(claim.id);
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
    <div className="shop-claim-section">
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
            <h3>Shop Claims</h3>
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

      {/* Section Header - Desktop */}
      {windowWidth >= 768 && (
        <div className="section-header">
          <div className="section-title">
            <h2>Shop Claims Management</h2>
            <p>Customer warranty and service claims - Showing {filteredData.length} of {claims.length} claims</p>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`filters-section ${windowWidth < 768 && isFilterMenuOpen ? 'mobile-filters-open' : ''}`}>
        <div className="filters-left">
          {/* Search Box */}
          <div className="search-wrapper" style={{ position: 'relative' }}>
            <FiSearch className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="search-input"
              placeholder={windowWidth < 640 ? "Search..." : "Search by claim code, customer, battery or service..."}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px', paddingRight: '35px' }}
            />
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm('')}
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
                title="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <FiCalendar className="filter-icon" />
            <select
              value={dateFilterType}
              onChange={handleDateFilterChange}
              className="filter-select"
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

          {/* Type Filter */}
          {windowWidth >= 768 && (
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <select 
                className="filter-select"
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
              >
                <option value="all">All Types</option>
                {claimTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="filters-right">
          {/* Export Buttons */}
          <motion.button 
            className="btn csv-btn"
            onClick={exportToCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Export to CSV"
            disabled={filteredData.length === 0}
          >
            {windowWidth >= 640 ? <><FiDownload /> CSV</> : <FiDownload />}
          </motion.button>
          <motion.button 
            className="btn pdf-btn"
            onClick={exportToPDF}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Export to PDF"
            disabled={filteredData.length === 0}
          >
            {windowWidth >= 640 ? <><FiFileText /> PDF</> : <FiFileText />}
          </motion.button>
          <motion.button 
            className="btn print-btn"
            onClick={handlePrint}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Print Report"
            disabled={filteredData.length === 0}
          >
            {windowWidth >= 640 ? <><FiPrinter /> Print</> : <FiPrinter />}
          </motion.button>
          <motion.button
            className="btn secondary refresh-btn"
            onClick={onRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            title="Refresh data"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Stats Cards - Simplified */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>{claims.length}</h3>
            <p>Total Claims</p>
          </div>
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

      {/* Selection Bar */}
      <div className="selection-bar" style={{ display: selectedClaims.length > 0 ? 'flex' : 'none' }}>
        <FiCheckSquare />
        <span>{selectedClaims.length} item{selectedClaims.length !== 1 ? 's' : ''} selected</span>
        <button onClick={() => setSelectedClaims([])}>Clear</button>
      </div>

      {/* Table Container */}
      <div className="table-wrapper">
        <div className="table-container" ref={tableContainerRef}>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading shop claims...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {windowWidth < 768 ? (
                // Mobile Card View
                <div>
                  {currentItems.map(claim => renderMobileCard(claim))}
                </div>
              ) : (
                // Desktop Table View
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th className="checkbox-column">
                        <button className="checkbox-btn" onClick={handleSelectAll}>
                          {selectAll ? <FiCheckSquare /> : <FiSquare />}
                        </button>
                      </th>
                      <th>Claim Code</th>
                      <th>Customer</th>
                      {windowWidth >= 1024 && <th>Phone</th>}
                      <th>Battery Model</th>
                      <th>Battery Serial</th>
                      <th>Claim Type</th>
                      <th>Claim Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((claim, index) => (
                      <motion.tr 
                        key={claim.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        className={selectedClaims.includes(claim.id) ? 'selected-row' : ''}
                        onClick={() => onViewClaim(claim)}
                        style={claim.is_overdue ? { borderLeft: '4px solid #ef4444' } : {}}
                      >
                        <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="checkbox-btn"
                            onClick={() => handleSelectClaim(claim.id)}
                          >
                            {selectedClaims.includes(claim.id) ? <FiCheckSquare /> : <FiSquare />}
                          </button>
                        </td>
                        <td>
                          <span className="delivery-code" style={{ color: '#10b981' }}>{claim.claim_code}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <FiUser className="customer-icon" />
                            <div className="customer-info">
                              <span className="customer-name">{claim.customer_name}</span>
                            </div>
                          </div>
                        </td>
                        {windowWidth >= 1024 && (
                          <td>
                            <div className="phone-info">
                              <FiPhone className="phone-icon" />
                              {claim.customer_phone}
                            </div>
                          </td>
                        )}
                        <td>
                          <span className="battery-model">{claim.battery_model || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="battery-serial">{claim.battery_serial || 'N/A'}</span>
                        </td>
                        <td>
                          <span 
                            className="claim-type-badge"
                            style={{ 
                              backgroundColor: getTypeColor(claim.claim_type) + '20',
                              color: getTypeColor(claim.claim_type)
                            }}
                          >
                            {claim.claim_type ? claim.claim_type.replace('_', ' ').toUpperCase() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="created-date">
                            {formatDate(claim.claim_date)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                            <motion.button 
                              className="action-btn view"
                              onClick={() => onViewClaim(claim)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <FiEye />
                            </motion.button>
                            <motion.button 
                              className="action-btn delete"
                              onClick={() => onDeleteClaim(claim.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FiAlertCircle className="empty-icon" />
              <h3>No shop claims found</h3>
              <p>Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
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
        )}
      </div>

      {/* Summary Footer - Simplified */}
      {!loading && filteredData.length > 0 && (
        <div className="summary-footer">
          <div className="summary-info">
            <span className="claim-type-badge" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
              SHOP CLAIMS
            </span>
            <span className="divider">•</span>
            <span>
              Showing {filteredData.length} of {claims.length} claims
            </span>
            {selectedClaims.length > 0 && (
              <>
                <span className="divider">•</span>
                <span>
                  {selectedClaims.length} selected
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopClaimTab;