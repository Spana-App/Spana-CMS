import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import '../Styles/contentmanagement.css';

interface PromotionalBanner {
  id: number;
  name: string;
  status: 'Active' | 'Scheduled';
  views: string;
}

interface AppInfoPage {
  id: number;
  name: string;
  lastUpdated: string;
}

const mockBanners: PromotionalBanner[] = [
  {
    id: 1,
    name: 'Summer Sale',
    status: 'Active',
    views: '12.5K',
  },
  {
    id: 2,
    name: 'New Service Launch',
    status: 'Active',
    views: '8.2K',
  },
  {
    id: 3,
    name: 'Holiday Special',
    status: 'Scheduled',
    views: '0',
  },
];

const appInfoPages: AppInfoPage[] = [
  {
    id: 1,
    name: 'About Us',
    lastUpdated: '2024-06-10',
  },
  {
    id: 2,
    name: 'Terms & Conditions',
    lastUpdated: '2024-05-15',
  },
  {
    id: 3,
    name: 'Privacy Policy',
    lastUpdated: '2024-05-15',
  },
  {
    id: 4,
    name: 'FAQ',
    lastUpdated: '2024-06-01',
  },
];

export default function ContentManagement() {
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  return (
    <div className="content-management-container">
      {/* Header Section */}
      <div className="content-management-header">
        <div className="header-content">
          <h1 className="page-title">Content Management</h1>
          <p className="page-subtitle">
            Manage app content, FAQs, and promotions.
          </p>
        </div>
        <button className="add-content-button">
          <Plus className="button-icon" />
          Add Content
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Promotional Banners Section */}
        <div className="content-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Promotional Banners</h2>
              <p className="section-subtitle">
                Manage homepage banners and ads
              </p>
            </div>
          </div>
          <div className="banners-list">
            {mockBanners.map((banner) => (
              <div key={banner.id} className="banner-card">
                <div className="banner-left">
                  <div className="banner-image-placeholder">
                    <ImageIcon className="image-icon" />
                  </div>
                  <div className="banner-info">
                    <h3 className="banner-name">{banner.name}</h3>
                    <div className="banner-meta">
                      <span
                        className={`status-badge ${
                          banner.status === 'Active'
                            ? 'status-active'
                            : 'status-scheduled'
                        }`}
                      >
                        {banner.status}
                      </span>
                      <span className="views-count">{banner.views} views</span>
                    </div>
                  </div>
                </div>
                <div className="banner-actions">
                  <button className="action-icon-button" title="Edit">
                    <Pencil className="action-icon" />
                  </button>
                  <button
                    className="action-icon-button delete-button"
                    title="Delete"
                  >
                    <Trash2 className="action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Information Section */}
        <div className="content-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">App Information</h2>
              <p className="section-subtitle">Edit FAQs and About pages</p>
            </div>
          </div>
          <div className="app-info-list">
            {appInfoPages.map((page) => (
              <div key={page.id} className="app-info-card">
                <div className="app-info-content">
                  <h3 className="app-info-name">{page.name}</h3>
                  <p className="app-info-date">
                    Last updated: {page.lastUpdated}
                  </p>
                </div>
                <button className="edit-button">
                  <Pencil className="edit-icon" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="content-section announcements-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Announcements</h2>
              <p className="section-subtitle">
                Create announcements for mobile app users
              </p>
            </div>
          </div>
          <div className="announcements-form">
            <div className="form-group">
              <label htmlFor="announcement-title" className="form-label">
                Title
              </label>
              <input
                id="announcement-title"
                type="text"
                placeholder="Announcement title"
                className="form-input"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="announcement-message" className="form-label">
                Message
              </label>
              <textarea
                id="announcement-message"
                placeholder="Enter announcement message"
                className="form-textarea"
                rows={6}
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
              />
            </div>
            <button className="submit-button">Create Announcement</button>
          </div>
        </div>
      </div>
    </div>
  );
}

