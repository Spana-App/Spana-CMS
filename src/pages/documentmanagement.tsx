import { useState } from 'react';
import {
  Search,
  Download,
  FileText,
  Shield,
  UserCheck,
  Receipt,
  Award,
  Send,
  MessageSquare,
  Upload,
} from 'lucide-react';
import '../Styles/documentmanagement.css';

interface Document {
  id: number;
  provider: string;
  documentType: string;
  documentIcon: typeof FileText;
  status: 'Approved' | 'Pending Review' | 'Rejected' | 'Pending Update';
  uploaded: string;
  comments: number;
}

const mockDocuments: Document[] = [
  {
    id: 1,
    provider: 'Sarah Wilson',
    documentType: 'Business License',
    documentIcon: FileText,
    status: 'Approved',
    uploaded: '2024-06-10',
    comments: 0,
  },
  {
    id: 2,
    provider: 'Mike Johnson',
    documentType: 'Insurance Certificate',
    documentIcon: Shield,
    status: 'Pending Review',
    uploaded: '2024-06-12',
    comments: 2,
  },
  {
    id: 3,
    provider: 'Lisa Chen',
    documentType: 'ID Verification',
    documentIcon: UserCheck,
    status: 'Approved',
    uploaded: '2024-06-08',
    comments: 3,
  },
  {
    id: 4,
    provider: 'Tom Wilson',
    documentType: 'Tax Document',
    documentIcon: Receipt,
    status: 'Rejected',
    uploaded: '2024-06-11',
    comments: 1,
  },
  {
    id: 5,
    provider: 'Kate Brown',
    documentType: 'Certification',
    documentIcon: Award,
    status: 'Pending Update',
    uploaded: '2024-06-09',
    comments: 0,
  },
];

const summaryStats = {
  pendingReview: 12,
  approved: 234,
  rejected: 8,
  pendingUpdate: 5,
};

export default function DocumentManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = mockDocuments.filter((doc) =>
    doc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="document-management-container">
      {/* Header Section */}
      <div className="document-management-header">
        <div className="header-content">
          <h1 className="page-title">Document Management</h1>
          <p className="page-subtitle">
            Review and manage provider documents.
          </p>
        </div>
        <button className="download-all-button">
          <Download className="button-icon" />
          Download All
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="summary-cards-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-pending"></span>
            <h3 className="summary-title">Pending Review</h3>
          </div>
          <p className="summary-count">{summaryStats.pendingReview.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-approved"></span>
            <h3 className="summary-title">Approved</h3>
          </div>
          <p className="summary-count">{summaryStats.approved.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-rejected"></span>
            <h3 className="summary-title">Rejected</h3>
          </div>
          <p className="summary-count">{summaryStats.rejected.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-update"></span>
            <h3 className="summary-title">Pending Update</h3>
          </div>
          <p className="summary-count">{summaryStats.pendingUpdate.toLocaleString()}</p>
        </div>
      </div>

      {/* Provider Documents Section */}
      <div className="documents-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">Provider Documents</h2>
            <p className="panel-subtitle">
              View, comment, and manage documents.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search documents..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Document Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const DocumentIcon = doc.documentIcon;
                return (
                  <tr key={doc.id}>
                    <td className="provider-cell">{doc.provider}</td>
                    <td className="document-type-cell">
                      <div className="document-type-wrapper">
                        <DocumentIcon className="document-type-icon" />
                        <span>{doc.documentType}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          doc.status === 'Approved'
                            ? 'status-approved'
                            : doc.status === 'Pending Review'
                            ? 'status-pending-review'
                            : doc.status === 'Rejected'
                            ? 'status-rejected'
                            : 'status-pending-update'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="uploaded-cell">{doc.uploaded}</td>
                    <td className="comments-cell">
                      <div className="comments-wrapper">
                        <MessageSquare className="comments-icon" />
                        <span>{doc.comments}</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-group">
                        <button className="action-button" title="Download">
                          <Download className="action-icon" />
                        </button>
                        <button className="action-button" title="Send">
                          <Send className="action-icon" />
                        </button>
                        <button className="action-button" title="Comment">
                          <MessageSquare className="action-icon" />
                        </button>
                        <button className="action-button" title="Upload">
                          <Upload className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

