import { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { useViewServiceModalStore } from '../store/createservice';
import { useAuthStore } from '../store/authentication';
import '../Styles/servicemodal.css';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const ViewServiceModal = () => {
    const { isOpen, selectedService, closeViewServiceModal } = useViewServiceModalStore();
    const { token, isAuthenticated } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canModerate = isAuthenticated && !!token && !!selectedService?.id;

    const handleApprove = async (approved: boolean) => {
        if (!canModerate || !selectedService?.id) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const url = `${DEFAULT_API_BASE}/admin/services/${selectedService.id}/approve`;
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    approved,
                    rejectionReason: approved ? null : 'Rejected via admin CMS',
                }),
            });

            if (!response.ok) {
                let message = 'Failed to update service approval status';
                try {
                    const data = await response.json();
                    message = data.message || data.error || message;
                } catch {
                    message = response.statusText || message;
                }
                throw new Error(message);
            }

            closeViewServiceModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update service approval status');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !selectedService) return null;

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
                    {error && (
                        <div className="error-message" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
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

                    {/* Approval Actions */}
                    {canModerate && (
                        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={closeViewServiceModal}
                                disabled={isSubmitting}
                            >
                                Close
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                                    onClick={() => handleApprove(false)}
                                    disabled={isSubmitting}
                                >
                                    <XCircle style={{ marginRight: 4 }} size={16} />
                                    {isSubmitting ? 'Rejecting…' : 'Reject Service'}
                                </button>
                                <button
                                    type="button"
                                    className="submit-button"
                                    onClick={() => handleApprove(true)}
                                    disabled={isSubmitting}
                                >
                                    <CheckCircle2 style={{ marginRight: 4 }} size={16} />
                                    {isSubmitting ? 'Approving…' : 'Approve Service'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewServiceModal;