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
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiUser,
  FiPhone,
  FiHash,
  FiMenu,
  FiGrid,
  FiList
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  is_spare: boolean;
  spare_status?: string;
  created_at: string;
  total_services?: number;
  specifications?: string;
  purchase_date?: string;
  installation_date?: string;
  last_service_date?: string;
  stock_quantity?: string;
  claim_type: string;
  status: string;
  shop_stock_quantity?: string;
  company_stock_quantity?: string;
  tracking_status?: string;
}

interface SuntocompTabProps {
  batteries: Battery[];
  filteredBatteries: Battery[];
  filterStatus: string;
  filterBatteryType: string;
  searchTerm: string;
  loading: boolean;
  onViewBattery: (battery: Battery) => void;
  onDeleteBattery: (id: number) => void;
  onRefresh: () => void;
  onFilterStatusChange: (status: string) => void;
  onFilterBatteryTypeChange: (type: string) => void;
  getBatteryTypeColor: (type: string) => string;
  getConditionColor: (condition: string) => string;
  getClaimColor: (claim: string) => string;
  getTrackingStatusColor: (status: string) => string;
}

const SuntocompTab: React.FC<SuntocompTabProps> = ({
  batteries,
  filteredBatteries,
  filterStatus,
  filterBatteryType,
  searchTerm,
  loading,
  onViewBattery,
  onDeleteBattery,
  onRefresh,
  onFilterStatusChange,
  onFilterBatteryTypeChange,
  getBatteryTypeColor,
  getConditionColor,
  getClaimColor,
  getTrackingStatusColor
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
  const [selectedBatteries, setSelectedBatteries] = useState<number[]>([]);
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
  const [filteredData, setFilteredData] = useState<Battery[]>([]);
  
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

  // Filter batteries to only show "suntocomp" claim_type
  const suntocompBatteries = batteries.filter(battery => 
    battery.claim_type && battery.claim_type.toLowerCase() === 'suntocomp'
  );
  
  const filteredSuntocompBatteries = filteredBatteries.filter(battery => 
    battery.claim_type && battery.claim_type.toLowerCase() === 'suntocomp'
  );

  // Date filter function
  const filterByDate = (battery: Battery) => {
    if (dateFilterType === "all") return true;
    
    const batteryDate = new Date(battery.purchase_date || battery.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    switch(dateFilterType) {
      case "today":
        return batteryDate >= today;
      case "week": {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return batteryDate >= startOfWeek && batteryDate <= endOfWeek;
      }
      case "month":
        return batteryDate.getMonth() === today.getMonth() && 
               batteryDate.getFullYear() === today.getFullYear();
      case "year":
        return batteryDate.getFullYear() === selectedYear;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
          return batteryDate >= start && batteryDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Filter batteries based on all filters
  useEffect(() => {
    let filtered = filteredSuntocompBatteries.filter(battery => {
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        if (!(
          battery.battery_code?.toLowerCase().includes(searchLower) ||
          battery.battery_model?.toLowerCase().includes(searchLower) ||
          battery.battery_serial?.toLowerCase().includes(searchLower) ||
          battery.brand?.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }
      
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'active') {
          if (battery.status && battery.status !== '' && battery.status !== 'active') return false;
        } else if (battery.status !== filterStatus) {
          return false;
        }
      }
      
      // Type filter
      if (filterBatteryType !== "all" && battery.battery_type !== filterBatteryType) {
        return false;
      }
      
      // Date filter
      if (!filterByDate(battery)) return false;
      
      return true;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [filteredSuntocompBatteries, localSearchTerm, filterStatus, filterBatteryType, dateFilterType, customDateRange, selectedYear, selectedMonth]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get status count
  const getStatusCount = (status: string) => {
    if (status === 'active') {
      return suntocompBatteries.filter(b => !b.status || b.status === '' || b.status === 'active').length;
    }
    return suntocompBatteries.filter(b => b.status === status).length;
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBatteries([]);
    } else {
      setSelectedBatteries(currentItems.map(b => b.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single
  const handleSelectBattery = (id: number) => {
    if (selectedBatteries.includes(id)) {
      setSelectedBatteries(selectedBatteries.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedBatteries([...selectedBatteries, id]);
      if (selectedBatteries.length + 1 === currentItems.length) {
        setSelectAll(true);
      }
    }
  };

  useEffect(() => {
    if (currentItems.length > 0 && selectedBatteries.length === currentItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBatteries, currentItems]);

  const getSelectedBatteries = () => {
    return filteredData.filter(battery => selectedBatteries.includes(battery.id));
  };

  // Handle date filter change
  const handleDateFilterChange = (type: string) => {
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
    onFilterStatusChange('all');
    onFilterBatteryTypeChange('all');
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
      const dataToExport = selectedBatteries.length > 0 ? getSelectedBatteries() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Battery Code', 'Model', 'Serial', 'Brand', 'Type', 'Capacity', 'Voltage',
        'Price', 'Warranty Period', 'Condition', 'Status', 'Purchase Date',
        'Tracking Status', 'Created Date'
      ];
      
      const rows = dataToExport.map(battery => [
        battery.battery_code,
        battery.battery_model,
        battery.battery_serial,
        battery.brand || 'N/A',
        battery.battery_type || 'N/A',
        battery.capacity || 'N/A',
        battery.voltage || 'N/A',
        parseFloat(battery.price || '0').toFixed(2),
        battery.warranty_period || 'N/A',
        battery.battery_condition || 'N/A',
        battery.status || 'Active',
        battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A',
        battery.tracking_status || 'N/A',
        new Date(battery.created_at).toLocaleDateString()
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SunToCompany Batteries');
      XLSX.writeFile(wb, `suntocomp_batteries_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedBatteries.length > 0 ? getSelectedBatteries() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - SUN TO COMPANY BATTERIES REPORT', 148.5, 13, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
      doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
      
      if (selectedBatteries.length > 0) {
        doc.text(`Selected Records: ${selectedBatteries.length}`, 14, 45);
      }

      const headers = [
        ['S.No', 'Code', 'Model', 'Type', 'Condition', 'Status', 'Price', 'Purchase Date']
      ];
      
      const tableData = dataToExport.map((battery, index) => [
        (index + 1).toString(),
        battery.battery_code,
        battery.battery_model,
        battery.battery_type || 'N/A',
        battery.battery_condition || 'N/A',
        battery.status || 'Active',
        `₹${parseFloat(battery.price || '0').toFixed(2)}`,
        battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: selectedBatteries.length > 0 ? 50 : 45,
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
          fillColor: [245, 158, 11], 
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
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25, halign: 'right' },
          7: { cellWidth: 25, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Sun to Company Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`suntocomp_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handlePrint = () => {
    const dataToExport = selectedBatteries.length > 0 ? getSelectedBatteries() : filteredData;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Sun to Company Batteries Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #f59e0b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fde68a; font-weight: 500; color: #92400e; }
              .table-responsive { overflow-x: auto; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; min-width: 800px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #f59e0b; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #d97706; }
              td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #f59e0b; color: white; }
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
                th { background: #f59e0b !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .table-responsive { overflow-x: visible; }
                table { min-width: 0; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🔋 Sun Powers - Sun to Company Batteries Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Batteries: ${dataToExport.length} | 
                  Selected: ${selectedBatteries.length || dataToExport.length}
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
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataToExport.map((battery, index) => `
                      <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td><strong>${battery.battery_code}</strong></td>
                        <td>${battery.battery_model}</td>
                        <td>${battery.battery_type || 'N/A'}</td>
                        <td>
                          <span class="status-badge" style="background: ${getConditionColor(battery.battery_condition)}; color: white;">
                            ${battery.battery_condition || 'N/A'}
                          </span>
                        </td>
                        <td>${battery.status || 'Active'}</td>
                        <td style="text-align: right;">₹${parseFloat(battery.price || '0').toFixed(2)}</td>
                        <td>${battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    `).join('')}
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
  const batteryTypes = [...new Set(suntocompBatteries
    .map(b => b.battery_type)
    .filter(Boolean))];

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
    if (!status || status === '') return 'Active';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  // Mobile card view
  const renderMobileCard = (battery: Battery) => {
    const isExpanded = expandedRows.includes(battery.id);
    
    return (
      <motion.div 
        key={battery.id}
        className="mobile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        onClick={() => toggleRowExpand(battery.id)}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedBatteries.includes(battery.id) ? '#f0f9ff' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectBattery(battery.id);
            }}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              color: selectedBatteries.includes(battery.id) ? '#3B82F6' : '#94a3b8',
              fontSize: '18px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedBatteries.includes(battery.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#f59e0b', fontSize: '14px' }}>{battery.battery_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{battery.battery_model}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Type</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>
              <span 
                style={{ 
                  backgroundColor: getBatteryTypeColor(battery.battery_type) + '20',
                  color: getBatteryTypeColor(battery.battery_type),
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                {battery.battery_type || 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Condition</div>
            <div>
              <span 
                style={{ 
                  backgroundColor: getConditionColor(battery.battery_condition) + '20',
                  color: getConditionColor(battery.battery_condition),
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {battery.battery_condition || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Status</div>
            <span 
              style={{ 
                backgroundColor: getTrackingStatusColor(battery.tracking_status || 'active') + '20',
                color: getTrackingStatusColor(battery.tracking_status || 'active'),
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'inline-block'
              }}
            >
              {getStatusText(battery.tracking_status || 'active')}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Price</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
              {formatCurrency(battery.price)}
            </div>
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Serial Number</div>
              <div style={{ fontSize: '13px' }}>{battery.battery_serial || 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Brand</div>
              <div style={{ fontSize: '13px' }}>{battery.brand || 'N/A'}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Purchase Date</div>
              <div style={{ fontSize: '13px' }}>{formatDate(battery.purchase_date || '')}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Warranty</div>
              <div style={{ fontSize: '13px' }}>{battery.warranty_period || 'No warranty'}</div>
            </div>
          </motion.div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <motion.button 
            className="action-btn view"
            onClick={(e) => {
              e.stopPropagation();
              onViewBattery(battery);
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
              onDeleteBattery(battery.id);
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
    <div className="suntocomp-section">
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
            <h3>Sun to Company Batteries</h3>
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
            <h2>Sun Powers to Company Batteries</h2>
            <p>Batteries claimed from Sun Powers to Company - Showing {filteredData.length} of {suntocompBatteries.length} batteries</p>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`filters-section ${windowWidth < 768 && isFilterMenuOpen ? 'mobile-filters-open' : ''}`}>
        <div className="filters-left">
          {/* Search Box */}
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={windowWidth < 640 ? "Search..." : "Search by code, model, serial or brand..."}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            {localSearchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setLocalSearchTerm('')}
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <FiCalendar className="filter-icon" />
            <select
              value={dateFilterType}
              onChange={(e) => handleDateFilterChange(e.target.value)}
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
                value={filterBatteryType}
                onChange={(e) => onFilterBatteryTypeChange(e.target.value)}
              >
                <option value="all">All Types</option>
                {batteryTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          {windowWidth >= 768 && (
            <div className="filter-group">
              <FiPackage className="filter-icon" />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

      {/* Stats Cards - Updated without Total Value */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{suntocompBatteries.length}</h3>
            <p>Total Batteries</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon scheduled">
            <FiBattery />
          </div>
          <div className="stat-content">
            <h3>{getStatusCount("active")}</h3>
            <p>Active</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon delivered">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{suntocompBatteries.filter(b => b.warranty_period && b.warranty_period !== '0').length}</h3>
            <p>Under Warranty</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon dispatched">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{filteredData.length}</h3>
            <p>Filtered Results</p>
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
      <div className="selection-bar" style={{ display: selectedBatteries.length > 0 ? 'flex' : 'none' }}>
        <FiCheckSquare />
        <span>{selectedBatteries.length} item{selectedBatteries.length !== 1 ? 's' : ''} selected</span>
        <button onClick={() => setSelectedBatteries([])}>Clear</button>
      </div>

      {/* Table Container */}
      <div className="table-wrapper">
        <div className="table-container" ref={tableContainerRef}>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading Sun to Company batteries...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {windowWidth < 768 ? (
                // Mobile Card View
                <div>
                  {currentItems.map(battery => renderMobileCard(battery))}
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
                      <th>Battery Code</th>
                      <th>Model & Serial</th>
                      {windowWidth >= 1024 && <th>Brand</th>}
                      <th>Type</th>
                      <th>Condition</th>
                      <th>Status</th>
                      {windowWidth >= 1024 && <th>Purchase Date</th>}
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((battery, index) => (
                      <motion.tr 
                        key={battery.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        className={selectedBatteries.includes(battery.id) ? 'selected-row' : ''}
                        onClick={() => onViewBattery(battery)}
                      >
                        <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="checkbox-btn"
                            onClick={() => handleSelectBattery(battery.id)}
                          >
                            {selectedBatteries.includes(battery.id) ? <FiCheckSquare /> : <FiSquare />}
                          </button>
                        </td>
                        <td>
                          <span className="delivery-code" style={{ color: '#f59e0b' }}>{battery.battery_code}</span>
                        </td>
                        <td>
                          <div className="product-cell">
                            <FiBattery className="product-icon" style={{ color: '#f59e0b' }} />
                            <div className="product-info">
                              <span className="product-model">{battery.battery_model}</span>
                              <span className="product-serial">{battery.battery_serial}</span>
                            </div>
                          </div>
                        </td>
                        {windowWidth >= 1024 && (
                          <td>
                            <span className="product-brand">{battery.brand || 'N/A'}</span>
                          </td>
                        )}
                        <td>
                          <span 
                            className="battery-type-badge"
                            style={{ 
                              backgroundColor: getBatteryTypeColor(battery.battery_type) + '20',
                              color: getBatteryTypeColor(battery.battery_type)
                            }}
                          >
                            {battery.battery_type ? battery.battery_type.replace('_', ' ').toUpperCase() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="condition-badge"
                            style={{ 
                              backgroundColor: getConditionColor(battery.battery_condition) + '20',
                              color: getConditionColor(battery.battery_condition)
                            }}
                          >
                            {battery.battery_condition ? battery.battery_condition.replace('_', ' ').toUpperCase() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: getTrackingStatusColor(battery.tracking_status || 'active') + '20',
                              color: getTrackingStatusColor(battery.tracking_status || 'active')
                            }}
                          >
                            {getStatusText(battery.tracking_status || 'active')}
                          </span>
                        </td>
                        {windowWidth >= 1024 && (
                          <td>
                            <span className="created-date">
                              {formatDate(battery.purchase_date || '')}
                            </span>
                          </td>
                        )}
                        <td>
                          <span className="product-price" style={{ color: '#059669', fontWeight: '600' }}>
                            {formatCurrency(battery.price)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                            <motion.button 
                              className="action-btn view"
                              onClick={() => onViewBattery(battery)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <FiEye />
                            </motion.button>
                            <motion.button 
                              className="action-btn delete"
                              onClick={() => onDeleteBattery(battery.id)}
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
              <FiPackage className="empty-icon" />
              <h3>No Sun to Company batteries found</h3>
              <p>Try adjusting your filters to see more results</p>
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

      {/* Summary Footer - Updated without Total Value */}
      {!loading && filteredData.length > 0 && (
        <div className="summary-footer">
          <div className="summary-info">
            <span className="claim-type-badge" style={{ backgroundColor: getClaimColor('suntocomp') + '20', color: getClaimColor('suntocomp') }}>
              <FiTruck style={{ marginRight: '4px' }} /> SUN TO COMPANY CLAIM
            </span>
            <span className="divider">•</span>
            <span>
              Showing {filteredData.length} of {suntocompBatteries.length} batteries
            </span>
            {selectedBatteries.length > 0 && (
              <>
                <span className="divider">•</span>
                <span>
                  {selectedBatteries.length} selected
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuntocompTab;