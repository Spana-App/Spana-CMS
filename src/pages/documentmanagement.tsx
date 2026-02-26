import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Download,
  FileText,
  Send,
  MessageSquare,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import '../Styles/documentmanagement.css';
import { useDocumentsStore, type PendingDocument } from '../store/documents';

const getProviderName = (doc: PendingDocument): string => {
  if (doc.user?.firstName || doc.user?.lastName) {
    return `${doc.user.firstName ?? ''} ${doc.user.lastName ?? ''}`.trim();
  }
  return doc.user?.email || doc.userId || 'Unknown provider';
};

const getDocumentType = (doc: PendingDocument): string =>
  doc.type || (doc as any).documentType || doc.metadata?.name || 'Document';

const formatDate = (value?: string): string => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return value;
  }
};

export default function DocumentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { documents, isFetching, isLoading, error, fetchPendingDocuments, verifyDocument } =
    useDocumentsStore();

  useEffect(() => {
    fetchPendingDocuments().catch((err) => {
      console.error('Error fetching documents:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryStats = useMemo(() => {
    const total = documents.length;
    return {
      pendingReview: total,
      approved: 0,
      rejected: 0,
      pendingUpdate: 0,
    };
  }, [documents]);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) => {
        const provider = getProviderName(doc).toLowerCase();
        const type = getDocumentType(doc).toLowerCase();
        const q = searchQuery.toLowerCase();
        return provider.includes(q) || type.includes(q);
      }),
    [documents, searchQuery]
  );

  return (
    <div className="document-management-container">
      {/* Header Section */}
      <div className="document-management-header">
        <div className="header-content">
          <h1 className="page-title">Document Management</h1>
            <p className="page-subtitle">Review and manage provider documents.</p>
        </div>
        <button className="download-all-button" disabled>
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

        {error && (
          <div
            className="error-message"
            style={{
              padding: '1rem',
              color: '#b91c1c',
              backgroundColor: '#fee2e2',
              borderRadius: '4px',
              margin: '1rem 0',
            }}
          >
            Error: {error}
          </div>
        )}

        {isFetching && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              gap: '0.5rem',
            }}
          >
            <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading documents…</span>
          </div>
        )}

        <div className="table-container">
          {!isFetching && filteredDocuments.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {documents.length === 0 ? 'No pending documents found.' : 'No documents match your search.'}
            </div>
          ) : (
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Document Type</th>
                  <th>Uploaded</th>
                  <th>Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="provider-cell">{getProviderName(doc)}</td>
                    <td className="document-type-cell">
                      <div className="document-type-wrapper">
                        <FileText className="document-type-icon" />
                        <span>{getDocumentType(doc)}</span>
                      </div>
                    </td>
                    <td className="uploaded-cell">{formatDate(doc.createdAt || doc.updatedAt)}</td>
                    <td className="comments-cell">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="preview-link"
                        >
                          <MessageSquare className="comments-icon" />
                          <span>Open</span>
                        </a>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>N/A</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="actions-group">
                        <button
                          className="action-button"
                          title="Approve"
                          onClick={() => verifyDocument(doc.id, doc.userId, true)}
                          disabled={isLoading}
                        >
                          <CheckCircle2 className="action-icon" />
                        </button>
                        <button
                          className="action-button"
                          title="Reject"
                          onClick={() => verifyDocument(doc.id, doc.userId, false)}
                          disabled={isLoading}
                        >
                          <XCircle className="action-icon" />
                        </button>
                        <button className="action-button" title="Download" disabled>
                          <Download className="action-icon" />
                        </button>
                        <button className="action-button" title="Upload replacement" disabled>
                          <Upload className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

