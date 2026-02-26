import { useState, useEffect } from 'react';
import { Upload, Shield, Settings, Save } from 'lucide-react';
import '../Styles/adminprofile.css';
import { useAuthStore } from '../store/authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

// Derive first/last name from store user (name may be "First Last" or we have firstName/lastName)
function getAdminDisplayNames(user: { name?: string; firstName?: string; lastName?: string } | null | undefined) {
  if (!user) return { firstName: 'Admin', lastName: 'User' };
  if (user.firstName && user.lastName) return { firstName: user.firstName, lastName: user.lastName };
  if (user.name && user.name.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    return { firstName: parts[0], lastName: 'User' };
  }
  return { firstName: 'Admin', lastName: 'User' };
}

export default function AdminProfile() {
  const { user, token, isAuthenticated } = useAuthStore();
  const { firstName: defaultFirst, lastName: defaultLast } = getAdminDisplayNames(user);

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(user?.email ?? 'admin@servicecms.com');
  const [phone, setPhone] = useState(user?.phone ?? '');

  // Keep form in sync with auth store when user loads or changes
  useEffect(() => {
    const { firstName: f, lastName: l } = getAdminDisplayNames(user);
    setFirstName(f);
    setLastName(l);
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activityDigest, setActivityDigest] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated || !token) {
      setError('You must be logged in as an admin to update your profile.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    const payload: Record<string, unknown> = {
      firstName,
      lastName,
      phone,
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${DEFAULT_API_BASE}/admin/profile`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Failed to update profile';
        try {
          const data = await response.json();
          if (data.message && data.error) {
            message = `${data.message}: ${data.error}`;
          } else {
            message = data.message || data.error || message;
          }
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      setSuccess('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-profile-container">
      {/* Header Section */}
      <div className="admin-profile-header">
        <div className="header-content">
          <h1 className="page-title">Admin Profile</h1>
          <p className="page-subtitle">Manage your account settings and preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {error && (
          <div
            className="error-message"
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              fontSize: '0.875rem',
            }}
          >
            {success}
          </div>
        )}
        {/* Top Sections Grid */}
        <div className="profile-grid">
          {/* Profile Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Profile Information</h2>
                <p className="section-subtitle">Update your personal details.</p>
              </div>
            </div>
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                <div className="profile-picture-placeholder">
                  <span className="profile-initials">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <button type="button" className="change-photo-button">
                <Upload className="button-icon" />
                Change Photo
              </button>
            </div>
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Security Settings Section */}
          <div className="profile-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Security Settings</h2>
                <p className="section-subtitle">Manage authentication and security.</p>
              </div>
            </div>
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="two-factor-section">
              <div className="two-factor-header">
                <Shield className="two-factor-icon" />
                <div className="two-factor-content">
                  <h3 className="two-factor-title">Two-Factor Authentication</h3>
                  <p className="two-factor-subtitle">Add an extra layer of security.</p>
                </div>
              </div>
              <button type="button" className="configure-2fa-button">
                <Settings className="button-icon" />
                Configure 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="profile-section preferences-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Preferences</h2>
              <p className="section-subtitle">Customize your dashboard experience.</p>
            </div>
          </div>
          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-content">
                <h3 className="preference-name">Email Notifications</h3>
                <p className="preference-description">
                  Receive email alerts for important events.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="preference-content">
                <h3 className="preference-name">Desktop Notifications</h3>
                <p className="preference-description">Show browser notifications.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={desktopNotifications}
                  onChange={(e) => setDesktopNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="preference-content">
                <h3 className="preference-name">Dark Mode</h3>
                <p className="preference-description">
                  Use dark theme for the dashboard.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <div className="preference-content">
                <h3 className="preference-name">Activity Digest</h3>
                <p className="preference-description">
                  Receive weekly activity summaries.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={activityDigest}
                  onChange={(e) => setActivityDigest(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="cancel-button" disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={isSaving}>
            <Save className="button-icon" />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

