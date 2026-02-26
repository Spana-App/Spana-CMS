import { useEffect, useMemo, useState } from 'react';
import { Search, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/paymentmanagement.css';
import { usePaymentsStore, type Payment } from '../store/payments';

export default function PaymentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Failed' | 'Refunded'>(
    'All'
  );

  const { payments, isFetching, error, fetchPayments } = usePaymentsStore();

  useEffect(() => {
    fetchPayments().catch((err) => {
      console.error('Error fetching payments:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (value?: string): string => {
    if (!value) return 'N/A';
    try {
      return new Date(value).toLocaleString('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  const formatAmount = (payment: Payment): string => {
    if (typeof payment.amount !== 'number') return 'R0.00';
    return `R${payment.amount.toFixed(2)}`;
  };

  const getStatus = (payment: Payment): Payment['status'] => payment.status ?? 'Pending';

  const summary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let refunded = 0;

    payments.forEach((p) => {
      const amount = typeof p.amount === 'number' ? p.amount : 0;
      total += amount;
      const status = (p.status || '').toLowerCase();
      if (status === 'paid' || status === 'completed' || status === 'success') paid += amount;
      if (status === 'refunded' || status === 'refund') refunded += amount;
    });

    return {
      total,
      paid,
      refunded,
      count: payments.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const q = searchQuery.toLowerCase();
        const customerUser = (payment as any).customer?.user;
        const customerName =
          `${customerUser?.firstName || ''} ${customerUser?.lastName || ''}`.trim() ||
          payment.customerName ||
          customerUser?.email ||
          payment.customerId ||
          '';
        const booking = (payment as any).booking;
        const bookingLabel =
          payment.bookingReference ||
          booking?.id ||
          payment.bookingId ||
          '';
        const status = (getStatus(payment) || '').toLowerCase();

        const matchesSearch =
          customerName.toLowerCase().includes(q) ||
          bookingLabel.toLowerCase().includes(q) ||
          (payment.referenceNumber || '').toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === 'All' || status === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      }),
    [payments, searchQuery, statusFilter]
  );

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

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
    <div className="payment-management-container">
      <div className="payment-management-header">
        <div className="header-content">
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">
            View all platform payments and escrow activity.
          </p>
        </div>
        <button className="export-report-button" disabled>
          <Download className="button-icon" />
          Export Report
        </button>
      </div>

      <div className="summary-cards-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-primary" />
            <h3 className="summary-title">Total Volume</h3>
          </div>
          <p className="summary-value">R{summary.total.toFixed(2)}</p>
          <p className="summary-subvalue">{summary.count.toLocaleString()} payments</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-success" />
            <h3 className="summary-title">Paid Out</h3>
          </div>
          <p className="summary-value">R{summary.paid.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-warning" />
            <h3 className="summary-title">Refunded</h3>
          </div>
          <p className="summary-value">R{summary.refunded.toFixed(2)}</p>
        </div>
      </div>

      <div className="payments-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">All Payments</h2>
            <p className="panel-subtitle">Detailed list of all transactions.</p>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer, booking, or reference..."
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
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
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
            <span>Loading payments...</span>
          </div>
        )}

        <div className="table-container">
          {!isFetching && filteredPayments.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {payments.length === 0 ? 'No payments found.' : 'No payments match your filters.'}
            </div>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Booking</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => {
                  const status = (getStatus(payment) || '').toLowerCase();
                  const customerUser = (payment as any).customer?.user;
                  const customerLabel =
                    `${customerUser?.firstName || ''} ${customerUser?.lastName || ''}`.trim() ||
                    payment.customerName ||
                    customerUser?.email ||
                    payment.customerId ||
                    'N/A';
                  const booking = (payment as any).booking;
                  const bookingLabel =
                    payment.bookingReference ||
                    booking?.id ||
                    payment.bookingId ||
                    'N/A';
                  const badgeClass =
                    status === 'paid' || status === 'completed' || status === 'success'
                      ? 'status-paid'
                      : status === 'refunded'
                      ? 'status-refunded'
                      : status === 'failed'
                      ? 'status-failed'
                      : 'status-pending';

                  return (
                    <tr key={payment.id}>
                      <td className="reference-cell">{payment.referenceNumber || payment.id}</td>
                      <td className="customer-cell">{customerLabel}</td>
                      <td className="booking-cell">{bookingLabel}</td>
                      <td className="amount-cell">{formatAmount(payment)}</td>
                      <td className="method-cell">{payment.paymentMethod || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>{getStatus(payment) || 'Pending'}</span>
                      </td>
                      <td className="date-cell">{formatDate(payment.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!isFetching && filteredPayments.length > ITEMS_PER_PAGE && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of{' '}
              {filteredPayments.length} payments
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

