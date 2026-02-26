import { useEffect, useState } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/bookingmanagement.css';
import { useApplicationStore, type Application } from '../store/application';

export default function ApplicationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  const {
    applications,
    isFetching,
    isLoading,
    error,
    fetchApplications,
    verifyApplication,
    rejectApplication,
  } = useApplicationStore();

  useEffect(() => {
    fetchApplications(statusFilter === 'all' ? undefined : statusFilter).catch((err) => {
      console.error('Error fetching applications:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const formatDate = (value?: string): string => {
    if (!value) return 'N/A';
    try {
      return new Date(value).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return value;
    }
  };

  const toDisplayStatus = (app: Application): string => {
    const status = (app.status || '').toLowerCase();
    if (!status) return 'Pending';
    if (status === 'pending') return 'Pending';
    if (status === 'verified' || status === 'approved') return 'Verified';
    if (status === 'rejected') return 'Rejected';
    return app.status ?? 'Pending';
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const name = (app.applicantName || '').toLowerCase();
    const email = (app.email || '').toLowerCase();
    const phone = (app.phone || '').toLowerCase();

    const matchesSearch =
      name.includes(q) || email.includes(q) || phone.includes(q) || app.id.toLowerCase().includes(q);

    return matchesSearch;
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="booking-management-container">
      <div className="booking-management-header">
        <div className="header-content">
          <h1 className="page-title">Provider Applications</h1>
          <p className="page-subtitle">
            Review, verify, or reject incoming provider applications.
          </p>
        </div>
      </div>

      <div className="bookings-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">All Applications</h2>
            <p className="panel-subtitle">Applications awaiting admin review.</p>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-container">
            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
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

        {(isFetching || isLoading) && (
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
            <span>Loading applications...</span>
          </div>
        )}

          <div className="table-container">
            {!isFetching && filteredApplications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {applications.length === 0 ? 'No applications found.' : 'No applications match your filters.'}
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app) => {
                  const statusLabel = toDisplayStatus(app);
                  const statusLower = statusLabel.toLowerCase();
                  const badgeClass =
                    statusLower === 'verified'
                      ? 'status-completed'
                      : statusLower === 'rejected'
                      ? 'status-cancelled'
                      : 'status-pending';

                  return (
                    <tr key={app.id}>
                      <td className="booking-id-cell">{app.id}</td>
                      <td className="client-cell">{app.applicantName || 'N/A'}</td>
                      <td className="provider-cell">{app.email || 'N/A'}</td>
                      <td className="service-cell">{app.phone || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>{statusLabel}</span>
                      </td>
                      <td className="date-cell">{formatDate(app.createdAt)}</td>
                      <td className="actions-cell">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="export-report-button"
                            style={{ padding: '0.25rem 0.75rem' }}
                            disabled={isLoading || statusLower === 'verified'}
                            onClick={() => verifyApplication(app.id)}
                          >
                            Verify
                          </button>
                          <button
                            className="export-report-button"
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                            }}
                            disabled={isLoading || statusLower === 'rejected'}
                            onClick={() => rejectApplication(app.id, 'Rejected via admin CMS')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!isFetching && filteredApplications.length > ITEMS_PER_PAGE && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredApplications.length)} of{' '}
              {filteredApplications.length} applications
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="pagination-icon" />
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageClick(page)}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="pagination-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

