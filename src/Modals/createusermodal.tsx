// Popup.tsx
import React, { useState } from 'react';
import '../Styles/createusermodal.css'
import createUser from '../store/createuser';
import { toast } from 'react-toastify';

const CreateUserModal: React.FC = () => {
    const { isOpen, activeTab, isLoading, error, closeModal, setActiveTab, createServiceProvider, createAdmin } =
    createUser();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'serviceProvider') {
      const success = await createServiceProvider(form);
      if (success) {
        setForm({ firstName: '', lastName: '', email: '', phone: '' });
        closeModal();
        toast.success(`Service provider ${form.firstName} ${form.lastName} created successfully!`);
      } else {
        toast.error('Failed to create service provider. Please try again.');
      }
    } else if (activeTab === 'admin') {
      const success = await createAdmin(form);
      if (success) {
        setForm({ firstName: '', lastName: '', email: '', phone: '' });
        closeModal();
        toast.success(`Admin ${form.firstName} ${form.lastName} created successfully! Credentials email sent.`);
      } else {
        toast.error('Failed to create admin. Please check the email domain and try again.');
      }
    }
  };

  const handleOverlayClick = () => {
    if (!isLoading) closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="aum-overlay" onClick={handleOverlayClick}>
      <div className="aum-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="aum-header">
          <h2 className="aum-title">Add New</h2>
          <button className="aum-close" onClick={closeModal} disabled={isLoading}>×</button>
        </div>

        {/* Toggle Tabs */}
        <div className="aum-tabs">
          <button
            className={`aum-tab ${activeTab === 'serviceProvider' ? 'aum-tab--active' : ''}`}
            onClick={() => setActiveTab('serviceProvider')}
            type="button"
          >
            Service Provider
          </button>
          <button
            className={`aum-tab ${activeTab === 'admin' ? 'aum-tab--active' : ''}`}
            onClick={() => setActiveTab('admin')}
            type="button"
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form className="aum-form" onSubmit={handleSubmit}>
          {activeTab === 'serviceProvider' || activeTab === 'admin' ? (
            <>
              <div className="aum-row">
                <div className="aum-field">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="aum-field">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="aum-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="provider@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="aum-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+27123456789"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          ) : null}

          {error && <p className="aum-error">{error}</p>}

          <div className="aum-actions">
            <button
              type="button"
              className="aum-btn aum-btn--cancel"
              onClick={closeModal}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="aum-btn aum-btn--submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )};

export default CreateUserModal;