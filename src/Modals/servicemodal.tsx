import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../Styles/servicemodal.css';
import { useServiceModalStore, type ServiceFormData } from '../store/createservice';

interface AddServiceModalProps {
  onSubmit: (serviceData: ServiceFormData) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  onSubmit,
}) => {
  const { isOpen, closeModal, isLoading, error, clearError } = useServiceModalStore();

  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price: 0,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      clearError();
      useServiceModalStore.setState({ error: 'Title is required' });
      return;
    }
    if (!formData.description.trim()) {
      clearError();
      useServiceModalStore.setState({ error: 'Description is required' });
      return;
    }
    if (!formData.price || formData.price <= 0) {
      clearError();
      useServiceModalStore.setState({ error: 'Price must be greater than 0' });
      return;
    }

    try {
      await onSubmit(formData);
      // Only close if submission is successful
      handleClose();
    } catch (error) {
      // Error is handled in the store, modal stays open
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      image: null,
    });
    setImagePreview(null);
    clearError();
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Service</h2>
          <button className="modal-close-button" onClick={handleClose}>
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Service Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Service Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter service title"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter service description"
              rows={4}
              required
            />
          </div>

          {/* Price in Rands */}
          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price (Rands)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Select Image
            </label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="image" className="file-input-label">
                {imagePreview ? 'Change Image' : 'Choose Image'}
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

