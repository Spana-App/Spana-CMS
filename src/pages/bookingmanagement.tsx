import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import '../Styles/bookingmanagement.css';
import { useBookingsStore } from '../store/bookings';
import type { Booking } from '../store/bookings';

export default function BookingManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All Bookings');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  
  const { bookings, isFetching, error, fetchBookings } = useBookingsStore();

  useEffect(() => {
    fetchBookings().catch((err) => {
      console.error('Error fetching bookings:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Helper function to format price
  const formatPrice = (booking: Booking): string => {
    // Try to get price from payment object first, then booking price
    let amount: number | undefined;
    
    if (booking.payment && typeof booking.payment === 'object' && booking.payment.amount) {
      amount = booking.payment.amount;
    } else if (booking.price !== undefined && booking.price !== null) {
      amount = booking.price;
    }
    
    if (amount === undefined || amount === null) return 'N/A';
    return `R${amount.toFixed(2)}`;
  };

  // Helper function to normalize and get booking status
  const getBookingStatus = (booking: Booking): 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' => {
    if (!booking.status) return 'Pending';
    
    // Normalize status to handle different cases and formats
    const status = booking.status.toString().toLowerCase().trim();
    
    // Map various status formats to standard values
    if (status === 'pending' || status === 'pending' || status === 'new') {
      return 'Pending';
    }
    if (status === 'confirmed' || status === 'accept' || status === 'accepted') {
      return 'Confirmed';
    }
    if (status === 'completed' || status === 'done' || status === 'finished' || status === 'fulfilled') {
      return 'Completed';
    }
    if (status === 'cancelled' || status === 'canceled' || status === 'cancel') {
      return 'Cancelled';
    }
    
    // Default fallback
    return 'Pending';
  };

  // Helper function to get client name
  const getClientName = (booking: Booking): string => {
    return booking.clientName || booking.userId || 'N/A';
  };

  // Helper function to get service name
  const getServiceName = (booking: Booking): string => {
    return booking.serviceName || booking.serviceId || 'N/A';
  };

  // Helper function to get provider name (might be in booking data)
  const getProviderName = (booking: Booking): string => {
    return booking.providerName || booking.provider || 'N/A';
  };

  // Helper function to get payment status (derive from booking status or use payment field if available)
  const getPaymentStatus = (booking: Booking): 'Paid' | 'Pending' | 'Refunded' => {
    // If payment is an object, extract status from it
    if (booking.payment && typeof booking.payment === 'object') {
      const paymentStatus = booking.payment.status?.toLowerCase();
      if (paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'success') {
        return 'Paid';
      }
      if (paymentStatus === 'refunded' || paymentStatus === 'refund') {
        return 'Refunded';
      }
      if (paymentStatus === 'pending' || paymentStatus === 'processing') {
        return 'Pending';
      }
    }
    
    // If payment is a string, use it directly
    if (typeof booking.payment === 'string') {
      const paymentStr = booking.payment.toLowerCase();
      if (paymentStr === 'paid') return 'Paid';
      if (paymentStr === 'refunded') return 'Refunded';
      return 'Pending';
    }
    
    // Derive payment status from booking status
    const status = getBookingStatus(booking);
    if (status === 'Completed' || status === 'Confirmed') {
      return 'Paid';
    }
    if (status === 'Cancelled') {
      return 'Refunded';
    }
    return 'Pending';
  };

  // Calculate summary stats from real data - dynamically updates based on bookings
  const summaryStats = useMemo(() => {
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    // Count bookings by their normalized status
    bookings.forEach((booking) => {
      const status = getBookingStatus(booking);
      switch (status) {
        case 'Pending':
          stats.pending++;
          break;
        case 'Confirmed':
          stats.confirmed++;
          break;
        case 'Completed':
          stats.completed++;
          break;
        case 'Cancelled':
          stats.cancelled++;
          break;
        default:
          // If status doesn't match, count as pending
          stats.pending++;
          break;
      }
    });

    return stats;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const clientName = getClientName(booking).toLowerCase();
      const serviceName = getServiceName(booking).toLowerCase();
      const providerName = getProviderName(booking).toLowerCase();
      const bookingId = booking.id?.toLowerCase() || '';
      
      const matchesSearch =
        bookingId.includes(searchQuery.toLowerCase()) ||
        clientName.includes(searchQuery.toLowerCase()) ||
        providerName.includes(searchQuery.toLowerCase()) ||
        serviceName.includes(searchQuery.toLowerCase());
      
      const status = getBookingStatus(booking);
      const matchesBookingStatus =
        bookingFilter === 'All Bookings' || status === bookingFilter;
      
      const paymentStatus = getPaymentStatus(booking);
      const matchesPaymentStatus =
        paymentFilter === 'All Payments' || paymentStatus === paymentFilter;
      
      return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
    });
  }, [bookings, searchQuery, bookingFilter, paymentFilter]);

  return (
    <div className="booking-management-container">
      {/* Header Section */}
      <div className="booking-management-header">
        <div className="header-content">
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">
            View and manage all service bookings.
          </p>
        </div>
        <button className="export-report-button">
          <Download className="button-icon" />
          Export Report
        </button>
      </div>

      {/* Summary Cards Section */}
      <div className="summary-cards-section">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-pending"></span>
            <h3 className="summary-title">Pending</h3>
          </div>
          <p className="summary-count">{summaryStats.pending.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-confirmed"></span>
            <h3 className="summary-title">Confirmed</h3>
          </div>
          <p className="summary-count">{summaryStats.confirmed.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-completed"></span>
            <h3 className="summary-title">Completed</h3>
          </div>
          <p className="summary-count">{summaryStats.completed.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-indicator summary-indicator-cancelled"></span>
            <h3 className="summary-title">Cancelled</h3>
          </div>
          <p className="summary-count">{summaryStats.cancelled.toLocaleString()}</p>
        </div>
      </div>

      {/* All Bookings Section */}
      <div className="bookings-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">All Bookings</h2>
            <p className="panel-subtitle">Track and manage booking details.</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-container">
            <select
              className="filter-dropdown"
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
            >
              <option value="All Bookings">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="filter-dropdown"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All Payments">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ padding: '1rem', color: 'red', backgroundColor: '#fee', borderRadius: '4px', margin: '1rem 0' }}>
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {isFetching && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '0.5rem' }}>Loading bookings...</span>
          </div>
        )}

        {/* Bookings Table */}
        {!isFetching && (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Client</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      {bookings.length === 0 ? 'No bookings found' : 'No bookings match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const status = getBookingStatus(booking);
                    const paymentStatus = getPaymentStatus(booking);
                    const bookingDate = formatDate(booking.scheduledDate || booking.bookingDate || booking.createdAt);
                    
                    return (
                      <tr key={booking.id}>
                        <td className="booking-id-cell">{booking.id || 'N/A'}</td>
                        <td className="client-cell">{getClientName(booking)}</td>
                        <td className="provider-cell">{getProviderName(booking)}</td>
                        <td className="service-cell">{getServiceName(booking)}</td>
                        <td className="date-cell">{bookingDate}</td>
                        <td className="amount-cell">{formatPrice(booking)}</td>
                        <td>
                          <span
                            className={`payment-badge ${
                              paymentStatus === 'Paid'
                                ? 'payment-paid'
                                : paymentStatus === 'Pending'
                                ? 'payment-pending'
                                : 'payment-refunded'
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              status === 'Pending'
                                ? 'status-pending'
                                : status === 'Confirmed'
                                ? 'status-confirmed'
                                : status === 'Completed'
                                ? 'status-completed'
                                : 'status-cancelled'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

