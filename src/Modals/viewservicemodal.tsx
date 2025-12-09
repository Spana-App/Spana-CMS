import { X } from 'lucide-react';
import { useViewServiceModalStore } from '../store/createservice';
import '../Styles/servicemodal.css';

const ViewServiceModal = () => {
    const { isOpen, selectedService, closeViewServiceModal } = useViewServiceModalStore();

    if (!isOpen) return null;

    if (!selectedService) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={closeViewServiceModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">View Service</h2>
                    <button className="modal-close-button" onClick={closeViewServiceModal}>
                        <X className="close-icon" />
                    </button>
                </div>
                <div className="modal-form">
                    {/* Service Image */}
                    {selectedService.mediaUrl && (
                        <div className="form-group">
                            <div className="image-preview" style={{ marginBottom: '1.5rem' }}>
                                <img 
                                    src={selectedService.mediaUrl} 
                                    alt={selectedService.title}
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.5rem' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Service Title */}
                    <div className="form-group">
                        <label className="form-label">Service Title</label>
                        <div className="form-input" style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}>
                            {selectedService.title}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <div className="form-textarea" style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed', minHeight: '100px' }}>
                            {selectedService.description}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">Price (Rands)</label>
                        <div className="form-input" style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}>
                            R{selectedService.price.toFixed(2)}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <div>
                            <span className={`status-badge ${selectedService.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}`}>
                                {selectedService.status}
                            </span>
                        </div>
                    </div>

                    {/* Created/Updated Dates */}
                    {(selectedService.createdAt || selectedService.updatedAt) && (
                        <div className="form-group">
                            {selectedService.createdAt && (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                                    Created: {new Date(selectedService.createdAt).toLocaleDateString()}
                                </p>
                            )}
                            {selectedService.updatedAt && (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                                    Updated: {new Date(selectedService.updatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={closeViewServiceModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewServiceModal;