import { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/paymentmanagement.css';
import { useWalletStore } from '../store/wallet';

export default function WalletPage() {
  const { summary, transactions, isFetchingSummary, isFetchingTransactions, error, fetchSummary, fetchTransactions } =
    useWalletStore();

  useEffect(() => {
    fetchSummary().catch((err) => console.error('Error fetching wallet summary:', err));
    fetchTransactions().catch((err) => console.error('Error fetching wallet transactions:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(
    () => ({
      totalHeld: summary?.totalHeld ?? 0,
      totalReleased: summary?.totalReleased ?? 0,
      totalCommission: summary?.totalCommission ?? 0,
      txCount: transactions.length,
    }),
    [summary, transactions]
  );

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

  const formatAmount = (amount?: number): string =>
    typeof amount === 'number' ? `R${amount.toFixed(2)}` : 'R0.00';

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

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
          <h1 className="page-title">Spana Wallet</h1>
          <p className="page-subtitle">
            Platform-level wallet showing held funds, releases, and commission.
          </p>
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

      <div className="summary-cards-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-primary" />
            <h3 className="summary-title">Total Held</h3>
          </div>
          <p className="summary-value">{formatAmount(totals.totalHeld)}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-success" />
            <h3 className="summary-title">Total Released</h3>
          </div>
          <p className="summary-value">{formatAmount(totals.totalReleased)}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-warning" />
            <h3 className="summary-title">Total Commission</h3>
          </div>
          <p className="summary-value">{formatAmount(totals.totalCommission)}</p>
          <p className="summary-subvalue">{totals.txCount.toLocaleString()} transactions</p>
        </div>
      </div>

      <div className="payments-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">Wallet Transactions</h2>
            <p className="panel-subtitle">All movements in and out of the Spana wallet.</p>
          </div>
        </div>

        {(isFetchingSummary || isFetchingTransactions) && (
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
            <span>Loading wallet data...</span>
          </div>
        )}

        <div className="table-container">
          {!isFetchingTransactions && transactions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              No wallet transactions found.
            </div>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Direction</th>
                  <th>Booking</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="method-cell">{tx.type || 'Transaction'}</td>
                    <td className="amount-cell">{formatAmount(tx.amount)}</td>
                    <td className="customer-cell">
                      <span
                        className={`status-badge ${
                          tx.direction === 'in' ? 'status-paid' : 'status-refunded'
                        }`}
                      >
                        {tx.direction === 'in' ? 'In' : 'Out'}
                      </span>
                    </td>
                    <td className="booking-cell">{tx.bookingId || 'N/A'}</td>
                    <td className="subject-cell">{tx.description || '—'}</td>
                    <td className="date-cell">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isFetchingTransactions && transactions.length > ITEMS_PER_PAGE && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of{' '}
              {transactions.length} transactions
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

