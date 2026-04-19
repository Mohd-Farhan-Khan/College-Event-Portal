import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, ClipboardList, Trophy, BarChart3,
  ArrowUpRight, Building2, Loader2, AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './CollegeAnalytics.css';

/**
 * /college/analytics
 * GET /api/analytics/college
 * Auth: college | admin
 */

function SummaryCard({ icon, value, label, accent, bg }) {
  return (
    <div className="ca-card">
      <div className="ca-card-icon-row">
        <div className="ca-card-icon" style={{ backgroundColor: bg, color: accent }}>{icon}</div>
        <span className="ca-card-label">{label}</span>
      </div>
      <p className="ca-card-value font-serif">{value ?? '—'}</p>
    </div>
  );
}

export function CollegeAnalytics() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [viewState, setViewState] = useState('loading'); // loading | loaded | error

  // Auth guard — allow college and admin
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'college' && user.role !== 'admin') { navigate('/events'); return; }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    if (user.role !== 'college' && user.role !== 'admin') return;

    let cancelled = false;

    async function fetchAnalytics() {
      setViewState('loading');
      try {
        const data = await request('/api/analytics/college');
        if (!cancelled) {
          setAnalytics(data);
          setViewState('loaded');
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setViewState('error'); }
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [user, isAuthLoading]);

  if (isAuthLoading || !user) return null;
  if (user.role !== 'college' && user.role !== 'admin') return null;

  const collegeName = analytics?.college?.name || user.name || 'Your College';
  const totals = analytics?.totals || {};
  const regsByStatus = analytics?.registrationsByStatus || {};
  const topEvents = analytics?.topEvents || [];

  // Registration status breakdown
  const statusRows = [
    { status: 'confirmed', label: 'Confirmed', count: regsByStatus.confirmed || 0, color: '#2F5D50', bg: '#DCE8E1' },
    { status: 'pending',   label: 'Pending',   count: regsByStatus.pending   || 0, color: '#9A7B3F', bg: '#F5F0D9' },
    { status: 'cancelled', label: 'Cancelled', count: regsByStatus.cancelled || 0, color: '#B56E4A', bg: '#F5E4D9' },
  ];
  const totalRegs = statusRows.reduce((s, r) => s + r.count, 0);

  const dashboardLink = user.role === 'admin' ? '/admin/dashboard' : '/college/dashboard';

  return (
    <div className="ca-page">
      <Navbar />
      <main className="ca-main">
        <div className="ca-container">

          {/* Header */}
          <div className="ca-header-row">
            <div>
              <p className="ca-eyebrow">Organizer Insights</p>
              <h1 className="ca-title font-serif">Analytics</h1>
              <p className="ca-scope">
                <Building2 size={15} />
                Scope: <span className="ca-scope-name">{collegeName}</span>
              </p>
            </div>
            <Link to={dashboardLink} className="ca-back-link">
              Back to dashboard <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Loading */}
          {viewState === 'loading' && (
            <div className="ca-state-center">
              <Loader2 size={32} className="ca-spinner" />
              <p className="ca-state-text">Loading analytics...</p>
            </div>
          )}

          {/* Error */}
          {viewState === 'error' && (
            <div className="ca-error-card">
              <AlertCircle size={28} className="ca-error-icon" />
              <p className="ca-error-title font-serif">Couldn&rsquo;t load analytics</p>
              <p className="ca-error-desc">Check your connection and try again.</p>
            </div>
          )}

          {/* Loaded */}
          {viewState === 'loaded' && (
            <>
              {/* Summary Cards */}
              <div className="ca-summary-grid">
                <SummaryCard icon={<CalendarDays size={20} />}  value={totals.eventsCount}        label="Events Hosted"       accent="#2F5D50" bg="#DCE8E1" />
                <SummaryCard icon={<ClipboardList size={20} />} value={totals.registrationsCount} label="Total Registrations"  accent="#B56E4A" bg="#F5E4D9" />
                <SummaryCard icon={<Trophy size={20} />}        value={totals.resultsCount}       label="Results Published"    accent="#C7A86D" bg="#F5F0E4" />
              </div>

              {/* Two-column */}
              <div className="ca-two-col">

                {/* Registration Status */}
                <div className="ca-panel">
                  <h2 className="ca-panel-title font-serif">Registration Status</h2>
                  <p className="ca-panel-sub">Across all your events ({totalRegs} total)</p>

                  {/* Stacked bar */}
                  <div className="ca-stacked-bar">
                    {statusRows.filter(r => r.count > 0).map(r => (
                      <div
                        key={r.status}
                        className="ca-stacked-segment"
                        style={{ width: `${(r.count / (totalRegs || 1)) * 100}%`, backgroundColor: r.color }}
                      />
                    ))}
                  </div>

                  <div className="ca-status-rows">
                    {statusRows.map(r => {
                      const pct = totalRegs > 0 ? ((r.count / totalRegs) * 100).toFixed(0) : '0';
                      return (
                        <div key={r.status} className="ca-status-row">
                          <span className="ca-status-dot" style={{ backgroundColor: r.color }} />
                          <span className="ca-status-name">{r.label}</span>
                          <span className="ca-status-count">{r.count}</span>
                          <span className="ca-status-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="ca-confirmation-rate">
                    <span className="ca-conf-label">Confirmation rate</span>
                    <span className="ca-conf-value">
                      {totalRegs > 0 ? ((regsByStatus.confirmed || 0) / totalRegs * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>

                {/* Top Events */}
                <div className="ca-panel">
                  <div className="ca-panel-header">
                    <h2 className="ca-panel-title font-serif" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={16} style={{ color: '#C7A86D' }} /> Top Events
                    </h2>
                    <p className="ca-panel-sub">Your most subscribed events</p>
                  </div>

                  {topEvents.length === 0 ? (
                    <div className="ca-empty">No event data available yet.</div>
                  ) : (
                    <div className="ca-top-events">
                      {topEvents.map((e, i) => {
                        const maxCount = topEvents[0]?.registrationsCount || 1;
                        const pct = (e.registrationsCount / maxCount) * 100;
                        return (
                          <div key={e.eventId || i} className="ca-event-row">
                            <div className="ca-event-meta">
                              <div className="ca-event-meta-left">
                                <span className="ca-event-rank">{i + 1}</span>
                                <span className="ca-event-title">{e.title}</span>
                              </div>
                              <div className="ca-event-stat">
                                <span className="ca-event-count">{e.registrationsCount}</span>
                                {e.category && <span className="ca-event-cat">{e.category}</span>}
                              </div>
                            </div>
                            <div className="ca-event-bar-bg">
                              <div className="ca-event-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
