import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import '../Styles/assignservicesmodal.css';
import type { User } from '../store/users';
import { useServiceModalStore } from '../store/createservice';
import { useServiceAssignmentStore } from '../store/serviceassignment';

interface AssignServicesModalProps {
  provider: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignServicesModal({ provider, isOpen, onClose }: AssignServicesModalProps) {
  const [assignedServiceIds, setAssignedServiceIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { services: allServices, fetchServices } = useServiceModalStore();
  const { assignServices, fetchProviderServices, isLoading: assignLoading, error: assignError, clearError: clearAssignError } = useServiceAssignmentStore();

  // Prefer service provider record id (for /admin/providers/:id), fallback to user id
  const providerId = provider?.serviceProvider?.id ?? provider?.id ?? provider?.serviceProvider?.userId ?? '';
  const providerName = [provider?.firstName, provider?.lastName].filter(Boolean).join(' ') || provider?.email || 'Provider';

  const loadData = useCallback(async () => {
    if (!providerId || !isOpen) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!allServices.length) await fetchServices();
      const assigned = await fetchProviderServices(providerId);
      const assignedSet = new Set((assigned ?? []).map((s) => s.id));
      setAssignedServiceIds(assignedSet);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [providerId, isOpen, allServices.length, fetchServices, fetchProviderServices]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (assignError) setError(assignError);
  }, [assignError]);

  const toggleService = (serviceId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const selectAll = () => {
    const toSelect = allServices.filter((s) => !assignedServiceIds.has(s.id)).map((s) => s.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      toSelect.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      onClose();
      return;
    }
    setSubmitting(true);
    clearAssignError();
    setError(null);
    try {
      await assignServices(providerId, Array.from(selectedIds));
      await loadData();
      toast.success(`Successfully assigned ${selectedIds.size} service${selectedIds.size === 1 ? '' : 's'} to ${providerName}.`);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign services.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="assign-services-modal-overlay" onClick={handleOverlayClick}>
      <div className="assign-services-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">Assign services</h2>
            <p className="modal-subtitle">{providerName}</p>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Close">
            <X className="modal-close-icon" />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="services-section">
            {!providerId ? (
              <div className="empty-state">Unable to identify provider. This user may not be a service provider.</div>
            ) : loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading services…</span>
              </div>
            ) : allServices.length === 0 ? (
              <div className="empty-state">No services available. Create services first, then assign them here.</div>
            ) : (
              <>
                <div className="services-header">
                  <span className="services-label">Services</span>
                  {allServices.some((s) => !assignedServiceIds.has(s.id)) && (
                    <button type="button" className="select-all-button" onClick={selectAll}>
                      Select all unassigned
                    </button>
                  )}
                </div>
                <div className="services-list">
                  {allServices.map((service) => {
                    const isAssigned = assignedServiceIds.has(service.id);
                    const isSelected = selectedIds.has(service.id);
                    const isDisabled = isAssigned;
                    return (
                      <label
                        key={service.id}
                        className={`service-item ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="service-checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && toggleService(service.id)}
                          disabled={isDisabled}
                        />
                        <div className="service-content">
                          <div className="service-info">
                            <span className="service-name">{service.title}</span>
                            <span
                              className={`service-badge ${
                                isAssigned ? 'assigned' : isSelected ? 'new' : 'keeping'
                              }`}
                            >
                              {isAssigned ? 'Assigned' : isSelected ? 'To assign' : '—'}
                            </span>
                          </div>
                          <div className="service-details">
                            <span className="service-price">R{service.price.toFixed(2)}</span>
                            {service.description && (
                              <span className="service-description">{service.description}</span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="service-check-icon" />}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!providerId || submitting || selectedIds.size === 0 || assignLoading}
            >
              {submitting || assignLoading ? (
                <>
                  <Loader2 className="button-spinner" />
                  Assigning…
                </>
              ) : (
                `Assign ${selectedIds.size} service${selectedIds.size === 1 ? '' : 's'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
