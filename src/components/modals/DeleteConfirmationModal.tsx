import React from 'react';
import '../css/Spare.css';

interface DeleteConfirmationModalProps {
    itemType: string;
    itemId: string | number;
    itemName?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    itemType, 
    itemId,
    itemName,
    onClose, 
    onConfirm,
    loading = false
}) => {
    const getItemDisplayName = () => {
        if (itemName) return itemName;
        
        switch(itemType) {
            case 'customer': return 'Customer';
            case 'service': return 'Service Order';
            case 'battery': return 'Battery';
            case 'delivery': return 'Delivery';
            case 'replacement': return 'Replacement Battery';
            case 'spare': return 'Spare Battery';
            case 'shop_claim': return 'Shop Claim';
            case 'sun_to_comp': return 'Sun to Company Battery';
            case 'comptosun': return 'Company to Sun Battery';
            case 'company_claim': return 'Company Claim';
            default: return 'Item';
        }
    };
    const displayName = getItemDisplayName();

    return (
        <div
            className="modal-overlay"
            style={{
                backdropFilter: 'blur(4px)',
                background: 'rgba(15, 23, 42, 0.48)'
            }}
        >
            <div
                className="modal-container delete-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                style={{
                    width: 'min(520px, 94vw)',
                    borderRadius: '18px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    boxShadow: '0 24px 70px rgba(2, 6, 23, 0.34)',
                    background: '#ffffff',
                    overflow: 'hidden'
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 65%)',
                        borderBottom: '1px solid #ffe4e6'
                    }}
                >
                    <h2
                        id="delete-modal-title"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            margin: 0,
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: '#991b1b'
                        }}
                    >
                        <i className="fas fa-triangle-exclamation"></i>
                        Delete Confirmation
                    </h2>
                    <button 
                        className="modal-close-btn" 
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close delete confirmation"
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#64748b',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                    <div className="delete-warning" style={{ display: 'grid', gap: '14px' }}>
                        <div
                            className="warning-icon"
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fee2e2',
                                color: '#dc2626',
                                fontSize: '1.25rem'
                            }}
                        >
                            <i className="fas fa-trash-alt"></i>
                        </div>

                        <div>
                            <p style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '0.98rem' }}>
                                Are you sure you want to permanently delete this item?
                            </p>
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #fecaca',
                                    background: '#fff5f5'
                                }}
                            >
                                <div style={{ fontSize: '0.8rem', color: '#9f1239', marginBottom: '4px' }}>
                                    Selected Item
                                </div>
                                <div style={{ fontWeight: 700, color: '#7f1d1d', wordBreak: 'break-word' }}>
                                    {displayName}
                                    {itemId ? ` (ID: ${itemId})` : ''}
                                </div>
                            </div>
                        </div>

                        <p
                            className="warning-text"
                            style={{
                                margin: 0,
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: '#fef2f2',
                                border: '1px dashed #fca5a5',
                                color: '#991b1b',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                            }}
                        >
                            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                            This action cannot be undone. All associated records will be removed permanently.
                        </p>
                        
                        {loading && (
                            <div
                                className="delete-loading"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#475569',
                                    fontSize: '0.92rem'
                                }}
                            >
                                <div className="spinner-small"></div>
                                <span>Deleting item...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="modal-footer"
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        padding: '16px 20px 20px',
                        borderTop: '1px solid #f1f5f9',
                        background: '#fcfcfd'
                    }}
                >
                    <button
                        className="modal-btn secondary-btn"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            minWidth: '110px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            minWidth: '130px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #dc2626',
                            background: loading ? '#f87171' : '#dc2626',
                            color: '#ffffff',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small white"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash-alt"></i> Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
