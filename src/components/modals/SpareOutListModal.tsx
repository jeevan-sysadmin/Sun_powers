import React from 'react';
import { motion } from 'framer-motion';
import { 
    FiX, 
    FiUser, 
    FiPhone, 
    FiHash, 
    FiCalendar,
    FiBattery,
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiDownload,
    FiPrinter
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/SpareOutListModal.css';

interface SpareUsage {
    id: string;
    service_order_id: string;
    spare_battery_id: string;
    quantity_used: string;
    used_at: string;
    returned_at: string | null;
    status: string;
    notes: string | null;
    // Joined fields
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

interface SpareOutListModalProps {
    usages: SpareUsage[];
    onClose: () => void;
    loading: boolean;
    getStatusColor: (status: string) => string;
}

const SpareOutListModal: React.FC<SpareOutListModalProps> = ({
    usages,
    onClose,
    loading,
    getStatusColor
}) => {
    const getStatusIcon = (status: string) => {
        switch(status?.toLowerCase()) {
            case 'used':
                return <FiCheckCircle />;
            case 'returned':
                return <FiPackage />;
            default:
                return <FiClock />;
        }
    };

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

    const exportToCSV = () => {
        try {
            if (usages.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = [
                'Service Code', 'Customer Name', 'Phone', 'Battery Code',
                'Battery Model', 'Battery Type', 'Manufacturer', 'Quantity Used',
                'Status', 'Used Date', 'Returned Date', 'Staff Name', 'Issue Description', 'Notes'
            ];
            
            const rows = usages.map(usage => [
                usage.service_code || 'N/A',
                usage.customer_name || 'N/A',
                usage.customer_phone || 'N/A',
                usage.battery_code || 'N/A',
                usage.battery_model || 'N/A',
                usage.battery_type || 'N/A',
                usage.manufacturer || 'N/A',
                usage.quantity_used || 'N/A',
                usage.status || 'N/A',
                formatDateTime(usage.used_at),
                usage.returned_at ? formatDateTime(usage.returned_at) : 'Not Returned',
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

    const exportToPDF = () => {
        try {
            if (usages.length === 0) {
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
            doc.text('SUN POWERS - SPARE BATTERY OUT REPORT', 148.5, 13, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);
            doc.text(`Total Records: ${usages.length}`, 14, 35);

            const headers = [
                ['S.No', 'Service Code', 'Customer', 'Phone', 'Battery Code', 'Battery Model', 'Qty', 'Status', 'Used Date', 'Staff']
            ];
            
            const tableData = usages.map((usage, index) => [
                (index + 1).toString(),
                usage.service_code || 'N/A',
                usage.customer_name || 'N/A',
                usage.customer_phone || 'N/A',
                usage.battery_code || 'N/A',
                usage.battery_model || 'N/A',
                usage.quantity_used || 'N/A',
                usage.status || 'N/A',
                formatDate(usage.used_at),
                usage.service_staff_name || 'N/A'
            ]);

            autoTable(doc, {
                head: headers,
                body: tableData,
                startY: 40,
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
                    1: { cellWidth: 30 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 30 },
                    6: { cellWidth: 15, halign: 'center' },
                    7: { cellWidth: 20 },
                    8: { cellWidth: 25 },
                    9: { cellWidth: 30 }
                },
                margin: { top: 40, left: 10, right: 10 },
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

    const handlePrint = () => {
        if (usages.length === 0) {
            alert('No data to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Sun Powers - Spare Battery Out Report</title>
                        <style>
                            * { box-sizing: border-box; margin: 0; padding: 0; }
                            body { font-family: Arial, sans-serif; margin: 20px; background: #ffffff; color: #000000; }
                            .print-container { max-width: 1400px; margin: 0 auto; }
                            h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
                            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                            .stats { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0; font-weight: 500; color: #166534; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                            th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; border: 1px solid #059669; }
                            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: middle; }
                            tr:nth-child(even) { background: #f8fafc; }
                            .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block; color: white; }
                            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
                            .no-print { text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
                            .no-print button { padding: 10px 25px; margin: 0 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
                            .print-btn { background: #10b981; color: white; }
                            .close-btn { background: #64748b; color: white; }
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
                            <h1>🔋 Sun Powers - Spare Battery Out Report</h1>
                            
                            <div class="header-info">
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                                <div><strong>Generated By:</strong> System</div>
                            </div>
                            
                            <div class="stats">
                                <div><strong>📊 Report Summary:</strong> 
                                    Total Spare Usages: ${usages.length}
                                </div>
                            </div>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Service Code</th>
                                        <th>Customer Name</th>
                                        <th>Phone</th>
                                        <th>Battery Code</th>
                                        <th>Battery Model</th>
                                        <th>Qty</th>
                                        <th>Status</th>
                                        <th>Used Date</th>
                                        <th>Staff</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${usages.map((usage, index) => {
                                        const statusColor = getStatusColor(usage.status);
                                        return `
                                            <tr>
                                                <td style="text-align: center;">${index + 1}</td>
                                                <td><strong>${usage.service_code || 'N/A'}</strong></td>
                                                <td>${usage.customer_name || 'N/A'}</td>
                                                <td>${usage.customer_phone || 'N/A'}</td>
                                                <td>${usage.battery_code || 'N/A'}</td>
                                                <td>${usage.battery_model || 'N/A'}</td>
                                                <td style="text-align: center;">${usage.quantity_used || 'N/A'}</td>
                                                <td>
                                                    <span class="status-badge" style="background: ${statusColor};">
                                                        ${usage.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>${formatDate(usage.used_at)}</td>
                                                <td>${usage.service_staff_name || 'N/A'}</td>
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

    // Calculate statistics
    const totalQuantity = usages.reduce((sum, u) => sum + (parseInt(u.quantity_used || '0')), 0);
    const uniqueSpares = new Set(usages.map(u => u.spare_battery_id)).size;
    const uniqueServices = new Set(usages.map(u => u.service_order_id)).size;
    const statusCounts = usages.reduce((acc: Record<string, number>, u) => {
        acc[u.status] = (acc[u.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                className="spare-out-list-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>
                        <FiPackage className="header-icon" />
                        Spare Battery Out List
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
                            <FiPackage />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{usages.length}</div>
                            <div className="stat-label">Total Usages</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                            <FiBattery />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{uniqueSpares}</div>
                            <div className="stat-label">Unique Spares</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                            <FiHash />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{totalQuantity}</div>
                            <div className="stat-label">Total Quantity Used</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
                            <FiUser />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{uniqueServices}</div>
                            <div className="stat-label">Services</div>
                        </div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="export-buttons">
                    <button 
                        className="export-btn csv"
                        onClick={exportToCSV}
                        disabled={usages.length === 0}
                    >
                        <FiDownload /> CSV
                    </button>
                    <button 
                        className="export-btn pdf"
                        onClick={exportToPDF}
                        disabled={usages.length === 0}
                    >
                        <FiDownload /> PDF
                    </button>
                    <button 
                        className="export-btn print"
                        onClick={handlePrint}
                        disabled={usages.length === 0}
                    >
                        <FiPrinter /> Print
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading spare out list...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && usages.length === 0 && (
                    <div className="empty-state">
                        <FiPackage className="empty-icon" />
                        <h3>No Spare Batteries Used</h3>
                        <p>No spare battery usage records have been found.</p>
                    </div>
                )}

                {/* Usages Table */}
                {!loading && usages.length > 0 && (
                    <div className="table-container">
                        <table className="services-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Service Code</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Battery Code</th>
                                    <th>Battery Model</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                    <th>Used Date</th>
                                    <th>Staff</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.map((usage, index) => (
                                    <motion.tr 
                                        key={usage.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ backgroundColor: '#f0f9ff' }}
                                    >
                                        <td className="text-center">{index + 1}</td>
                                        <td>
                                            <span className="service-code">
                                                <FiHash className="inline-icon" />
                                                {usage.service_code || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="customer-info">
                                                <FiUser className="inline-icon" />
                                                {usage.customer_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="phone-info">
                                                <FiPhone className="inline-icon" />
                                                {usage.customer_phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="battery-code">
                                                <FiBattery className="inline-icon" />
                                                {usage.battery_code || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{usage.battery_model || 'N/A'}</td>
                                        <td className="text-center">
                                            <span className="quantity-badge">
                                                {usage.quantity_used || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(usage.status) }}
                                            >
                                                {getStatusIcon(usage.status)}
                                                <span>{usage.status || 'N/A'}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="date-info">
                                                <FiCalendar className="inline-icon" />
                                                {formatDateTime(usage.used_at)}
                                            </div>
                                        </td>
                                        <td>{usage.service_staff_name || 'N/A'}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer with Summary */}
                {!loading && usages.length > 0 && (
                    <div className="modal-footer">
                        <div className="summary-info">
                            <span className="total-count">
                                Total: {usages.length} usage{usages.length !== 1 ? 's' : ''}
                            </span>
                            <span className="total-quantity">
                                Total Quantity Used: {totalQuantity}
                            </span>
                        </div>
                        <div className="status-summary">
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <span key={status} className="status-item">
                                    <span className="status-dot" style={{ backgroundColor: getStatusColor(status) }}></span>
                                    {status}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SpareOutListModal;