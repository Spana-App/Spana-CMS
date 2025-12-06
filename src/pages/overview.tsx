import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/overview.css';

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
          <div className="kpi-value">12,543</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>+12.5% vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Active Bookings</h3>
            <div className="kpi-icon-wrapper bookings-icon">
              <Calendar className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">1,247</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>+8.2% vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Revenue</h3>
            <div className="kpi-icon-wrapper revenue-icon">
              <DollarSign className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">R94,230</div>
          <div className="kpi-change positive">
            <ArrowUp className="change-icon" />
            <span>+23.1% vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Service Providers</h3>
            <div className="kpi-icon-wrapper providers-icon">
              <TrendingUp className="kpi-icon" />
            </div>
          </div>
          <div className="kpi-value">342</div>
          <div className="kpi-change negative">
            <ArrowDown className="change-icon" />
            <span>-2.4% vs last month</span>
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
                <div className="chart-bar" style={{ height: '46%' }}></div>
                <div className="chart-bar" style={{ height: '58%' }}></div>
                <div className="chart-bar" style={{ height: '69%' }}></div>
                <div className="chart-bar" style={{ height: '85%' }}></div>
                <div className="chart-bar" style={{ height: '73%' }}></div>
                <div className="chart-bar" style={{ height: '96%' }}></div>
              </div>
              <div className="chart-labels">
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
