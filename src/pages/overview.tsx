import { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/overview.css';
import { useUsersStore } from '../store/users';
import { useBookingsStore } from '../store/bookings';
import { usePaymentsStore } from '../store/payments';

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  status: 'active' | 'success';
}

const activities: Activity[] = [
  {
    id: 1,
    action: 'New booking created',
    user: 'John Smith',
    time: '2 minutes ago',
    status: 'active',
  },
  {
    id: 2,
    action: 'Service provider verified',
    user: 'Sarah Wilson',
    time: '15 minutes ago',
    status: 'success',
  },
];

export default function DashboardPage() {
  const location = useLocation();
  const state = location.state as { successMessage?: string } | null;
  const navigate = useNavigate();

  const [bannerMessage, setBannerMessage] = useState<string | null>(
    state?.successMessage ?? null
  );

  const { users, fetchUsers } = useUsersStore();
  const { bookings, fetchBookings } = useBookingsStore();
  const { payments, fetchPayments } = usePaymentsStore();

  useEffect(() => {
    if (state?.successMessage) {
      setBannerMessage(state.successMessage);

      const timer = setTimeout(() => {
        setBannerMessage(null);
        // Remove successMessage from history state without reloading
        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [state?.successMessage, navigate, location.pathname]);

  useEffect(() => {
    fetchUsers().catch((err) => console.error('Error fetching users for overview:', err));
    fetchBookings().catch((err) => console.error('Error fetching bookings for overview:', err));
    fetchPayments().catch((err) => console.error('Error fetching payments for overview:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(() => {
    const totalUsers = users.length;
    const providers = users.filter(
      (u) => (u.role || '').toLowerCase() === 'service_provider' || !!u.serviceProvider
    ).length;

    const activeBookings = bookings.filter((b) => {
      const status = (b.status || '').toString().toLowerCase();
      return status !== 'cancelled' && status !== 'canceled';
    }).length;

    let totalRevenue = 0;
    payments.forEach((p) => {
      const status = (p.status || '').toLowerCase();
      if (
        status === 'paid' ||
        status === 'completed' ||
        status === 'success'
      ) {
        if (typeof p.amount === 'number') {
          totalRevenue += p.amount;
        }
      }
    });

    return {
      totalUsers,
      providers,
      activeBookings,
      totalRevenue,
    };
  }, [users, bookings, payments]);

  const bookingTrendHeights = useMemo(() => {
    if (!bookings.length) return [20, 30, 40, 35, 25, 15];

    const buckets = [0, 0, 0, 0, 0, 0]; // last 6 months
    const now = new Date();

    bookings.forEach((b) => {
      const dateStr = b.scheduledDate || b.bookingDate || b.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const diffMonths =
        (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diffMonths >= 0 && diffMonths < 6) {
        const index = 5 - diffMonths;
        buckets[index] += 1;
      }
    });

    const max = Math.max(...buckets, 1);
    return buckets.map((count) => Math.max(10, (count / max) * 100));
  }, [bookings]);

  return (
    <div className="dashboard-overview-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening with your service marketplace.
          </p>
        </div>
      </div>

      {bannerMessage && (
        <div
          className="success-banner"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {bannerMessage}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Users</h3>
            <div className="kpi-icon-wrapper users-icon">
              <Users className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">{kpis.totalUsers.toLocaleString()}</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>Live total</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Active Bookings</h3>
            <div className="kpi-icon-wrapper bookings-icon">
              <Calendar className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">{kpis.activeBookings.toLocaleString()}</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>Currently active</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Revenue</h3>
            <div className="kpi-icon-wrapper revenue-icon">
              <DollarSign className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">R{kpis.totalRevenue.toFixed(2)}</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>Paid to date</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Service Providers</h3>
            <div className="kpi-icon-wrapper providers-icon">
              <TrendingUp className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">{kpis.providers.toLocaleString()}</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>Live providers</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Booking Trends</h3>
              <p className="chart-subtitle">Monthly booking overview</p>
            </div>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              <div className="chart-bars">
                {bookingTrendHeights.map((h, idx) => (
                  <div key={idx} className="chart-bar" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="chart-labels">
                <span>–5m</span>
                <span>–4m</span>
                <span>–3m</span>
                <span>–2m</span>
                <span>–1m</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue Growth</h3>
              <p className="chart-subtitle">Monthly revenue in USD</p>
            </div>
          </div>
          <div className="chart-content empty-chart">
            <div className="empty-chart-placeholder">
              <div className="chart-axes">
                <div className="y-axis">
                  <span>10000</span>
                  <span>7500</span>
                  <span>5000</span>
                  <span>2500</span>
                  <span>0</span>
                </div>
                <div className="x-axis">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="activity-card">
        <div className="activity-header">
          <div>
            <h3 className="activity-title">Recent Activity</h3>
            <p className="activity-subtitle">Latest actions across the platform</p>
          </div>
        </div>
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div
                className={`activity-dot ${
                  activity.status === 'success' ? 'dot-success' : 'dot-active'
                }`}
              ></div>
              <div className="activity-content">
                <p className="activity-text">
                  <span className="activity-action">{activity.action}</span> by{' '}
                  <span className="activity-user">{activity.user}</span>
                </p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
