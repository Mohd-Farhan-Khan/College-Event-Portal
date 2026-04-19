import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Building2, CalendarDays, ClipboardList, CheckCircle2, Trophy,
  GraduationCap, ShieldCheck, ChevronDown, Loader2, AlertCircle, Globe2
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminAnalytics.css';

/**
 * /admin/analytics
 * GET /api/analytics/admin
 * GET /api/analytics/admin?college_id=:collegeId
 * GET /api/colleges  (for college filter dropdown)
 */

function KpiCard({ icon, value, label, accent, bg }) {
  return (
    <div className="aa-kpi-card">
      <div className="aa-kpi-icon" style={{ backgroundColor: bg, color: accent }}>{icon}</div>
      <p className="aa-kpi-value">{value ?? '—'}</p>
      <p className="aa-kpi-label">{label}</p>
    </div>
  );
}

export function AdminAnalytics() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [viewState, setViewState] = useState('loading'); // loading | loaded | error

  // Auth guard
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/events'); return; }
  }, [user, isAuthLoading, navigate]);

  // Fetch college list for filter dropdown
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin') return;
    request('/api/colleges')
      .then(data => setColleges(Array.isArray(data) ? data : data.data || []))
      .catch(err => console.warn('Could not load colleges for filter:', err));
  }, [user, isAuthLoading]);

  // Fetch analytics whenever filter changes
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin') return;
    let cancelled = false;

    async function fetchAnalytics() {
      setViewState('loading');
      try {
        const endpoint = collegeFilter !== 'all'
          ? `/api/analytics/admin?college_id=${collegeFilter}`
          : '/api/analytics/admin';
        const data = await request(endpoint);
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
  }, [user, isAuthLoading, collegeFilter]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  const isFiltered = collegeFilter !== 'all';
  const scopeLabel = isFiltered
    ? colleges.find(c => c._id === collegeFilter)?.name || 'Selected College'
    : 'All Colleges (Platform)';

  const totals = analytics?.totals || {};
  const roleDistribution = analytics?.roleDistribution || {};
  const categoryDistribution = analytics?.categoryDistribution || {};
  const topEvents = analytics?.topEvents || [];

  // Build role distribution rows
  const roleRows = [
    { key: 'student', label: 'Students',  color: '#2F5D50', icon: <GraduationCap size={14} />, count: roleDistribution.student || 0 },
    { key: 'college', label: 'Organizers', color: '#B56E4A', icon: <Building2 size={14} />,    count: roleDistribution.college || 0 },
    { key: 'admin',   label: 'Admins',    color: '#C7A86D', icon: <ShieldCheck size={14} />,   count: roleDistribution.admin   || 0 },
  ];
  const totalUsersForRoles = roleRows.reduce((s, r) => s + r.count, 0);

  // Build category distribution rows
  const categoryRows = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));
  const totalCatEvents = categoryRows.reduce((s, r) => s + r.count, 0);

  const CAT_COLORS = ['#2F5D50', '#B56E4A', '#C7A86D', '#5B6673', '#9A7B3F', '#DDD6CB'];

  return (
    <div className="aa-page">
      <Navbar />
      <main className="aa-main">
        <div className="aa-container">

          {/* Header */}
          <div className="aa-header-row">
            <div>
              <p className="aa-eyebrow">Administration</p>
              <h1 className="aa-title font-serif">Platform Analytics</h1>
              <p className="aa-scope">
                <Globe2 size={15} />
                Scope: <span className="aa-scope-name">{scopeLabel}</span>
              </p>
            </div>

            {/* College filter */}
            <div className="aa-filter-wrap">
              <label className="aa-filter-label">Filter scope</label>
              <div className="aa-select-wrap">
                <select
                  value={collegeFilter}
                  onChange={e => setCollegeFilter(e.target.value)}
                  className="aa-select"
                >
                  <option value="all">All Colleges (Platform)</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="aa-select-icon" />
              </div>
            </div>
          </div>

          {/* Loading */}
          {viewState === 'loading' && (
            <div className="aa-state-center">
              <Loader2 size={32} className="aa-spinner" />
              <p className="aa-state-text">Loading analytics...</p>
            </div>
          )}

          {/* Error */}
          {viewState === 'error' && (
            <div className="aa-error-card">
              <AlertCircle size={28} className="aa-error-icon" />
              <p className="aa-error-title font-serif">Couldn&rsquo;t load analytics</p>
              <p className="aa-error-desc">Check your connection and try again.</p>
              <button className="aa-retry-btn" onClick={() => setCollegeFilter(collegeFilter)}>
                Retry
              </button>
            </div>
          )}

          {/* Loaded */}
          {viewState === 'loaded' && (
            <>
              {/* Filtered banner */}
              {isFiltered && (
                <div className="aa-filter-banner">
                  <p className="aa-filter-banner-text">
                    <strong>Filtered view</strong> — showing analytics scoped to {scopeLabel}.
                  </p>
                  <button onClick={() => setCollegeFilter('all')} className="aa-filter-clear">
                    Clear filter
                  </button>
                </div>
              )}

              {/* KPI Grid */}
              <div className={`aa-kpi-grid ${isFiltered ? 'aa-kpi-grid--filtered' : ''}`}>
                <KpiCard icon={<Users size={20} />}        value={totals.usersCount}             label="Users"          accent="#2F5D50" bg="#DCE8E1" />
                {!isFiltered && (
                  <KpiCard icon={<Building2 size={20} />}  value={totals.collegesCount}          label="Colleges"       accent="#B56E4A" bg="#F5E4D9" />
                )}
                <KpiCard icon={<CalendarDays size={20} />} value={totals.eventsCount}            label="Events"         accent="#B56E4A" bg="#F5E4D9" />
                <KpiCard icon={<ClipboardList size={20} />}value={totals.registrationsCount}     label="Registrations"  accent="#C7A86D" bg="#F5F0E4" />
                <KpiCard icon={<CheckCircle2 size={20} />} value={totals.confirmedRegistrations} label="Confirmed"      accent="#2F5D50" bg="#DCE8E1" />
                <KpiCard icon={<Trophy size={20} />}       value={totals.resultsCount}           label="Results"        accent="#C7A86D" bg="#F5F0E4" />
              </div>

              {/* Distributions */}
              <div className="aa-dist-grid">

                {/* Role Distribution */}
                <div className="aa-panel">
                  <div className="aa-panel-header">
                    <h2 className="aa-panel-title font-serif">User Roles</h2>
                    <span className="aa-panel-count">{totalUsersForRoles} users</span>
                  </div>
                  {/* Stacked bar */}
                  <div className="aa-stacked-bar">
                    {roleRows.filter(r => r.count > 0).map(r => (
                      <div
                        key={r.key}
                        style={{ width: `${(r.count / (totalUsersForRoles || 1)) * 100}%`, backgroundColor: r.color }}
                      />
                    ))}
                  </div>
                  <div className="aa-dist-rows">
                    {roleRows.map(r => {
                      const pct = totalUsersForRoles > 0 ? ((r.count / totalUsersForRoles) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={r.key} className="aa-dist-row">
                          <div className="aa-dist-icon" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                            {r.icon}
                          </div>
                          <span className="aa-dist-name">{r.label}</span>
                          <span className="aa-dist-count">{r.count}</span>
                          <span className="aa-dist-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="aa-panel">
                  <div className="aa-panel-header">
                    <h2 className="aa-panel-title font-serif">Event Categories</h2>
                    <span className="aa-panel-count">{totalCatEvents} events</span>
                  </div>
                  {categoryRows.length === 0 ? (
                    <div className="aa-empty">No event data available.</div>
                  ) : (
                    <div className="aa-cat-rows">
                      {categoryRows.map((c, i) => {
                        const pct = totalCatEvents > 0 ? (c.count / totalCatEvents) * 100 : 0;
                        const color = CAT_COLORS[i % CAT_COLORS.length];
                        return (
                          <div key={c.name} className="aa-cat-row">
                            <div className="aa-cat-header-row">
                              <span className="aa-cat-name">{c.name}</span>
                              <span className="aa-cat-count">
                                {c.count} <span className="aa-cat-sep">·</span> {pct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="aa-cat-bar-bg">
                              <div className="aa-cat-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Events */}
              <div className="aa-top-events">
                <div className="aa-top-events-header">
                  <div>
                    <h2 className="aa-panel-title font-serif" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trophy size={16} style={{ color: '#C7A86D' }} /> Top Events
                    </h2>
                    <p className="aa-panel-count" style={{ marginTop: '0.125rem' }}>Ranked by registrations</p>
                  </div>
                </div>

                {topEvents.length === 0 ? (
                  <div className="aa-empty">No event data available.</div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="aa-table-wrap">
                      <table className="aa-table">
                        <thead>
                          <tr>
                            {['#', 'Event', 'Category', 'Registrations', 'Results'].map(h => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topEvents.map((e, i) => (
                            <tr key={e.eventId || i}>
                              <td>
                                <span className={`aa-rank ${i === 0 ? 'aa-rank--gold' : i === 1 ? 'aa-rank--silver' : i === 2 ? 'aa-rank--bronze' : 'aa-rank--other'}`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="aa-td-title">{e.title}</td>
                              <td className="aa-td-secondary">{e.category || '—'}</td>
                              <td className="aa-td-value">{e.registrationsCount}</td>
                              <td className="aa-td-secondary">{e.resultsCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="aa-mobile-events">
                      {topEvents.map((e, i) => (
                        <div key={e.eventId || i} className="aa-mobile-event">
                          <span className={`aa-rank ${i === 0 ? 'aa-rank--gold' : i === 1 ? 'aa-rank--silver' : i === 2 ? 'aa-rank--bronze' : 'aa-rank--other'}`}>
                            {i + 1}
                          </span>
                          <div className="aa-mobile-event-body">
                            <p className="aa-td-title">{e.title}</p>
                            <p className="aa-td-secondary">{e.category || '—'}</p>
                            <div className="aa-mobile-event-stats">
                              <span><strong>{e.registrationsCount}</strong> regs</span>
                              <span><strong>{e.resultsCount}</strong> results</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
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
