import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import '../Styles/bookingmanagement.css';

interface Booking {
  id: string;
  client: string;
  provider: string;
  service: string;
  date: string;
  amount: string;
  payment: 'Paid' | 'Pending' | 'Refunded';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const mockBookings: Booking[] = [
  {
    id: 'BK-001',
    client: 'John Smith',
    provider: 'Sarah Wilson',
    service: 'House Cleaning',
    date: '2024-06-15',
    amount: 'R120',
    payment: 'Paid',
    status: 'Confirmed',
  },
  {
    id: 'BK-002',
    client: 'Emma Davis',
    provider: 'Mike Johnson',
    service: 'Plumbing',
    date: '2024-06-16',
    amount: 'R180',
    payment: 'Pending',
    status: 'Pending',
  },
  {
    id: 'BK-003',
    client: 'David Brown',
    provider: 'Lisa Chen',
    service: 'Gardening',
    date: '2024-06-14',
    amount: 'R95',
    payment: 'Paid',
    status: 'Completed',
  },
  {
    id: 'BK-004',
    client: 'Anna Lee',
    provider: 'Tom Wilson',
    service: 'Electrical Work',
    date: '2024-06-17',
    amount: 'R220',
    payment: 'Paid',
    status: 'Confirmed',
  },
  {
    id: 'BK-005',
    client: 'Chris Martin',
    provider: 'Kate Brown',
    service: 'Lawn Mowing',
    date: '2024-06-13',
    amount: 'R65',
    payment: 'Refunded',
    status: 'Cancelled',
  },
];

const summaryStats = {
  pending: 24,
  confirmed: 156,
  completed: 1067,
  cancelled: 38,
};

export default function BookingManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All Bookings');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookingStatus =
      bookingFilter === 'All Bookings' || booking.status === bookingFilter;
    const matchesPaymentStatus =
      paymentFilter === 'All Payments' || booking.payment === paymentFilter;
    return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
  });

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

        {/* Bookings Table */}
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-id-cell">{booking.id}</td>
                  <td className="client-cell">{booking.client}</td>
                  <td className="provider-cell">{booking.provider}</td>
                  <td className="service-cell">{booking.service}</td>
                  <td className="date-cell">{booking.date}</td>
                  <td className="amount-cell">{booking.amount}</td>
                  <td>
                    <span
                      className={`payment-badge ${
                        booking.payment === 'Paid'
                          ? 'payment-paid'
                          : booking.payment === 'Pending'
                          ? 'payment-pending'
                          : 'payment-refunded'
                      }`}
                    >
                      {booking.payment}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        booking.status === 'Pending'
                          ? 'status-pending'
                          : booking.status === 'Confirmed'
                          ? 'status-confirmed'
                          : booking.status === 'Completed'
                          ? 'status-completed'
                          : 'status-cancelled'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

