import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/bookingmanagement.css';
import { useChatStore, type ChatMessage } from '../store/chat';

const getDisplayName = (user?: { firstName?: string; lastName?: string; email?: string; id?: string }) => {
  if (!user) return 'Unknown';
  const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  if (full) return full;
  if (user.email) return user.email;
  return user.id || 'Unknown';
};

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'booking' | 'direct' | 'admin'>('all');

  const { messages, isFetching, error, fetchAdminChats } = useChatStore();

  useEffect(() => {
    fetchAdminChats(typeFilter === 'all' ? undefined : typeFilter, undefined, 200).catch((err) =>
      console.error('Error fetching admin chats:', err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { bookingId?: string; lastMessage: ChatMessage; count: number }>();

    messages.forEach((msg) => {
      const key = msg.bookingId || msg.id;
      const existing = map.get(key);
      if (!existing || (msg.createdAt && (existing.lastMessage.createdAt || '') < msg.createdAt)) {
        map.set(key, {
          bookingId: msg.bookingId,
          lastMessage: msg,
          count: (existing?.count || 0) + 1,
        });
      } else {
        existing.count += 1;
        map.set(key, existing);
      }
    });

    let rows = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(({ lastMessage }) => {
        const sender = getDisplayName(lastMessage.sender).toLowerCase();
        const receiver = getDisplayName(lastMessage.receiver).toLowerCase();
        const content = (lastMessage.content || '').toLowerCase();
        const bookingId = (lastMessage.bookingId || '').toLowerCase();
        return (
          sender.includes(q) ||
          receiver.includes(q) ||
          content.includes(q) ||
          bookingId.includes(q)
        );
      });
    }

    return rows;
  }, [messages, searchQuery]);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(grouped.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = grouped.slice(startIndex, endIndex);

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
          <h1 className="page-title">Chats</h1>
          <p className="page-subtitle">
            Monitor conversations between customers and providers across all bookings.
          </p>
        </div>
      </div>

      <div className="bookings-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">Conversations</h2>
            <p className="panel-subtitle">Grouped by booking for quick oversight.</p>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by user, booking, or message..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-container">
            <select
              className="filter-dropdown"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="direct">Direct</option>
              <option value="admin">Admin</option>
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
            <span>Loading chats...</span>
          </div>
        )}

        <div className="table-container">
          {!isFetching && grouped.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              No chats found.
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Last Sender</th>
                  <th>Last Receiver</th>
                  <th>Type</th>
                  <th>Messages</th>
                  <th>Last Message</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(({ bookingId, lastMessage, count }) => (
                  <tr key={bookingId || lastMessage.id}>
                    <td className="booking-id-cell">{bookingId || 'N/A'}</td>
                    <td className="client-cell">{getDisplayName(lastMessage.sender)}</td>
                    <td className="provider-cell">{getDisplayName(lastMessage.receiver)}</td>
                    <td className="service-cell">{lastMessage.type || 'booking'}</td>
                    <td className="amount-cell">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={16} />
                        {count}
                      </span>
                    </td>
                    <td className="issue-cell">
                      {(lastMessage.content || '').slice(0, 80) || '—'}
                    </td>
                    <td className="date-cell">
                      {lastMessage.createdAt
                        ? new Date(lastMessage.createdAt).toLocaleString('en-ZA')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isFetching && grouped.length > ITEMS_PER_PAGE && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, grouped.length)} of {grouped.length} chats
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

