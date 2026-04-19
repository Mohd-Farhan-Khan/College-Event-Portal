import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, ClipboardList, Award, ArrowRight, Clock, CheckCircle2, Users, Calendar, BarChart3 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './CollegeDashboard.css';

const QUICK_ACTIONS = [
  {
    icon: <CalendarPlus size={24} />,
    title: 'Create Event',
    description: 'Publish a new event for your college — tech, cultural, sports, or academic.',
    cta: 'Create Event',
    href: '/college/events/new',
    accent: '#2F5D50',
    bg: '#DCE8E1',
  },
  {
    icon: <ClipboardList size={24} />,
    title: 'Manage Registrations',
    description: 'Review student sign-ups, confirm attendance, and update registration status.',
    cta: 'View Registrations',
    href: '/college/registrations',
    accent: '#B56E4A',
    bg: '#F5E4D9',
  },
  {
    icon: <Award size={24} />,
    title: 'Publish Results',
    description: "Record and publish final results for events you've managed.",
    cta: 'Publish Results',
    href: '/college/results/new',
    accent: '#C7A86D',
    bg: '#F5F0E4',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics',
    description: 'View registration statistics and top events for your college.',
    cta: 'View Analytics',
    href: '/college/analytics',
    accent: '#2F5D50',
    bg: '#DCE8E1',
  },
];

function StatusBadge({ status }) {
  const cfg = {
    confirmed: { label: 'Confirmed', bg: '#DCE8E1', text: '#2F5D50' },
    pending: { label: 'Pending', bg: '#F5F0D9', text: '#9A7B3F' },
    cancelled: { label: 'Cancelled', bg: '#F5E4D9', text: '#B56E4A' },
  }[status] || { label: status, bg: '#F0F0F0', text: '#6B6B6B' };

  return (
    <span className="status-badge" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function CollegeDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;

    // If not logged in as college, redirect early
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'college') {
      navigate('/events'); // Or a "not authorized" page
      return;
    }

    let cancelled = false;

    async function loadStats() {
      try {
        const data = await request('/api/registrations');
        if (!cancelled) {
          setRegistrations(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Failed to load registrations.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'college') return null; // Let the useEffect handle the redirect safely

  const total = registrations.length;
  const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
  // Fallback to "pending" if backend returns "registered" instead of "pending" initially
  const pending = registrations.filter((r) => r.status === 'pending' || r.status === 'registered').length; 

  // Show top 5 recent registrations
  const recentRegs = [...registrations].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)).slice(0, 5);

  return (
    <div className="college-dashboard">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* Welcome Header */}
          <div className="dashboard-header">
            <p className="dashboard-header__eyebrow">College Organizer</p>
            <h1 className="dashboard-header__title font-serif">Welcome back, {user.name?.split(' ')[0]}</h1>
            <p className="dashboard-header__desc">Organizer Dashboard</p>
          </div>

          {isLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-loading__spinner" />
              <p>Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="dashboard-error">
              <p>{error}</p>
              <button className="btn btn--outline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <>
              {/* Stat Tiles */}
              <div className="stat-grid">
                <div className="stat-tile">
                  <div className="stat-tile__icon-wrap" style={{ backgroundColor: '#DCE8E1' }}>
                    <Users size={20} color="#2F5D50" />
                  </div>
                  <div>
                    <p className="stat-tile__value">{total}</p>
                    <p className="stat-tile__label">Total Registrations</p>
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__icon-wrap" style={{ backgroundColor: '#DCE8E1' }}>
                    <CheckCircle2 size={20} color="#2F5D50" />
                  </div>
                  <div>
                    <p className="stat-tile__value">{confirmed}</p>
                    <p className="stat-tile__label">Confirmed</p>
                  </div>
                </div>
                <div className="stat-tile">
                  <div className="stat-tile__icon-wrap" style={{ backgroundColor: '#F5F0D9' }}>
                    <Clock size={20} color="#9A7B3F" />
                  </div>
                  <div>
                    <p className="stat-tile__value">{pending}</p>
                    <p className="stat-tile__label">Pending Review</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h2 className="section-title font-serif">Quick Actions</h2>
                <div className="quick-actions-grid">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="action-card"
                    >
                      <div className="action-card__icon-wrap" style={{ backgroundColor: action.bg, color: action.accent }}>
                        {action.icon}
                      </div>
                      <div className="action-card__content">
                        <h3 className="action-card__title font-serif">{action.title}</h3>
                        <p className="action-card__desc">{action.description}</p>
                      </div>
                      <span className="action-card__link" style={{ color: action.accent }}>
                        {action.cta}
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Registrations */}
              <div>
                <div className="recent-regs-header">
                  <h2 className="section-title font-serif" style={{ marginBottom: 0 }}>Recent Registrations</h2>
                  <Link to="/college/registrations" className="view-all-link">
                    View all <ArrowRight size={14} />
                  </Link>
                </div>

                {recentRegs.length === 0 ? (
                  <div className="empty-state">
                    <Calendar size={40} className="empty-state__icon" />
                    <p className="empty-state__title font-serif">No registrations yet</p>
                    <p className="empty-state__desc">Create your first event to start receiving registrations.</p>
                    <Link to="/college/events/new" className="btn btn--primary empty-state__btn">
                      Create Event
                    </Link>
                  </div>
                ) : (
                  <div className="regs-wrap">
                    {/* Desktop Table */}
                    <table className="regs-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Event</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRegs.map((r, i) => (
                          <tr key={r._id || i}>
                            <td className="regs-td-student">{r.student_id?.name || 'Unknown'}</td>
                            <td className="regs-td-event">{r.event_id?.title || 'Unknown Event'}</td>
                            <td><StatusBadge status={r.status || 'pending'} /></td>
                            <td className="regs-td-date">{formatDate(r.registeredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="regs-mobile-list">
                      {recentRegs.map((r, i) => (
                        <div key={r._id || i} className="regs-mobile-card">
                          <div className="regs-mobile-card-row">
                            <span className="regs-mobile-student">{r.student_id?.name || 'Unknown'}</span>
                            <StatusBadge status={r.status || 'pending'} />
                          </div>
                          <p className="regs-mobile-event">{r.event_id?.title || 'Unknown Event'}</p>
                          <p className="regs-mobile-date">{formatDate(r.registeredAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
