import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FiX,
  FiUser,
  FiBattery,
  FiPower,
  FiInfo,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiEdit,
  FiPrinter,
  FiUsers,
  FiBox,
  FiBatteryCharging,
  FiPackage,
  FiCheckCircle
} from "react-icons/fi";

interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  battery_model: string;
  battery_serial: string;
  original_battery_ids?: string;
  original_battery_serials?: string;
  original_battery_models?: string;
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
  notes: string;
  customer_id?: number;
  battery_id?: number;
  inverter_id?: number;
  service_staff_id?: number;
  service_staff_name?: string;
  deposit_amount?: string;
  replacement_battery_serial?: string;
  replacement_battery_model?: string;
  replacement_battery_brand?: string;
  replacement_battery_capacity?: string;
  replacement_battery_type?: string;
  replacement_battery_voltage?: string;
  replacement_battery_price?: string;
  replacement_battery_warranty?: string;
  replacement_installation_date?: string;
  replacement_battery_notes?: string;
  customer_email?: string;
  customer_address?: string;
  battery_brand?: string;
  battery_capacity?: string;
  battery_type?: string;
  battery_purchase_date?: string;
  battery_warranty_period?: string;
  inverter_brand?: string;
  inverter_capacity?: string;
  inverter_type?: string;
  completed_date?: string;
  payment_method?: string;
  tax_amount?: string;
  discount_amount?: string;
  spare_battery_id?: number | null;
  spare_battery_model?: string;
  spare_battery_code?: string;
  spare_battery_manufacturer?: string;
  spare_battery_capacity?: string;
  spare_battery_type?: string;
  spare_battery_condition?: string;
  spare_battery_quantity?: number;
  use_spare_battery?: boolean;
  battery_source?: 'original' | 'spare' | 'both' | 'none';
  replacement_battery_details?: {
    id: number;
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
  } | null;
  battery_claim?: string | null;
  battery_statuses_json?: string;
}

interface ServiceDetailModalProps {
  service: ServiceOrder;
  onClose: () => void;
  onEdit: () => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPaymentStatusColor: (status: string) => string;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onEdit,
  getStatusColor,
  getPriorityColor,
  getPaymentStatusColor
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [replacementBatteryDetails, setReplacementBatteryDetails] = useState<any>(null);
  const [loadingReplacement, setLoadingReplacement] = useState(false);

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

  // Fetch replacement battery details if serial exists but model is missing
  useEffect(() => {
    const fetchReplacementBattery = async () => {
      // If we already have replacement_battery_model from props, use it
      if (service.replacement_battery_model) {
        setReplacementBatteryDetails({
          battery_model: service.replacement_battery_model,
          battery_serial: service.replacement_battery_serial,
          brand: service.replacement_battery_brand,
          capacity: service.replacement_battery_capacity,
          battery_type: service.replacement_battery_type,
          voltage: service.replacement_battery_voltage,
          price: service.replacement_battery_price,
          warranty_period: service.replacement_battery_warranty,
          installation_date: service.replacement_installation_date,
          notes: service.replacement_battery_notes
        });
        return;
      }

      // If we have replacement_battery_serial but no model, fetch from API
      if (service.replacement_battery_serial && !service.replacement_battery_model) {
        setLoadingReplacement(true);
        try {
          const API_BASE_URL = "http://localhost/sun_powers/api";
          
          // First try to get by service ID
          const response = await fetch(`${API_BASE_URL}/replacement_battery.php?service_order_id=${service.id}`);
          const data = await response.json();
          
          if (data.success && data.replacement_battery) {
            setReplacementBatteryDetails(data.replacement_battery);
          }
        } catch (error) {
          console.error('Error fetching replacement battery:', error);
        } finally {
          setLoadingReplacement(false);
        }
      }
    };

    fetchReplacementBattery();
  }, [service]);

  const formatCurrency = (amount: string) => {
    if (!amount || amount === '0.00' || amount === '0') return '₹0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00') return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateBalance = () => {
    const final = parseFloat(service.final_cost || '0');
    const deposit = parseFloat(service.deposit_amount || '0');
    return formatCurrency((final - deposit).toString());
  };

