import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiBox,
  FiBattery,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiPrinter,
  FiFileText,
  FiRefreshCw,
  FiHome,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiShield,
  FiAward,
  FiTag,
  FiSliders,
  FiInfo
} from "react-icons/fi";
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
  battery_condition: string;
  is_spare: boolean;
  created_at: string;
  total_services?: number;
  status?: string;
  purchase_date?: string;
  last_service_date?: string;
}

interface ProductsTabProps {
  batteries: Battery[];
  filterBatteryType: string;
  filterSpareStatus: string;
  searchTerm: string;
  onViewBattery: (battery: Battery) => void;
  onEditBattery: (battery: Battery) => void;
  onDeleteBattery: (id: number) => void;
  onNewBattery: () => void;
  onFilterBatteryTypeChange: (type: string) => void;
  onFilterSpareStatusChange: (status: string) => void;
  getBatteryTypeColor: (type: string) => string;
  getConditionColor: (condition: string) => string;
  loading: boolean;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  batteries,
  filterBatteryType,
  filterSpareStatus,
  searchTerm,
  onViewBattery,
  onEditBattery,
  onDeleteBattery,
  onNewBattery,
  onFilterBatteryTypeChange,
  onFilterSpareStatusChange,
  getBatteryTypeColor,
  getConditionColor,
  loading
}) => {
  
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
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pageInput, setPageInput] = useState('1');
  
  // State for local search
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filteredData, setFilteredData] = useState<Battery[]>([]);
  
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

  // Date filter function
  const filterByDate = (battery: Battery) => {
    if (dateFilterType === "all") return true;
    
    const batteryDate = new Date(battery.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
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
        return batteryDate.getMonth() === selectedMonth - 1 && 
               batteryDate.getFullYear() === selectedYear;
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
    let filtered = batteries.filter(battery => {
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        if (!(
          battery.battery_model?.toLowerCase().includes(searchLower) ||
          battery.battery_serial?.toLowerCase().includes(searchLower) ||
          battery.brand?.toLowerCase().includes(searchLower) ||
          battery.battery_code?.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }
      
      // Battery type filter
      if (filterBatteryType !== "all" && battery.battery_type !== filterBatteryType) {
        return false;
      }
      
      // Spare status filter
      if (filterSpareStatus !== "all") {
        if (filterSpareStatus === "spare") {
          if (!battery.is_spare) return false;
        } else if (filterSpareStatus === "regular") {
          if (battery.is_spare) return false;
        }
      }
      
      // Date filter
      if (!filterByDate(battery)) return false;
      
      return true;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    setExpandedRows([]);
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [batteries, localSearchTerm, filterBatteryType, filterSpareStatus, dateFilterType, customDateRange, selectedYear, selectedMonth]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get unique battery types
  const batteryTypes = useMemo(() => {
    return Array.from(
      new Set(
        batteries
          .map(b => b.battery_type)
          .filter(type => type && type.trim() !== "")
      )
    );
  }, [batteries]);

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
    onFilterBatteryTypeChange('all');
    onFilterSpareStatusChange('all');
    setSelectedBatteries([]);
    setCurrentPage(1);
    setShowMobileFilters(false);
    setShowMobileSearch(false);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    setCurrentPage(1);
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
        'Battery Code', 'Model', 'Serial Number', 'Brand', 'Type', 'Category',
        'Capacity', 'Voltage', 'Price (₹)', 'Warranty Period', 'AMC Period',
        'Condition', 'Is Spare', 'Total Services', 'Created Date', 'Purchase Date',
        'Last Service Date', 'Status'
      ];
      
      const rows = dataToExport.map(battery => [
        battery.battery_code,
        battery.battery_model,
        battery.battery_serial,
        battery.brand || 'N/A',
        battery.battery_type || 'N/A',
        battery.category || 'N/A',
        battery.capacity || 'N/A',
        battery.voltage || 'N/A',
        parseFloat(battery.price || '0').toFixed(2),
        battery.warranty_period || 'N/A',
        battery.amc_period || 'N/A',
        battery.battery_condition || 'N/A',
        battery.is_spare ? 'Yes' : 'No',
        battery.total_services || 0,
        new Date(battery.created_at).toLocaleDateString('en-IN'),
        battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString('en-IN') : 'N/A',
        battery.last_service_date ? new Date(battery.last_service_date).toLocaleDateString('en-IN') : 'N/A',
        battery.status || 'N/A'
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Batteries');
      XLSX.writeFile(wb, `batteries_export_${new Date().toISOString().split('T')[0]}.csv`);
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

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUN POWERS - BATTERY INVENTORY REPORT', 148.5, 13, { align: 'center' });
      
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
        ['S.No', 'Code', 'Model', 'Serial', 'Brand', 'Type', 'Capacity', 'Voltage', 'Price', 'Condition', 'Services', 'Created']
      ];
      
      const tableData = dataToExport.map((battery, index) => [
        (index + 1).toString(),
        battery.battery_code,
        battery.battery_model,
        battery.battery_serial,
        battery.brand || 'N/A',
        battery.battery_type || 'N/A',
        battery.capacity || 'N/A',
        battery.voltage || 'N/A',
        `₹${parseFloat(battery.price || '0').toFixed(2)}`,
        battery.battery_condition?.replace('_', ' ') || 'N/A',
        (battery.total_services || 0).toString(),
        new Date(battery.created_at).toLocaleDateString('en-IN')
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
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: 22, halign: 'right' },
          9: { cellWidth: 22, halign: 'center' },
          10: { cellWidth: 18, halign: 'center' },
          11: { cellWidth: 22, halign: 'center' }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Battery Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`batteries_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
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
            <title>Sun Powers - Battery Inventory Report</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bae6fd; font-weight: 500; color: #0369a1; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #059669; }
              td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .type-badge, .condition-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #10b981; color: white; }
              .close-btn { background: #64748b; color: white; }
              .amount { font-weight: 600; color: #059669; text-align: right; }
              .date-range { font-size: 13px; color: #0369a1; margin-bottom: 10px; }
              @media print {
                body { margin: 0.5in; background: white; }
                .no-print { display: none; }
                th { background: #10b981 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🔋 Sun Powers - Battery Inventory Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Batteries: ${dataToExport.length} | 
                  Selected: ${selectedBatteries.length || dataToExport.length} |
                  Report Type: ${selectedBatteries.length > 0 ? 'Selected Items' : 'All Filtered Items'}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Code</th>
                    <th>Model</th>
                    <th>Serial</th>
                    <th>Brand</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Voltage</th>
                    <th>Price</th>
                    <th>Condition</th>
                    <th>Services</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map((battery, index) => `
                    <tr>
                      <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                      <td><strong>${battery.battery_code}</strong></td>
                      <td>${battery.battery_model}</td>
                      <td>${battery.battery_serial}</td>
                      <td>${battery.brand || 'N/A'}</td>
                      <td>
                        <span class="type-badge">
                          ${battery.battery_type?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td>${battery.capacity || 'N/A'}</td>
                      <td>${battery.voltage || 'N/A'}</td>
                      <td class="amount">₹${parseFloat(battery.price || '0').toFixed(2)}</td>
                      <td>
                        <span class="condition-badge">
                          ${battery.battery_condition?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td style="text-align: center;">${battery.total_services || 0}</td>
                      <td>${new Date(battery.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  `).join('')}
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

  const formatCurrency = (price: string) => {
    const num = parseFloat(price || '0');
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
  };

  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
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

  // Mobile card view render
  const renderMobileCard = (battery: Battery) => {
    const isExpanded = expandedRows.includes(battery.id);
    
    return (
      <motion.div 
        key={battery.id}
        className="mobile-battery-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
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
        onClick={() => toggleRowExpand(battery.id)}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectBattery(battery.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: selectedBatteries.includes(battery.id) ? '#10b981' : '#94a3b8',
              fontSize: '18px'
            }}
          >
            {selectedBatteries.includes(battery.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}>
            <FiBattery />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#10b981', fontSize: '14px' }}>{battery.battery_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{battery.battery_model}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Serial Number</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{battery.battery_serial}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Brand</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{battery.brand || 'N/A'}</div>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: getBatteryTypeColor(battery.battery_type) + '20',
            color: getBatteryTypeColor(battery.battery_type)
          }}>
            {battery.battery_type?.replace('_', ' ') || 'N/A'}
          </span>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: getConditionColor(battery.battery_condition) + '20',
            color: getConditionColor(battery.battery_condition)
          }}>
            {battery.battery_condition?.replace('_', ' ') || 'N/A'}
          </span>
          
          {battery.is_spare && (
            <span style={{
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              border: '1px solid #fde68a'
            }}>
              Spare
            </span>
          )}
        </div>
        
        {/* Price and Services */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Price</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
              {formatCurrency(battery.price)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Services</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', background: '#f1f5f9', padding: '4px 8px', borderRadius: '20px' }}>
              {battery.total_services || 0}
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <FiPackage size={12} style={{ display: 'inline', marginRight: '4px' }} /> Capacity
                </div>
                <div style={{ fontSize: '13px' }}>{battery.capacity || 'N/A'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <FiBattery size={12} style={{ display: 'inline', marginRight: '4px' }} /> Voltage
                </div>
                <div style={{ fontSize: '13px' }}>{battery.voltage || 'N/A'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <FiShield size={12} style={{ display: 'inline', marginRight: '4px' }} /> Warranty
                </div>
                <div style={{ fontSize: '13px' }}>{battery.warranty_period || 'N/A'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  <FiAward size={12} style={{ display: 'inline', marginRight: '4px' }} /> AMC
                </div>
                <div style={{ fontSize: '13px' }}>{battery.amc_period || 'N/A'}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Created Date
              </div>
              <div style={{ fontSize: '13px' }}>{formatDate(battery.created_at)}</div>
            </div>
            
            {battery.purchase_date && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Purchase Date</div>
                <div style={{ fontSize: '13px' }}>{formatDate(battery.purchase_date)}</div>
              </div>
            )}
            
            {battery.last_service_date && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Last Service</div>
                <div style={{ fontSize: '13px' }}>{formatDate(battery.last_service_date)}</div>
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
              onViewBattery(battery);
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
              onEditBattery(battery);
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
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBattery(battery.id);
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
  const renderTabletRow = (battery: Battery) => {
    return (
      <motion.tr 
        key={battery.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f0f9ff' }}
        className={selectedBatteries.includes(battery.id) ? 'selected-row' : ''}
        onClick={() => onViewBattery(battery)}
        style={{ fontSize: '13px' }}
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
          <span className="order-id" style={{ fontSize: '12px' }}>{battery.battery_code}</span>
        </td>
        <td>
          <div className="product-cell">
            <FiBattery className="product-icon" size={16} />
            <div className="equipment-info">
              <span className="equipment-model" style={{ fontSize: '12px' }}>{battery.battery_model}</span>
              <span className="equipment-serial" style={{ fontSize: '10px' }}>{battery.battery_serial}</span>
            </div>
          </div>
        </td>
        <td>
          <span style={{ fontSize: '12px' }}>{battery.brand || 'N/A'}</span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{battery.battery_type?.replace('_', ' ') || 'N/A'}</span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{battery.capacity || 'N/A'}</span>
        </td>
        <td>
          <span style={{ fontWeight: '500', color: '#059669', fontSize: '12px' }}>
            {formatCurrency(battery.price)}
          </span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{battery.battery_condition?.replace('_', ' ') || 'N/A'}</span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{battery.total_services || 0}</span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{formatDate(battery.created_at)}</span>
        </td>
        <td>
          <div className="action-buttons" style={{ gap: '4px' }}>
            <motion.button 
              className="action-btn view"
              onClick={(e) => {
                e.stopPropagation();
                onViewBattery(battery);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEye size={14} />
            </motion.button>
            <motion.button 
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditBattery(battery);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEdit size={14} />
            </motion.button>
            <motion.button 
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBattery(battery.id);
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
    <div className="orders-section" style={{ padding: isMobile ? '12px' : '24px' }}>
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
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Products Management</h2>
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            Showing {filteredData.length} of {batteries.length} batteries
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
                placeholder="Search by model, serial, brand..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '35px', 
                  paddingRight: '35px',
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  fontSize: isTablet ? '0.8rem' : '0.875rem'
                }}
              />
              {localSearchTerm && (
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
                placeholder="Search by model, serial, brand..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '35px', 
                  paddingRight: '35px',
                  width: '100%',
                  padding: '12px 16px 12px 40px'
                }}
                autoFocus
              />
              {localSearchTerm && (
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
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="date-input"
                    style={{ padding: '6px', fontSize: isTablet ? '0.75rem' : '0.875rem' }}
                  />
                  <span style={{ padding: '0 4px' }}>to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
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
                value={filterBatteryType}
                onChange={(e) => onFilterBatteryTypeChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Types</option>
                {batteryTypes.map(type => (
                  <option key={type} value={type}>
                    {type ? type.replace('_', ' ').toUpperCase() : 'N/A'}
                  </option>
                ))}
              </select>

              <select 
                className="filter-select"
                value={filterSpareStatus}
                onChange={(e) => onFilterSpareStatusChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Batteries</option>
                <option value="regular">Regular Batteries</option>
                <option value="spare">Spare Batteries</option>
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
                      value={customDateRange.start}
                      onChange={(e) => handleCustomDateChange('start', e.target.value)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => handleCustomDateChange('end', e.target.value)}
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
                  value={filterBatteryType}
                  onChange={(e) => onFilterBatteryTypeChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Types</option>
                  {batteryTypes.map(type => (
                    <option key={type} value={type}>
                      {type ? type.replace('_', ' ').toUpperCase() : 'N/A'}
                    </option>
                  ))}
                </select>

                <select 
                  value={filterSpareStatus}
                  onChange={(e) => onFilterSpareStatusChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Batteries</option>
                  <option value="regular">Regular Batteries</option>
                  <option value="spare">Spare Batteries</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
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
                  disabled={filteredData.length === 0}
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: filteredData.length === 0 ? 0.5 : 1
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
                  disabled={filteredData.length === 0}
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: filteredData.length === 0 ? 0.5 : 1
                  }}
                >
                  <FiFileText /> {!isTablet && 'PDF'}
                </motion.button>
                <motion.button 
                  className="btn print-btn"
                  onClick={handlePrint}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Print Report"
                  disabled={filteredData.length === 0}
                  style={{
                    padding: isTablet ? '8px 12px' : '10px 16px',
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: filteredData.length === 0 ? 0.5 : 1
                  }}
                >
                  <FiPrinter /> {!isTablet && 'Print'}
                </motion.button>
                <motion.button 
                  className="btn primary"
                  onClick={onNewBattery}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Add Battery"
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
                  <FiPlus /> {!isTablet && 'Add Battery'}
                </motion.button>
              </>
            )}

            {/* Mobile action buttons */}
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
                <motion.button 
                  className="btn primary"
                  onClick={onNewBattery}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                  <FiPlus /> Add
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
          background: '#f0f9ff',
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
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            color: '#0369a1',
            cursor: 'pointer'
          }}>
            <FiX size={14} />
            Clear Filters
          </button>
        </div>
      )}

      {/* Selection Bar */}
      {selectedBatteries.length > 0 && (
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
          <span>{selectedBatteries.length} item{selectedBatteries.length !== 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelectedBatteries([])} style={{
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
              padding: isMobile ? '40px 16px' : '60px',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading battery data...</p>
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
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Battery Code</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Model & Serial</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Brand</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Type</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Capacity</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Price (₹)</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Condition</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Services</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Created</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isTablet 
                      ? currentItems.map(battery => renderTabletRow(battery))
                      : currentItems.map((battery, index) => (
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
                              <div className="order-id-cell">
                                <span className="order-id">{battery.battery_code}</span>
                              </div>
                            </td>
                            <td>
                              <div className="product-cell">
                                <FiBattery className="product-icon" />
                                <div className="equipment-info">
                                  <span className="equipment-model">{battery.battery_model}</span>
                                  <span className="equipment-serial">{battery.battery_serial}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="client-name">{battery.brand || 'N/A'}</span>
                            </td>
                            <td>
                              <span 
                                className="type-badge"
                                style={{ 
                                  backgroundColor: getBatteryTypeColor(battery.battery_type) + '20',
                                  color: getBatteryTypeColor(battery.battery_type),
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  fontSize: '12px'
                                }}
                              >
                                {battery.battery_type ? battery.battery_type.replace('_', ' ').toUpperCase() : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <div className="equipment-info">
                                <span className="equipment-model">{battery.capacity || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <span className="amount-cell" style={{ fontWeight: '600', color: '#059669' }}>
                                {formatCurrency(battery.price)}
                              </span>
                            </td>
                            <td>
                              <span 
                                className="condition-badge"
                                style={{ 
                                  backgroundColor: getConditionColor(battery.battery_condition) + '20',
                                  color: getConditionColor(battery.battery_condition),
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  fontSize: '12px'
                                }}
                              >
                                {battery.battery_condition ? battery.battery_condition.replace('_', ' ').toUpperCase() : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: '#f1f5f9',
                                borderRadius: '20px',
                                fontWeight: '600',
                                color: '#0f172a'
                              }}>
                                {battery.total_services || 0}
                              </span>
                            </td>
                            <td>
                              <div className="date-cell">
                                <FiCalendar color="#10b981" />
                                <span>{formatDate(battery.created_at)}</span>
                              </div>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="action-buttons">
                                <motion.button 
                                  className="action-btn view"
                                  onClick={() => onViewBattery(battery)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEye />
                                </motion.button>
                                <motion.button 
                                  className="action-btn edit"
                                  onClick={() => onEditBattery(battery)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEdit />
                                </motion.button>
                                <motion.button 
                                  className="action-btn delete"
                                  onClick={() => onDeleteBattery(battery.id)}
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
                  {currentItems.map(battery => renderMobileCard(battery))}
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
              <FiBox className="empty-icon" style={{ fontSize: isMobile ? '40px' : '48px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                {localSearchTerm || dateFilterType !== 'all' || filterBatteryType !== 'all' || filterSpareStatus !== 'all'
                  ? 'No matching batteries found'
                  : 'No batteries found'
                }
              </h3>
              <p style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                {localSearchTerm || dateFilterType !== 'all' || filterBatteryType !== 'all' || filterSpareStatus !== 'all'
                  ? 'Try adjusting your filters or clear them to see all batteries'
                  : 'Start by adding your first battery'
                }
              </p>
              {(localSearchTerm || dateFilterType !== 'all' || filterBatteryType !== 'all' || filterSpareStatus !== 'all') ? (
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
                  onClick={onNewBattery}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FiPlus /> Add Battery
                </motion.button>
              )}
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

export default ProductsTab;