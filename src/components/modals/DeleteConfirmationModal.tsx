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

    return (
        <div className="modal-overlay">
            <div className="modal-container delete-modal">
                <div className="modal-header">
                    <h2>
                        <i className="fas fa-exclamation-triangle"></i>
                        Confirm Deletion
                    </h2>
                    <button 
                        className="modal-close-btn" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="delete-warning">
                        <div className="warning-icon">
                            <i className="fas fa-trash-alt"></i>
                        </div>
                        <p>
                            Are you sure you want to delete <strong>{getItemDisplayName()}</strong>?
                            {itemId && <span className="item-id"> (ID: {itemId})</span>}
                        </p>
                        <p className="warning-text">
                            <i className="fas fa-exclamation-circle"></i>
                            This action cannot be undone. All data associated with this item will be permanently deleted.
                        </p>
                        
                        {loading && (
                            <div className="delete-loading">
                                <div className="spinner-small"></div>
                                <span>Deleting item...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="modal-btn secondary-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={onConfirm}
                        disabled={loading}
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