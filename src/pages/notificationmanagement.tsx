import { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import '../Styles/notificationmanagement.css';

interface NotificationTemplate {
  id: number;
  name: string;
  description: string;
}

interface NotificationLog {
  id: number;
  recipient: string;
  subject: string;
  type: string;
  sent: string;
  status: 'Delivered' | 'Pending' | 'Failed';
}

const templates: NotificationTemplate[] = [
  {
    id: 1,
    name: 'Welcome New Users',
    description: 'Onboarding message for new registrations.',
  },
  {
    id: 2,
    name: 'Booking Reminder',
    description: 'Reminder for upcoming bookings.',
  },
  {
    id: 3,
    name: 'Payment Received',
    description: 'Payment confirmation message.',
  },
  {
    id: 4,
    name: 'Service Completed',
    description: 'Thank you message after service.',
  },
  {
    id: 5,
    name: 'Promotional Campaign',
    description: 'Marketing promotion template.',
  },
];

const mockNotifications: NotificationLog[] = [
  {
    id: 1,
    recipient: 'All Providers',
    subject: 'New Policy Update',
    type: 'Email',
    sent: '2024-06-14 10:30 AM',
    status: 'Delivered',
  },
  {
    id: 2,
    recipient: 'All Clients',
    subject: 'Weekly Newsletter',
    type: 'Push',
    sent: '2024-06-13 09:15 AM',
    status: 'Delivered',
  },
  {
    id: 3,
    recipient: 'Service Providers',
    subject: 'New Feature Available',
    type: 'Email',
    sent: '2024-06-12 02:45 PM',
    status: 'Delivered',
  },
  {
    id: 4,
    recipient: 'All Users',
    subject: 'System Maintenance',
    type: 'Push',
    sent: '2024-06-11 11:00 AM',
    status: 'Delivered',
  },
  {
    id: 5,
    recipient: 'Premium Members',
    subject: 'Exclusive Offer',
    type: 'Email',
    sent: '2024-06-10 03:20 PM',
    status: 'Pending',
  },
];

export default function NotificationManagement() {
  const [recipient, setRecipient] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleUseTemplate = (templateName: string) => {
    // This would typically load template content
    setSubject(templateName);
    setMessage(`Template content for ${templateName}`);
  };

  return (
    <div className="notification-management-container">
      {/* Header Section */}
      <div className="notification-management-header">
        <div className="header-content">
          <h1 className="page-title">Notification Management</h1>
          <p className="page-subtitle">
            Create, schedule, and manage notifications.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="notification-grid">
        {/* Send Notification Section */}
        <div className="notification-section send-notification-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Send Notification</h2>
              <p className="section-subtitle">
                Create and send notifications to users.
              </p>
            </div>
          </div>
          <form className="notification-form">
            <div className="form-group">
              <label htmlFor="recipient" className="form-label">
                Recipient
              </label>
              <select
                id="recipient"
                className="form-select"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="">Select recipients</option>
                <option value="all-users">All Users</option>
                <option value="all-clients">All Clients</option>
                <option value="all-providers">All Providers</option>
                <option value="premium-members">Premium Members</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notification-type" className="form-label">
                Notification Type
              </label>
              <select
                id="notification-type"
                className="form-select"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                <option value="">Select type</option>
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Notification subject"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Enter your message"
                className="form-textarea"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="send-now-button">
                <Send className="button-icon" />
                Send Now
              </button>
              <button type="button" className="schedule-button">
                <Clock className="button-icon" />
                Schedule
              </button>
            </div>
          </form>
        </div>

        {/* Broadcast Templates Section */}
        <div className="notification-section templates-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Broadcast Templates</h2>
              <p className="section-subtitle">
                Quick access to common messages.
              </p>
            </div>
          </div>
          <div className="templates-list">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-content">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
                <button
                  className="use-template-link"
                  onClick={() => handleUseTemplate(template.name)}
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Log Section */}
        <div className="notification-section log-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Notification Log</h2>
              <p className="section-subtitle">
                History of all sent notifications.
              </p>
            </div>
          </div>
          <div className="table-container">
            <table className="notification-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Sent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="recipient-cell">{notification.recipient}</td>
                    <td className="subject-cell">{notification.subject}</td>
                    <td className="type-cell">{notification.type}</td>
                    <td className="sent-cell">{notification.sent}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          notification.status === 'Delivered'
                            ? 'status-delivered'
                            : notification.status === 'Pending'
                            ? 'status-pending'
                            : 'status-failed'
                        }`}
                      >
                        {notification.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