  const getWarrantyColor = (status: string) => {
    const colors: Record<string, string> = {
      'in_warranty': '#10b981',
      'extended_warranty': '#f59e0b',
      'out_of_warranty': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Check if there's a spare battery
  const hasSpareBattery = service.spare_battery_id || service.use_spare_battery || service.spare_battery_model;
  
  // Check if there's a replacement battery (using fetched details or props)
  const hasReplacementBattery = !!(service.replacement_battery_serial || 
    (replacementBatteryDetails && replacementBatteryDetails.battery_serial));

  const getOriginalBatteryItems = () => {
    const cleanToken = (value: string) =>
      value
        .replace(/original_battery_ids/gi, '')
        .replace(/original_battery_serials/gi, '')
        .replace(/[{}[\]"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const parseList = (raw: string) =>
      `${raw || ''}`
        .split(',')
        .map(token => token.includes(':') ? token.split(':').slice(1).join(':') : token)
        .map(token => cleanToken(token))
        .filter(Boolean);

    const ids = parseList(service.original_battery_ids || '');
    const models = parseList(service.original_battery_models || service.battery_model || '');
    const serials = parseList(service.original_battery_serials || service.battery_serial || '');

    const count = Math.max(ids.length, models.length, serials.length, 1);
    return Array.from({ length: count }).map((_, index) => {
      const idValue = ids[index] || ids[0] || '';
      const modelValue = models[index] || models[0] || 'N/A';
      return {
        batteryId: idValue ? parseInt(idValue) : null,
        model: idValue && models.length <= 1 ? `${modelValue} (ID: ${idValue})` : modelValue,
        serial: serials[index] || serials[0] || 'N/A'
      };
    });
  };

  const getBatteryStatusMap = () => {
    const byId: Record<number, string> = {};
    const bySerial: Record<string, string> = {};
    const raw = `${service.battery_statuses_json || ''}`.trim();
    if (!raw) return { byId, bySerial };
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return { byId, bySerial };
      parsed.forEach((entry: any) => {
        const bid = parseInt(entry?.battery_id);
        const serial = `${entry?.battery_serial || ''}`.trim().toLowerCase();
        const rawStatus = `${entry?.service_status || ''}`.trim().toLowerCase();
        const status = (!rawStatus || rawStatus === 'null' || rawStatus === 'undefined') ? '' : rawStatus;
        if (!Number.isNaN(bid) && status) {
          byId[bid] = status;
        }
        if (serial && status) {
          bySerial[serial] = status;
        }
      });
    } catch (_err) {
      // Ignore malformed JSON and fallback to overall service status
    }
    return { byId, bySerial };
  };

  const getBatteryClaimMap = () => {
    const byId: Record<number, string> = {};
    const bySerial: Record<string, string> = {};
    const raw = `${service.battery_claims_json || ''}`.trim();
    if (!raw) return { byId, bySerial };
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return { byId, bySerial };
      parsed.forEach((entry: any) => {
        const bid = parseInt(entry?.battery_id);
        const serial = `${entry?.battery_serial || ''}`.trim().toLowerCase();
        const claimRaw = `${entry?.claim_type || ''}`.trim().toLowerCase();
        const claim = ['shop', 'company', 'suntocomp', 'comptosun'].includes(claimRaw) ? claimRaw : '';
        if (!claim) return;
        if (!Number.isNaN(bid)) {
          byId[bid] = claim;
        }
        if (serial) {
          bySerial[serial] = claim;
        }
      });
    } catch (_err) {
      // Ignore malformed JSON and fallback to overall claim
    }
    return { byId, bySerial };
  };

  const getClaimTypeLabel = (claim?: string | null) => {
    const normalized = (claim || '').toLowerCase();
    if (normalized === 'shop') return 'Shop';
    if (normalized === 'company') return 'Company';
    if (normalized === 'suntocomp') return 'Sun To Company';
    if (normalized === 'comptosun') return 'Company To Sun';
    return 'Non Claim';
  };

  const originalBatteryItems = getOriginalBatteryItems();
  const batteryStatusMap = getBatteryStatusMap();
  const batteryClaimMap = getBatteryClaimMap();
  const getBatteryServiceStatus = (item: { batteryId: number | null; serial: string }) => {
    const serialKey = `${item.serial || ''}`.trim().toLowerCase();
    if (item.batteryId && batteryStatusMap.byId[item.batteryId]) {
      return batteryStatusMap.byId[item.batteryId];
    }
    if (serialKey && batteryStatusMap.bySerial[serialKey]) {
      return batteryStatusMap.bySerial[serialKey];
    }
    return service.status || 'pending';
  };
  const getBatteryClaimType = (item: { batteryId: number | null; serial: string }) => {
    const serialKey = `${item.serial || ''}`.trim().toLowerCase();
    let claim = '';
    if (item.batteryId && batteryClaimMap.byId[item.batteryId]) {
      claim = batteryClaimMap.byId[item.batteryId];
    } else if (serialKey && batteryClaimMap.bySerial[serialKey]) {
      claim = batteryClaimMap.bySerial[serialKey];
    } else {
      claim = `${service.battery_claim || ''}`.toLowerCase();
    }
    return getClaimTypeLabel(claim);
  };
  // Check if there's original battery data
  const hasOriginalBattery = originalBatteryItems.length > 0;

  const printReceipt = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const primary = [2, 132, 199] as const;
      const dark = [15, 23, 42] as const;
      const muted = [100, 116, 139] as const;
      const pageWidth = 210;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const receiptNo = `SRV-${service.id.toString().padStart(6, '0')}`;
      const serviceDate = service.service_date ? formatDate(service.service_date) : formatDate(service.created_at);
      const finalAmount = parseFloat(service.final_cost || service.estimated_cost || '0') || 0;
      const estimatedAmount = parseFloat(service.estimated_cost || '0') || 0;
      const depositAmount = parseFloat(service.deposit_amount || '0') || 0;
      const taxAmount = parseFloat(service.tax_amount || '0') || 0;
      const discountAmount = parseFloat(service.discount_amount || '0') || 0;
      const balanceAmount = Math.max(0, finalAmount - depositAmount);

      doc.setFillColor(2, 132, 199);
      doc.rect(0, 0, pageWidth, 38, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(18, 19, 6, 'F');
      doc.setFillColor(2, 132, 199);
      doc.circle(18, 19, 2.7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(21);
      doc.text('SUN POWERS', 28, 15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Battery & Inverter Service Center', 28, 21);
      doc.text('Tirunelveli, Tamil Nadu | +91 9994445237', 28, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('SERVICE RECEIPT', pageWidth - margin, 16, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, pageWidth - margin, 22, { align: 'right' });

      let y = 46;
      doc.setDrawColor(220, 231, 241);
      doc.setFillColor(248, 251, 255);
      doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'FD');

      doc.setTextColor(...muted);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Receipt No', margin + 4, y + 7);
      doc.text('Service Code', margin + 4, y + 15);
      doc.text('Receipt Date', margin + 75, y + 7);
      doc.text('Service Date', margin + 75, y + 15);
      doc.text('Payment Status', margin + 142, y + 7);
      doc.text('Priority', margin + 142, y + 15);

      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'normal');
      doc.text(receiptNo, margin + 35, y + 7);
      doc.text(service.service_code || 'N/A', margin + 35, y + 15);
      doc.text(formatDateTime(new Date().toISOString()), margin + 103, y + 7);
      doc.text(serviceDate, margin + 103, y + 15);
      doc.text((service.payment_status || 'pending').replace(/_/g, ' ').toUpperCase(), margin + 174, y + 7, { align: 'right' });
      doc.text((service.priority || 'normal').toUpperCase(), margin + 174, y + 15, { align: 'right' });

      y += 30;
      const leftColW = 118;
      const rightColW = contentWidth - leftColW - 4;

      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, leftColW, 44, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primary);
      doc.setFontSize(10);
      doc.text('Customer Details', margin + 4, y + 7);
      doc.setFontSize(8.5);
      doc.setTextColor(...muted);
      doc.text('Name', margin + 4, y + 14);
      doc.text('Phone', margin + 4, y + 21);
      doc.text('Email', margin + 4, y + 28);
      doc.text('Address', margin + 4, y + 35);
      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'normal');
      doc.text(service.customer_name || 'N/A', margin + 28, y + 14);
      doc.text(service.customer_phone || 'N/A', margin + 28, y + 21);
      doc.text(service.customer_email || 'Not provided', margin + 28, y + 28);
      const addressLines = doc.splitTextToSize(service.customer_address || 'Not provided', leftColW - 32);
      doc.text(addressLines, margin + 28, y + 35);

      doc.roundedRect(margin + leftColW + 4, y, rightColW, 44, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primary);
      doc.setFontSize(10);
      doc.text('Service Snapshot', margin + leftColW + 8, y + 7);
      doc.setTextColor(...muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Status', margin + leftColW + 8, y + 16);
      doc.text('Warranty', margin + leftColW + 8, y + 24);
      doc.text('AMC', margin + leftColW + 8, y + 32);
      doc.text('Technician', margin + leftColW + 8, y + 40);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...dark);
      doc.text((service.status || 'pending').replace(/_/g, ' ').toUpperCase(), margin + leftColW + rightColW - 4, y + 16, { align: 'right' });
      doc.text(service.warranty_status || 'N/A', margin + leftColW + rightColW - 4, y + 24, { align: 'right' });
      doc.text(service.amc_status || 'N/A', margin + leftColW + rightColW - 4, y + 32, { align: 'right' });
      doc.text(service.service_staff_name || 'Not assigned', margin + leftColW + rightColW - 4, y + 40, { align: 'right' });

      y += 52;
      autoTable(doc, {
        startY: y,
        theme: 'grid',
        head: [['Equipment Type', 'Model', 'Serial Number', 'Service Status']],
        body: [
          ...originalBatteryItems.map((item) => {
            const status = getBatteryServiceStatus(item);
            return [
              'Battery',
              item.model || 'N/A',
              item.serial || 'N/A',
              status.replace(/_/g, ' ').toUpperCase()
            ];
          }),
          ['Inverter', service.inverter_model || 'N/A', service.inverter_serial || 'N/A', 'N/A']
        ],
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [15, 23, 42], lineColor: [226, 232, 240], lineWidth: 0.1 },
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 58 }, 2: { cellWidth: 54 }, 3: { cellWidth: 34 } }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primary);
      doc.setFontSize(10);
      doc.text('Issue Description', margin, y);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y + 3, contentWidth, 24, 2, 2, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...dark);
      doc.setFontSize(8.5);
      const issueLines = doc.splitTextToSize(service.issue_description || 'No issue description provided.', contentWidth - 8);
      doc.text(issueLines, margin + 4, y + 9);

      y += 34;
      autoTable(doc, {
        startY: y,
        theme: 'plain',
        body: [
          ['Estimated Cost', formatCurrency(estimatedAmount.toString())],
          ['Deposit Received', formatCurrency(depositAmount.toString())],
          ['Tax', formatCurrency(taxAmount.toString())],
          ['Discount', formatCurrency(discountAmount.toString())],
          ['Final Amount', formatCurrency(finalAmount.toString())],
          ['Balance Due', formatCurrency(balanceAmount.toString())]
        ],
        margin: { left: pageWidth - 86, right: margin },
        styles: { fontSize: 9, cellPadding: 2, textColor: [15, 23, 42] },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left', cellWidth: 45 },
          1: { halign: 'right', cellWidth: 27 }
        },
        didParseCell: (hookData) => {
          if (hookData.row.index >= 4) {
            hookData.cell.styles.fillColor = [240, 249, 255];
          }
        }
      });

      const totalsBottom = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(8.5);
      doc.setTextColor(...muted);
      doc.text(`Payment Method: ${service.payment_method || 'Not specified'}`, margin, totalsBottom - 12);
      doc.text(`Claim Type: ${getClaimTypeLabel(service.battery_claim)}`, margin, totalsBottom - 5);

      if (service.notes) {
        const notesY = Math.max(totalsBottom + 4, y + 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primary);
        doc.text('Service Notes', margin, notesY);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, notesY + 3, contentWidth, 15, 2, 2, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dark);
        doc.setFontSize(8.2);
        const notesLines = doc.splitTextToSize(service.notes, contentWidth - 8);
        doc.text(notesLines, margin + 4, notesY + 8);
      }

      doc.setDrawColor(2, 132, 199);
      doc.line(margin, 280, pageWidth - margin, 280);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('This is a computer generated receipt. No signature required.', pageWidth / 2, 285, { align: 'center' });
      doc.text('Thank you for choosing Sun Powers.', pageWidth / 2, 289, { align: 'center' });

      doc.save(`service_receipt_${service.service_code}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Receipt Generation Error:', error);
      alert('Error generating service receipt. Please try again.');
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(2, 6, 23, 0.64)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
      }}
    >
      <motion.div 
        className="modal-content order-detail-modal"
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 50 : 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 24%)',
          borderRadius: isMobile ? '22px 22px 0 0' : '18px',
          width: isMobile ? '100%' : '90%',
          maxWidth: isMobile ? '100%' : '1080px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 28px 54px rgba(2, 6, 23, 0.45)',
          margin: isMobile ? 0 : '0 auto'
        }}
      >
        <div className="modal-header" style={{
          padding: isMobile ? '16px 20px' : '20px 24px',
          borderBottom: '1px solid #bfdbfe',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(120deg, #0f766e 0%, #0284c7 55%, #1d4ed8 100%)'
        }}>
          <div className="modal-title">
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: '#f8fafc' }}>
              Service Order Details
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: isMobile ? '12px' : '14px', color: '#dbeafe' }}>
              Service Code: {service.service_code}
            </p>
            <div className="modal-subtitle" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ color: '#e0f2fe', fontSize: isMobile ? '12px' : '13px', fontWeight: 600 }}>
                Selected Original Batteries: {originalBatteryItems.length}
              </span>
            </div>
          </div>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: isMobile ? '20px' : '24px',
              cursor: 'pointer',
              color: '#e0f2fe',
              padding: isMobile ? '4px' : '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={isMobile ? 20 : 24} />
          </motion.button>
        </div>
        
        <div className="order-detail-content" style={{
          padding: isMobile ? '16px' : '24px',
          overflowY: 'auto',
          maxHeight: isMobile ? 'calc(90vh - 70px)' : 'calc(90vh - 140px)',
          WebkitOverflowScrolling: 'touch'
        }}>
          {loadingReplacement && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner" style={{
                width: '30px',
                height: '30px',
                border: '3px solid #f3f3f3',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              <p>Loading replacement battery details...</p>
            </div>
          )}

          <div className="order-detail-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'),
            gap: isMobile ? '16px' : '20px'
          }}>
            {/* Customer Information */}
            <div className="detail-section" style={{
              background: '#ffffff',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #dbeafe',
              boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiUser color="#10b981" size={isMobile ? 16 : 18} /> Customer Information
              </h3>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Name:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_name}</span>
              </div>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Phone:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_phone}</span>
              </div>
              {service.customer_email && (
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Email:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_email}</span>
                </div>
              )}
              {service.customer_address && (
                <div className="detail-item">
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Address:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.customer_address}</span>
                </div>
              )}
            </div>
            
            {/* Service Staff */}
            {service.service_staff_name && (
              <div className="detail-section" style={{
                background: '#f0f9ff',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiUsers color="#10b981" size={isMobile ? 16 : 18} /> Service Staff Details
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Name:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 600, color: '#0369a1', fontSize: isMobile ? '13px' : '14px' }}>{service.service_staff_name}</span>
                </div>
                {service.service_staff_id && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Staff ID:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.service_staff_id}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selected Original Batteries */}
            {hasOriginalBattery && (
              <div className="detail-section" style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                padding: isMobile ? '14px' : '18px',
                borderRadius: '14px',
                border: '1px solid #93c5fd',
                boxShadow: '0 14px 28px rgba(37, 99, 235, 0.12)',
                gridColumn: isMobile ? 'span 1' : 'span 2'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBattery color="#2563eb" size={isMobile ? 16 : 18} /> Selected Original Batteries ({originalBatteryItems.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                  gap: '10px'
                }}>
                {originalBatteryItems.map((item, index) => (
                  <div key={`original-battery-${index}`} style={{ marginBottom: '0', padding: '10px 12px', border: '1px solid #bfdbfe', borderRadius: '10px', background: '#ffffff', boxShadow: '0 2px 10px rgba(15,23,42,0.05)' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {index + 1}. {item.model}
                    </div>
                    <div style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>
                      {item.serial}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: '#0369a1' }}>
                      Status: {getBatteryServiceStatus(item).replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ marginTop: '2px', fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: '#7c3aed' }}>
                      Claim Type: {getBatteryClaimType(item)}
                    </div>
                  </div>
                ))}
                </div>
                {originalBatteryItems.length <= 1 && service.battery_brand && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_brand}</span>
                  </div>
                )}
                {originalBatteryItems.length <= 1 && service.battery_capacity && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_capacity}</span>
                  </div>
                )}
                {originalBatteryItems.length <= 1 && service.battery_type && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.battery_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selected from Spare Inventory */}
            {hasSpareBattery && (
              <div className="detail-section" style={{
                background: '#fef3c7',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #fde68a',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiPackage color="#d97706" size={isMobile ? 16 : 18} /> Selected from Spare Inventory
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_model || 'N/A'}</span>
                </div>
                {service.spare_battery_code && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Code:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_code}</span>
                  </div>
                )}
                {service.spare_battery_manufacturer && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Manufacturer:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_manufacturer}</span>
                  </div>
                )}
                {service.spare_battery_capacity && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_capacity}</span>
                  </div>
                )}
                {service.spare_battery_type && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                )}
                {service.spare_battery_condition && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Condition:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.spare_battery_condition}</span>
                  </div>
                )}
                {service.spare_battery_quantity !== undefined && (
                  <div style={{ marginTop: '10px', padding: '6px 10px', background: '#05966920', borderRadius: '6px', border: '1px solid #05966940' }}>
                    <span style={{ color: '#059669', fontSize: isMobile ? '12px' : '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiCheckCircle size={14} /> Quantity left in stock: {service.spare_battery_quantity}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Replacement Battery - Fixed to show all data */}
            {hasReplacementBattery && !hasSpareBattery && (
              <div className="detail-section" style={{
                background: '#f1f5f9',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#4c1d95',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBatteryCharging color="#7c3aed" size={isMobile ? 16 : 18} /> Replacement Battery
                </h3>
                
                {/* Model - Using fetched details or props */}
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {replacementBatteryDetails?.battery_model || service.replacement_battery_model || 'N/A'}
                  </span>
                </div>
                
                {/* Serial Number */}
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Serial:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {replacementBatteryDetails?.battery_serial || service.replacement_battery_serial || 'N/A'}
                  </span>
                </div>
                
                {/* Brand */}
                {(replacementBatteryDetails?.brand || service.replacement_battery_brand) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails?.brand || service.replacement_battery_brand}
                    </span>
                  </div>
                )}
                
                {/* Capacity */}
                {(replacementBatteryDetails?.capacity || service.replacement_battery_capacity) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Capacity:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails?.capacity || service.replacement_battery_capacity}
                    </span>
                  </div>
                )}
                
                {/* Voltage */}
                {replacementBatteryDetails?.voltage && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Voltage:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails.voltage}
                    </span>
                  </div>
                )}
                
                {/* Battery Type */}
                {(replacementBatteryDetails?.battery_type || service.replacement_battery_type) && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Type:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {(replacementBatteryDetails?.battery_type || service.replacement_battery_type || '').replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Price */}
                {replacementBatteryDetails?.price && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Price:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {formatCurrency(replacementBatteryDetails.price.toString())}
                    </span>
                  </div>
                )}
                
                {/* Warranty Period */}
                {replacementBatteryDetails?.warranty_period && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Warranty:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {replacementBatteryDetails.warranty_period}
                    </span>
                  </div>
                )}
                
                {/* Installation Date */}
                {replacementBatteryDetails?.installation_date && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Installation Date:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                      {formatDate(replacementBatteryDetails.installation_date)}
                    </span>
                  </div>
                )}
                
                {/* Notes */}
                {replacementBatteryDetails?.notes && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px', display: 'block', marginBottom: '4px' }}>Notes:</span>
                    <span className="detail-value" style={{ 
                      background: 'white',
                      padding: isMobile ? '8px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'block',
                      color: '#0f172a',
                      fontSize: isMobile ? '12px' : '13px'
                    }}>
                      {replacementBatteryDetails.notes}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Inverter Information */}
            {service.inverter_model && (
              <div className="detail-section" style={{
                background: '#f8fafc',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                gridColumn: isMobile ? 'span 1' : (isTablet ? 'span 1' : 'span 1')
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiPower color="#10b981" size={isMobile ? 16 : 18} /> Inverter Information
                </h3>
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Model:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_model}</span>
                </div>
                {service.inverter_serial && (
                  <div className="detail-item" style={{ marginBottom: '8px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Serial:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_serial}</span>
                  </div>
                )}
                {service.inverter_brand && (
                  <div className="detail-item">
                    <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Brand:</span>
                    <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.inverter_brand}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Service Details - Full Width */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              gridColumn: isMobile ? 'span 1' : 'span 2'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiInfo color="#10b981" size={isMobile ? 16 : 18} /> Service Details
              </h3>
              <div className="detail-item" style={{ marginBottom: '12px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px', display: 'block', marginBottom: '4px' }}>Issue Description:</span>
                <span className="detail-value" style={{ 
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'block',
                  color: '#0f172a',
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {service.issue_description || 'No description provided'}
                </span>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: isMobile ? '8px' : '12px' 
              }}>
                <div>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Warranty Status:</span>
                  <span className="detail-value" style={{ 
                    marginLeft: '8px', 
                    fontWeight: 500,
                    color: getWarrantyColor(service.warranty_status),
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    {service.warranty_status?.replace(/_/g, ' ').toUpperCase() || 'OUT OF WARRANTY'}
                  </span>
                </div>
                <div>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>AMC Status:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {service.amc_status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Claim Type:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>
                    {getClaimTypeLabel(service.battery_claim)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Financial Details - Full Width */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              gridColumn: isMobile ? 'span 1' : 'span 2'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiDollarSign color="#10b981" size={isMobile ? 16 : 18} /> Financial Details
              </h3>
              <div className="financial-details" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
                gap: isMobile ? '10px' : '16px'
              }}>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Estimated Cost</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(service.estimated_cost)}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Final Cost</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#10b981' }}>{formatCurrency(service.final_cost)}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Deposit</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#3b82f6' }}>{formatCurrency(service.deposit_amount || '0')}</span>
                </div>
                <div className="financial-item" style={{
                  background: 'white',
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <span className="financial-label" style={{ display: 'block', color: '#64748b', fontSize: isMobile ? '10px' : '12px', marginBottom: '4px' }}>Balance</span>
                  <span className="financial-value" style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: '#ef4444' }}>{calculateBalance()}</span>
                </div>
              </div>
              {service.payment_method && (
                <div style={{ marginTop: '12px', padding: isMobile ? '6px 10px' : '8px 12px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Payment Method:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{service.payment_method}</span>
                </div>
              )}
            </div>
            
            {/* Dates */}
            <div className="detail-section" style={{
              background: '#f8fafc',
              padding: isMobile ? '14px' : '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '15px' : '16px', 
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiCalendar color="#10b981" size={isMobile ? 16 : 18} /> Dates
              </h3>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Created:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDateTime(service.created_at)}</span>
              </div>
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Est. Completion:</span>
                <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDate(service.estimated_completion_date)}</span>
              </div>
              {service.completed_date && (
                <div className="detail-item">
                  <span className="detail-label" style={{ color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Completed:</span>
                  <span className="detail-value" style={{ marginLeft: '8px', fontWeight: 500, color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{formatDate(service.completed_date)}</span>
                </div>
              )}
            </div>
            
            {/* Additional Notes */}
            {service.notes && (
              <div className="detail-section" style={{
                background: '#f8fafc',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                gridColumn: isMobile ? 'span 1' : 'span 2'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiFileText color="#10b981" size={isMobile ? 16 : 18} /> Additional Notes
                </h3>
                <div className="detail-item full-width">
                  <span className="detail-value" style={{
                    background: 'white',
                    padding: isMobile ? '10px' : '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'block',
                    color: '#0f172a',
                    whiteSpace: 'pre-line',
                    fontSize: isMobile ? '13px' : '14px'
                  }}>{service.notes}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="order-detail-actions" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'flex-end',
            gap: isMobile ? '10px' : '12px',
            marginTop: isMobile ? '20px' : '24px',
            paddingTop: '20px',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <motion.button 
              className="btn outline"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Close
            </motion.button>
            <motion.button 
              className="btn primary"
              onClick={onEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(120deg, #0f766e 0%, #0284c7 100%)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto',
                boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)'
              }}
            >
              <FiEdit size={isMobile ? 16 : 18} /> Edit
            </motion.button>
            <motion.button 
              className="btn secondary"
              onClick={printReceipt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(120deg, #1d4ed8 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto',
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FiPrinter size={isMobile ? 16 : 18} /> Print
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceDetailModal;

