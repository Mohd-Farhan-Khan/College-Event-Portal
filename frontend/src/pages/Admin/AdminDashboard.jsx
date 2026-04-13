import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, ClipboardList, Trophy, CalendarPlus, ArrowRight,
  CalendarDays, Award, GraduationCap, Building2, ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminDashboard.css';

const QUICK_ACTIONS = [
  { label: "View Users",          icon: <Users size={20} />,        accent: "#2F5D50", bg: "#DCE8E1", link: "/admin/users" },
  { label: "Create Event",        icon: <CalendarPlus size={20} />, accent: "#B56E4A", bg: "#F5E4D9", link: "/admin/events/new" },
  { label: "Manage Registrations",icon: <ClipboardList size={20} />,accent: "#C7A86D", bg: "#F5F0E4", link: "/admin/registrations" },
  { label: "Publish Result",      icon: <Award size={20} />,        accent: "#2F5D50", bg: "#DCE8E1", link: "/admin/results/new" },
  { label: "Public Events",       icon: <CalendarDays size={20} />, accent: "#5B6673", bg: "#F0EDE8", link: "/events" },
  { label: "Results",             icon: <Trophy size={20} />,       accent: "#5B6673", bg: "#F0EDE8", link: "/results" },
];

function StatusBadge({ status }) {
  const cfg = {
    confirmed: { bg: "#DCE8E1", text: "#2F5D50", label: "Confirmed" },
    pending:   { bg: "#F5F0D9", text: "#9A7B3F", label: "Pending"   },
    cancelled: { bg: "#F5E4D9", text: "#B56E4A", label: "Cancelled" },
  };
  const c = cfg[status] || { bg: "#F0F0F0", text: "#6B6B6B", label: status };
  return (
    <span className="role-badge" style={{ backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function formatDateMin(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function AdminDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    users: [],
    registrations: [],
    results: [],
    eventsCount: 0 // We don't have a secure GET /api/admin/events, we can just fetch /api/events if needed, but the mock just shows active events. Let's fetch /api/events for count.
  });
  const [viewState, setViewState] = useState("loading"); // "loading", "loaded", "error"

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/events');
      return;
    }

    let cancelled = false;

    async function loadDashboardData() {
      try {
        const [usersRes, regsRes, resultsRes, eventsRes] = await Promise.all([
          request('/api/users').catch(() => []),
          request('/api/registrations').catch(() => []),
          request('/api/results').catch(() => []),
          request('/api/events').catch(() => [])
        ]);

        if (!cancelled) {
          const arrUsers = Array.isArray(usersRes) ? usersRes : usersRes.data || [];
          const arrRegs = Array.isArray(regsRes) ? regsRes : regsRes.data || [];
          const arrResults = Array.isArray(resultsRes) ? resultsRes : resultsRes.data || [];
          const arrEvents = Array.isArray(eventsRes) ? eventsRes : eventsRes.data || [];

          setData({
            users: arrUsers,
            registrations: arrRegs,
            results: arrResults,
            eventsCount: arrEvents.length
          });
          setViewState("loaded");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setViewState("error");
        }
      }
    }

    loadDashboardData();
    return () => { cancelled = true; };
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  if (viewState === "loading") {
    return (
      <div className="admin-dash-page">
        <Navbar />
        <main className="admin-dash-main">
          <div className="admin-loading">
            <Loader2 size={32} className="admin-loading__spinner" />
            <p>Gathering analytics...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="admin-dash-page">
        <Navbar />
        <main className="admin-dash-main">
          <div className="admin-dash-container" style={{ maxWidth: '48rem' }}>
            <div className="admin-error">
              <AlertCircle size={32} className="admin-error__icon" />
              <p className="admin-error__title font-serif">Dashboard failed to load</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>There was a connection error fetching global platform metrics.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Derived metrics
  const totalUsers = data.users.length;
  const totalRegs = data.registrations.length;
  const totalResults = data.results.length;

  const roleDist = {
    student: data.users.filter(u => u.role === 'student').length,
    college: data.users.filter(u => u.role === 'college').length,
    admin: data.users.filter(u => u.role === 'admin').length,
  };

  const topRegs = [...data.registrations].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)).slice(0, 5);
  const topResults = [...data.results].sort((a, b) => new Date(b.issuedAt || 0) - new Date(a.issuedAt || 0)).slice(0, 5);

  return (
    <div className="admin-dash-page">
      <Navbar />

      <main className="admin-dash-main">
        <div className="admin-dash-container">

          {/* Header */}
          <div className="admin-dash-header">
            <p className="admin-dash-eyebrow">Administration</p>
            <h1 className="admin-dash-title font-serif">Admin Dashboard</h1>
            <p className="admin-dash-desc">Platform overview — derived from live data across users, registrations, and results.</p>
          </div>

          {/* Summary Stat Tiles */}
          <div className="admin-stats-grid">
            {[
              { label: "Total Users",         value: totalUsers,   icon: <Users size={20} />,         bg: "#DCE8E1", accent: "#2F5D50" },
              { label: "Total Registrations", value: totalRegs,    icon: <ClipboardList size={20} />, bg: "#F5E4D9", accent: "#B56E4A" },
              { label: "Published Results",   value: totalResults, icon: <Trophy size={20} />,        bg: "#F5F0E4", accent: "#C7A86D" },
              { label: "Active Events",       value: data.eventsCount, icon: <CalendarDays size={20} />,  bg: "#DCE8E1", accent: "#2F5D50" },
            ].map(s => (
              <div key={s.label} className="admin-stat-tile">
                <div className="admin-stat-icon-wrap" style={{ backgroundColor: s.bg, color: s.accent }}>
                  {s.icon}
                </div>
                <div>
                  <p className="admin-stat-value">{s.value}</p>
                  <p className="admin-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Role Distribution */}
          <div className="admin-roles-panel">
            <h2 className="admin-roles-title">
              User Role Distribution
              <span className="admin-roles-hint">— derived from GET /api/users</span>
            </h2>
            <div className="admin-roles-grid">
              {[
                { role: "Students",  count: roleDist.student, icon: <GraduationCap size={20} />, bg: "#DCE8E1", text: "#2F5D50" },
                { role: "Colleges",  count: roleDist.college, icon: <Building2 size={20} />,     bg: "#F5E4D9", text: "#B56E4A" },
                { role: "Admins",    count: roleDist.admin,   icon: <ShieldCheck size={20} />,   bg: "#F5F0E4", text: "#C7A86D" },
              ].map(r => (
                <div key={r.role} className="admin-role-card">
                  <div className="admin-role-icon" style={{ backgroundColor: r.bg, color: r.text }}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="admin-role-count">{r.count}</p>
                    <p className="admin-role-name">{r.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column Lists */}
          <div className="admin-lists-grid">
            {/* Recent Registrations */}
            <div className="admin-list-panel">
              <div className="admin-list-header">
                <h2 className="admin-list-title">Recent Registrations</h2>
                <Link to="/admin/registrations" className="admin-list-view-all">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="admin-list-items">
                {topRegs.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>No registrations yet.</div>
                ) : topRegs.map(r => (
                  <div key={r._id} className="admin-list-item">
                    <div className="admin-list-item-main">
                      <p className="admin-list-item-name">{r.student_id?.name || 'Unknown Student'}</p>
                      <p className="admin-list-item-sub">{r.event_id?.title || 'Unknown Event'}</p>
                    </div>
                    <div className="admin-list-item-meta">
                      <StatusBadge status={r.status === 'registered' ? 'pending' : r.status} />
                      <p className="admin-list-item-date">{formatDateMin(r.registeredAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            <div className="admin-list-panel">
              <div className="admin-list-header">
                <h2 className="admin-list-title">Recent Results</h2>
                <Link to="/results" className="admin-list-view-all">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="admin-list-items">
                {topResults.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>No results published yet.</div>
                ) : topResults.map(r => (
                  <div key={r._id} className="admin-list-item">
                    <div className="admin-list-item-main">
                      <p className="admin-list-item-name">{r.student_id?.name || 'Unknown Student'}</p>
                      <p className="admin-list-item-sub">{r.event_id?.title || 'Unknown Event'}</p>
                    </div>
                    <div className="admin-list-item-meta">
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 700, 
                        color: r.position === 1 ? '#C7A86D' : r.position === 2 ? '#8B8B8B' : '#B56E4A' 
                      }}>
                        #{r.position}
                      </span>
                      <p className="admin-list-item-date">{formatDateMin(r.issuedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="admin-actions-title">Quick Actions</h2>
            <div className="admin-actions-grid">
              {QUICK_ACTIONS.map(a => (
                <Link
                  key={a.label}
                  to={a.link}
                  className="admin-action-card"
                >
                  <div className="admin-action-card-icon" style={{ backgroundColor: a.bg, color: a.accent }}>
                    {a.icon}
                  </div>
                  <span className="admin-action-card-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
