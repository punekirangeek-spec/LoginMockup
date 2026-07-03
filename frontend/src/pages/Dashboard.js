import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AppLogo } from '../components/Icons';
import { HeaderBackground } from '../components/BackgroundSVGs';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';
import './Dashboard.css';

const STAT_CARDS = [
  { key: 'total_projects', label: 'Total Projects' },
  { key: 'closed',         label: 'Closed' },
  { key: 'running',        label: 'Running' },
  { key: 'closure_delay',  label: 'Closure Delay' },
  { key: 'cancelled',      label: 'Cancelled' },
];

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard-stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setError('Failed to connect to the server. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSidebarNavigate = (page) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'projects') navigate('/projects');
    else if (page === 'create') navigate('/create');
  };

  const handleLogout = () => navigate('/');

  // recharts needs a flat array of plain objects, one per bar-group --
  // this is exactly the shape /dashboard-stats already returns, so no
  // reshaping needed here.
  const chartData = stats ? stats.department_breakdown : [];

  return (
    <div className="with-sidebar">
      <Sidebar activePage="dashboard" onNavigate={handleSidebarNavigate} onLogout={handleLogout} />

      <div className="dashboard-page">
        <div className="dashboard-band">
          <HeaderBackground className="dashboard-band-graphic" />
          <div className="dashboard-band-header">
            <h5 className="m-0 fw-bold text-white">Dashboard</h5>
          </div>
          <div className="dashboard-band-logo">
            <AppLogo />
          </div>
        </div>

        <div className="dashboard-content">
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          {loading && <div className="text-muted">Loading dashboard...</div>}

          {!loading && stats && (
            <>
              <div className="stat-card-row">
                {STAT_CARDS.map(({ key, label }) => (
                  <div className="stat-card" key={key}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{stats[key]}</div>
                  </div>
                ))}
              </div>

              <h6 className="chart-title">Department wise - Total Vs Closed</h6>

              <div className="chart-card">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#eef0f2" />
                    <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#5a5b5b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#5a5b5b' }} allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="total" name="Total" fill="#0b5ed7" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="closed" name="Closed" fill="#5cb85c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;