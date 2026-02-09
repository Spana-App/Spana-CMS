import { useState, useEffect } from 'react';
import { Upload, Shield, Settings, Save } from 'lucide-react';
import '../Styles/adminprofile.css';
import { useAuthStore } from '../store/authentication';

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
  const { user } = useAuthStore();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
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
          <button type="button" className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="save-button">
            <Save className="button-icon" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

