import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiTruck,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiEye,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiPackage,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCheckSquare,
  FiSquare,
  FiX,
  FiHome,
  FiTag
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface DeliveriesTabProps {
  deliveries: Delivery[];
  filterStatus: string;
  filterType: string;
  searchTerm: string;
  onViewDelivery: (delivery: Delivery) => void;
  onDeleteDelivery: (id: number) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onFilterStatusChange: (status: string) => void;
  onFilterTypeChange: (type: string) => void;
  getStatusColor: (status: string) => string;
  getTypeColor: (type: string) => string;
  loading: boolean;
}

const DeliveriesTab: React.FC<DeliveriesTabProps> = ({
  deliveries,
  filterStatus,
  filterType,
  searchTerm,
  onViewDelivery,
  onDeleteDelivery,
  onUpdateStatus,
  onFilterStatusChange,
  onFilterTypeChange,
  getStatusColor,
  getTypeColor,
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
  const [selectedDeliveries, setSelectedDeliveries] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pageInput, setPageInput] = useState('1');
  
  // State for local search
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filteredData, setFilteredData] = useState<Delivery[]>([]);
  
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
  const filterByDate = (delivery: Delivery) => {
    if (dateFilterType === "all") return true;
    
    const deliveryDate = new Date(delivery.scheduled_date || delivery.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    switch(dateFilterType) {
      case "today":
        return deliveryDate >= today;
      case "week": {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return deliveryDate >= startOfWeek && deliveryDate <= endOfWeek;
      }
      case "month":
        return deliveryDate.getMonth() === selectedMonth - 1 && 
               deliveryDate.getFullYear() === selectedYear;
      case "year":
        return deliveryDate.getFullYear() === selectedYear;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
          return deliveryDate >= start && deliveryDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Filter deliveries based on all filters
  useEffect(() => {
    let filtered = deliveries.filter(delivery => {
      // Search filter
      if (localSearchTerm) {
        const searchLower = localSearchTerm.toLowerCase();
        if (!(
          delivery.delivery_code?.toLowerCase().includes(searchLower) ||
          delivery.service_code?.toLowerCase().includes(searchLower) ||
          delivery.customer_name?.toLowerCase().includes(searchLower) ||
          delivery.customer_phone?.toLowerCase().includes(searchLower) ||
          delivery.contact_person?.toLowerCase().includes(searchLower) ||
          delivery.contact_phone?.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }
      
      // Status filter
      if (filterStatus !== "all" && delivery.status !== filterStatus) {
        return false;
      }
      
      // Type filter
      if (filterType !== "all" && delivery.delivery_type !== filterType) {
        return false;
      }
      
      // Date filter
      if (!filterByDate(delivery)) return false;
      
      return true;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setPageInput('1');
    setExpandedRows([]);
    
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [deliveries, localSearchTerm, filterStatus, filterType, dateFilterType, customDateRange, selectedYear, selectedMonth]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Status options
  const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "dispatched", label: "Dispatched" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "failed", label: "Failed" }
  ];

  // Delivery type options
  const typeOptions = [
    { value: "home_delivery", label: "Home Delivery" },
    { value: "pickup", label: "Pickup" },
    { value: "exchange", label: "Exchange" },
    { value: "installation", label: "Installation" }
  ];

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(currentItems.map(d => d.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select single
  const handleSelectDelivery = (id: number) => {
    if (selectedDeliveries.includes(id)) {
      setSelectedDeliveries(selectedDeliveries.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedDeliveries([...selectedDeliveries, id]);
      if (selectedDeliveries.length + 1 === currentItems.length) {
        setSelectAll(true);
      }
    }
  };

  useEffect(() => {
    if (currentItems.length > 0 && selectedDeliveries.length === currentItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedDeliveries, currentItems]);

  const getSelectedDeliveries = () => {
    return filteredData.filter(delivery => selectedDeliveries.includes(delivery.id));
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
    onFilterTypeChange('all');
    setSelectedDeliveries([]);
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
      const dataToExport = selectedDeliveries.length > 0 ? getSelectedDeliveries() : filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = [
        'Delivery Code', 'Service Code', 'Customer Name', 'Customer Phone',
        'Delivery Type', 'Status', 'Scheduled Date', 'Scheduled Time',
        'Address', 'Contact Person', 'Contact Phone', 'Delivery Person',
        'Battery Brand', 'Battery Model', 'Notes', 'Delivered Date', 'Created Date'
      ];
      
      const rows = dataToExport.map(delivery => [
        delivery.delivery_code,
        delivery.service_code,
        delivery.customer_name,
        delivery.customer_phone,
        delivery.delivery_type?.replace('_', ' '),
        delivery.status?.replace('_', ' '),
        delivery.scheduled_date_formatted,
        delivery.scheduled_time_formatted,
        delivery.address,
        delivery.contact_person,
        delivery.contact_phone,
        delivery.delivery_person || 'N/A',
        delivery.battery_brand || 'N/A',
        delivery.battery_model || 'N/A',
        delivery.notes || 'N/A',
        delivery.delivered_date ? new Date(delivery.delivered_date).toLocaleDateString('en-IN') : 'N/A',
        new Date(delivery.created_at).toLocaleDateString('en-IN')
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Deliveries');
      XLSX.writeFile(wb, `deliveries_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const dataToExport = selectedDeliveries.length > 0 ? getSelectedDeliveries() : filteredData;
      
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
      doc.text('SUN POWERS - DELIVERIES REPORT', 148.5, 13, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
      doc.text(`Date Range: ${getDateRangeText()}`, 14, 35);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 40);
      
      if (selectedDeliveries.length > 0) {
        doc.text(`Selected Records: ${selectedDeliveries.length}`, 14, 45);
      }

      const headers = [
        ['S.No', 'Code', 'Service', 'Customer', 'Type', 'Status', 'Schedule', 'Address', 'Contact', 'Battery']
      ];
      
      const tableData = dataToExport.map((delivery, index) => [
        (index + 1).toString(),
        delivery.delivery_code,
        delivery.service_code,
        delivery.customer_name,
        delivery.delivery_type?.replace('_', ' ') || 'N/A',
        delivery.status?.replace('_', ' ') || 'N/A',
        `${delivery.scheduled_date_formatted} ${delivery.scheduled_time_formatted}`,
        delivery.address.substring(0, 30) + (delivery.address.length > 30 ? '...' : ''),
        delivery.contact_phone,
        delivery.battery_brand || 'N/A'
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: selectedDeliveries.length > 0 ? 50 : 45,
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
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
          7: { cellWidth: 35 },
          8: { cellWidth: 25 },
          9: { cellWidth: 25 }
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
              `Page ${i} of ${pageCount} - Sun Powers Deliveries Report - ${getDateRangeText()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        }
      });

      doc.save(`deliveries_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handlePrint = () => {
    const dataToExport = selectedDeliveries.length > 0 ? getSelectedDeliveries() : filteredData;
    
    if (dataToExport.length === 0) {
      alert('No data to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sun Powers - Deliveries Report</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
              .print-container { max-width: 1400px; margin: 0 auto; }
              h1 { color: #f59e0b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .stats { background: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fde68a; font-weight: 500; color: #92400e; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th { background: #f59e0b; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #d97706; }
              td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
              tr:nth-child(even) { background: #f8fafc; }
              .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; }
              .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
              .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
              .print-btn { background: #f59e0b; color: white; }
              .close-btn { background: #64748b; color: white; }
              @media print {
                body { margin: 0.5in; background: white; }
                .no-print { display: none; }
                th { background: #f59e0b !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                tr:nth-child(even) { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>🚚 Sun Powers - Deliveries Report</h1>
              
              <div class="header-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Generated By:</strong> System</div>
              </div>
              
              <div class="stats">
                <div><strong>📅 Date Range:</strong> ${getDateRangeText()}</div>
                <div style="margin-top: 5px;"><strong>📊 Report Summary:</strong> 
                  Total Deliveries: ${dataToExport.length} | 
                  Selected: ${selectedDeliveries.length || dataToExport.length} |
                  Report Type: ${selectedDeliveries.length > 0 ? 'Selected Items' : 'All Filtered Items'}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Delivery Code</th>
                    <th>Service Code</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Schedule</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map((delivery, index) => `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td><strong>${delivery.delivery_code}</strong></td>
                      <td>${delivery.service_code}</td>
                      <td>${delivery.customer_name}<br><small>${delivery.customer_phone}</small></td>
                      <td>${delivery.delivery_type?.replace('_', ' ')}</td>
                      <td>
                        <span class="status-badge" style="background: ${getStatusColor(delivery.status)}20; color: ${getStatusColor(delivery.status)};">
                          ${delivery.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>${delivery.scheduled_date_formatted}<br><small>${delivery.scheduled_time_formatted}</small></td>
                      <td>${delivery.contact_person}<br><small>${delivery.contact_phone}</small></td>
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <FiCalendar className="status-icon" size={isMobile ? 12 : 14} />;
      case "dispatched": return <FiTruck className="status-icon" size={isMobile ? 12 : 14} />;
      case "in_transit": return <FiRefreshCw className="status-icon" size={isMobile ? 12 : 14} />;
      case "delivered": return <FiCheckCircle className="status-icon" size={isMobile ? 12 : 14} />;
      case "cancelled": return <FiXCircle className="status-icon" size={isMobile ? 12 : 14} />;
      case "failed": return <FiXCircle className="status-icon" size={isMobile ? 12 : 14} />;
      default: return <FiCalendar className="status-icon" size={isMobile ? 12 : 14} />;
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

  const toggleRowExpand = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  // Mobile card view render
  const renderMobileCard = (delivery: Delivery) => {
    const isExpanded = expandedRows.includes(delivery.id);
    
    return (
      <motion.div 
        key={delivery.id}
        className="mobile-delivery-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#fffbeb' }}
        style={{
          padding: '16px',
          margin: '8px',
          backgroundColor: selectedDeliveries.includes(delivery.id) ? '#fffbeb' : '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => toggleRowExpand(delivery.id)}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            className="checkbox-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectDelivery(delivery.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: selectedDeliveries.includes(delivery.id) ? '#f59e0b' : '#94a3b8',
              fontSize: '18px'
            }}
          >
            {selectedDeliveries.includes(delivery.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}>
            <FiTruck />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#f59e0b', fontSize: '14px' }}>{delivery.delivery_code}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Service: {delivery.service_code}</div>
          </div>
          
          <div style={{ fontSize: '18px', color: '#94a3b8' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {/* Basic Info */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{delivery.customer_name}</div>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiPhone size={10} /> {delivery.customer_phone}
          </div>
        </div>
        
        {/* Status and Type */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: getStatusColor(delivery.status) + '20',
            color: getStatusColor(delivery.status),
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getStatusIcon(delivery.status)}
            {delivery.status?.replace('_', ' ').toUpperCase()}
          </span>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: getTypeColor(delivery.delivery_type) + '20',
            color: getTypeColor(delivery.delivery_type)
          }}>
            {delivery.delivery_type?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {/* Schedule */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '11px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiCalendar size={12} /> {delivery.scheduled_date_formatted}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiClock size={12} /> {delivery.scheduled_time_formatted}
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
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <FiMapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> Address
              </div>
              <div style={{ fontSize: '13px' }}>{delivery.address}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Contact Person</div>
              <div style={{ fontSize: '13px' }}>
                <FiUser size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {delivery.contact_person} - {delivery.contact_phone}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Battery Details</div>
              <div style={{ fontSize: '13px' }}>
                <div>{delivery.battery_brand} {delivery.battery_model}</div>
              </div>
            </div>
            
            {delivery.delivery_person && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Delivery Person</div>
                <div style={{ fontSize: '13px' }}>{delivery.delivery_person}</div>
              </div>
            )}
            
            {delivery.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                  {delivery.notes}
                </div>
              </div>
            )}
            
            {/* Status Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              {delivery.status === "scheduled" && (
                <motion.button 
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#f59e0b20',
                    color: '#f59e0b',
                    border: '1px solid #f59e0b40',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(delivery.id, "dispatched");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTruck size={14} /> Dispatch
                </motion.button>
              )}
              
              {delivery.status === "dispatched" && (
                <motion.button 
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#f59e0b20',
                    color: '#f59e0b',
                    border: '1px solid #f59e0b40',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(delivery.id, "in_transit");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiRefreshCw size={14} /> In Transit
                </motion.button>
              )}
              
              {delivery.status === "in_transit" && (
                <motion.button 
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#10b98120',
                    color: '#10b981',
                    border: '1px solid #10b98140',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(delivery.id, "delivered");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCheckCircle size={14} /> Deliver
                </motion.button>
              )}
              
              {(delivery.status === "scheduled" || delivery.status === "dispatched") && (
                <motion.button 
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ef444420',
                    color: '#ef4444',
                    border: '1px solid #ef444440',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(delivery.id, "cancelled");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiXCircle size={14} /> Cancel
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Action Buttons - Edit removed, only View and Delete */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <motion.button 
            className="action-btn view"
            onClick={(e) => {
              e.stopPropagation();
              onViewDelivery(delivery);
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
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDelivery(delivery.id);
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
  const renderTabletRow = (delivery: Delivery) => {
    return (
      <motion.tr 
        key={delivery.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#fffbeb' }}
        className={selectedDeliveries.includes(delivery.id) ? 'selected-row' : ''}
        onClick={() => onViewDelivery(delivery)}
        style={{ fontSize: '13px' }}
      >
        <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
          <button 
            className="checkbox-btn"
            onClick={() => handleSelectDelivery(delivery.id)}
          >
            {selectedDeliveries.includes(delivery.id) ? <FiCheckSquare /> : <FiSquare />}
          </button>
        </td>
        <td>
          <span style={{ fontWeight: '600', color: '#f59e0b', fontSize: '12px' }}>{delivery.delivery_code}</span>
        </td>
        <td>
          <span style={{ fontSize: '11px' }}>{delivery.service_code}</span>
        </td>
        <td>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>{delivery.customer_name}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{delivery.customer_phone}</div>
          </div>
        </td>
        <td>
          <span style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: '500',
            backgroundColor: getTypeColor(delivery.delivery_type) + '20',
            color: getTypeColor(delivery.delivery_type)
          }}>
            {delivery.delivery_type?.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td>
          <div style={{ fontSize: '11px' }}>
            <div>{delivery.scheduled_date_formatted}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{delivery.scheduled_time_formatted}</div>
          </div>
        </td>
        <td>
          <span className="status-badge" style={{
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: '500',
            backgroundColor: getStatusColor(delivery.status) + '20',
            color: getStatusColor(delivery.status),
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getStatusIcon(delivery.status)}
            <span>{delivery.status?.replace('_', ' ').toUpperCase()}</span>
          </span>
        </td>
        <td>
          <div className="action-buttons" style={{ gap: '4px' }}>
            <motion.button 
              className="action-btn view"
              onClick={(e) => {
                e.stopPropagation();
                onViewDelivery(delivery);
              }}
              style={{ width: '28px', height: '28px' }}
            >
              <FiEye size={14} />
            </motion.button>
            <motion.button 
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDelivery(delivery.id);
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
    <div className="deliveries-section" style={{ padding: isMobile ? '12px' : '24px' }}>
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
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Deliveries Management</h2>
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
            Showing {filteredData.length} of {deliveries.length} deliveries
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
                  background: showMobileSearch ? '#f59e0b' : '#f8fafc',
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
                  background: showMobileFilters ? '#f59e0b' : '#f8fafc',
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
                placeholder="Search by code, customer, phone..."
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
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select 
                className="filter-select"
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                style={{ padding: '10px', fontSize: isTablet ? '0.8rem' : '0.875rem' }}
              >
                <option value="all">All Types</option>
                {typeOptions.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
                    color: '#f59e0b',
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
                  value={filterStatus}
                  onChange={(e) => onFilterStatusChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select 
                  value={filterType}
                  onChange={(e) => onFilterTypeChange(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <option value="all">All Types</option>
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Only Total Deliveries */}
      <div className="stats-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: isMobile ? '8px' : '16px',
        marginBottom: '24px',
        maxWidth: '300px'
      }}>
        <div className="stat-card" style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: isMobile ? '12px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: isMobile ? '36px' : '48px',
            height: isMobile ? '36px' : '48px',
            borderRadius: '50%',
            background: '#f59e0b20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <FiTruck size={isMobile ? 18 : 24} />
          </div>
          <div>
            <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '600', margin: 0 }}>{deliveries.length}</h3>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#64748b', margin: 0 }}>Total Deliveries</p>
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
          background: '#fffbeb',
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
            border: '1px solid #fde68a',
            borderRadius: '6px',
            color: '#92400e',
            cursor: 'pointer'
          }}>
            <FiX size={14} />
            Clear Filters
          </button>
        </div>
      )}

      {/* Selection Bar */}
      {selectedDeliveries.length > 0 && (
        <div className="selection-bar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: isMobile ? '12px' : '12px 16px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <FiCheckSquare />
          <span>{selectedDeliveries.length} item{selectedDeliveries.length !== 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelectedDeliveries([])} style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#92400e',
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
                borderTopColor: '#f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading delivery data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {/* Desktop/Tablet Table View */}
              {!isMobile && (
                <table className="deliveries-table" style={{
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
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Delivery Code</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Service Code</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Customer</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Type</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Schedule</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Status</th>
                      <th style={{ padding: isTablet ? '12px' : '16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isTablet 
                      ? currentItems.map(delivery => renderTabletRow(delivery))
                      : currentItems.map((delivery, index) => (
                          <motion.tr 
                            key={delivery.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: '#fffbeb' }}
                            className={selectedDeliveries.includes(delivery.id) ? 'selected-row' : ''}
                            onClick={() => onViewDelivery(delivery)}
                          >
                            <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="checkbox-btn"
                                onClick={() => handleSelectDelivery(delivery.id)}
                              >
                                {selectedDeliveries.includes(delivery.id) ? <FiCheckSquare /> : <FiSquare />}
                              </button>
                            </td>
                            <td>
                              <span className="delivery-code" style={{ color: '#f59e0b', fontWeight: '600' }}>{delivery.delivery_code}</span>
                            </td>
                            <td>
                              <span className="service-code">{delivery.service_code}</span>
                            </td>
                            <td>
                              <div className="customer-info">
                                <span className="customer-name">{delivery.customer_name}</span>
                                <span className="customer-phone" style={{ fontSize: '12px', color: '#64748b' }}>{delivery.customer_phone}</span>
                              </div>
                            </td>
                            <td>
                              <span 
                                className="delivery-type-badge"
                                style={{ 
                                  backgroundColor: getTypeColor(delivery.delivery_type) + '20',
                                  color: getTypeColor(delivery.delivery_type),
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}
                              >
                                {delivery.delivery_type?.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="schedule-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <FiCalendar size={12} color="#f59e0b" />
                                  <span style={{ fontSize: '12px' }}>{delivery.scheduled_date_formatted}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FiClock size={12} color="#f59e0b" />
                                  <span style={{ fontSize: '12px' }}>{delivery.scheduled_time_formatted}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="status-container">
                                <div 
                                  className="status-badge"
                                  style={{ 
                                    backgroundColor: getStatusColor(delivery.status) + '20',
                                    color: getStatusColor(delivery.status),
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                  }}
                                >
                                  {getStatusIcon(delivery.status)}
                                  <span>{delivery.status?.replace('_', ' ').toUpperCase()}</span>
                                </div>
                                
                                {/* Status Actions */}
                                <div className="status-actions" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                  {delivery.status === "scheduled" && (
                                    <motion.button 
                                      className="status-btn dispatch"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(delivery.id, "dispatched");
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title="Mark as Dispatched"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#f59e0b20',
                                        color: '#f59e0b',
                                        border: '1px solid #f59e0b40',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <FiTruck size={12} /> Dispatch
                                    </motion.button>
                                  )}
                                  
                                  {delivery.status === "dispatched" && (
                                    <motion.button 
                                      className="status-btn transit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(delivery.id, "in_transit");
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title="Mark as In Transit"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#f59e0b20',
                                        color: '#f59e0b',
                                        border: '1px solid #f59e0b40',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <FiRefreshCw size={12} /> Transit
                                    </motion.button>
                                  )}
                                  
                                  {delivery.status === "in_transit" && (
                                    <motion.button 
                                      className="status-btn deliver"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(delivery.id, "delivered");
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title="Mark as Delivered"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#10b98120',
                                        color: '#10b981',
                                        border: '1px solid #10b98140',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <FiCheckCircle size={12} /> Deliver
                                    </motion.button>
                                  )}
                                  
                                  {(delivery.status === "scheduled" || delivery.status === "dispatched") && (
                                    <motion.button 
                                      className="status-btn cancel"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(delivery.id, "cancelled");
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title="Cancel Delivery"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#ef444420',
                                        color: '#ef4444',
                                        border: '1px solid #ef444440',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <FiXCircle size={12} /> Cancel
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                                <motion.button 
                                  className="action-btn view"
                                  onClick={() => onViewDelivery(delivery)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="View Details"
                                  style={{
                                    width: '32px',
                                    height: '32px',
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
                                  <FiEye size={14} />
                                </motion.button>
                                <motion.button 
                                  className="action-btn delete"
                                  onClick={() => onDeleteDelivery(delivery.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Delete Delivery"
                                  style={{
                                    width: '32px',
                                    height: '32px',
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
                                  <FiTrash2 size={14} />
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
                  {currentItems.map(delivery => renderMobileCard(delivery))}
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
              <FiTruck className="empty-icon" style={{ fontSize: isMobile ? '40px' : '48px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                {localSearchTerm || dateFilterType !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No matching deliveries found'
                  : 'No deliveries found'
                }
              </h3>
              <p style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                {localSearchTerm || dateFilterType !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters or clear them to see all deliveries'
                  : 'No deliveries have been scheduled yet'
                }
              </p>
              {(localSearchTerm || dateFilterType !== 'all' || filterStatus !== 'all' || filterType !== 'all') ? (
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
              ) : null}
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
                          background: currentPage === page ? '#f59e0b' : 'white',
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeliveriesTab;