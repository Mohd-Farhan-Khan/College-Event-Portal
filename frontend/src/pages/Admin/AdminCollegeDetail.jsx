import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Pencil, Trash2, Users, CalendarDays,
  ClipboardList, CheckCircle2, Trophy, ChevronRight,
  Building2, GraduationCap, Loader2, AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminCollegeDetail.css';

/**
 * /admin/colleges/:collegeId
 * GET /api/colleges/:id/overview  -> { college, metrics, recentEvents }
 * GET /api/colleges/:id/users
 * DELETE /api/colleges/:id
 */

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getEventStatus(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString) > new Date() ? 'Upcoming' : 'Completed';
}

function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, typeToConfirm }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!open) { setTyped(''); setBusy(false); } }, [open]);
  if (!open) return null;

  const enabled = !typeToConfirm || typed === typeToConfirm;

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="confirm-dialog__title font-serif">{title}</h2>
        <div className="confirm-dialog__desc">{description}</div>
        {typeToConfirm && (
          <div className="confirm-dialog__confirm-field">
            <p className="confirm-dialog__confirm-label">Type <strong>{typeToConfirm}</strong> to confirm:</p>
            <input
              type="text" value={typed} onChange={e => setTyped(e.target.value)}
              className="confirm-dialog__confirm-input" placeholder={typeToConfirm} autoFocus
            />
          </div>
        )}
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="confirm-dialog__delete" disabled={!enabled || busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}
          >
            {busy ? 'Deleting...' : (confirmLabel || 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, value, label, accent, bg }) {
  return (
    <div className="acd-metric-card">
      <div className="acd-metric-icon" style={{ backgroundColor: bg, color: accent }}>{icon}</div>
      <p className="acd-metric-value">{value ?? '—'}</p>
      <p className="acd-metric-label">{label}</p>
    </div>
  );
}

export function AdminCollegeDetail() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { collegeId } = useParams();

  const [viewState, setViewState] = useState('loading');
  const [college, setCollege] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/events'); return; }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin' || !collegeId) return;
    let cancelled = false;
    async function fetchAll() {
      setViewState('loading');
      try {
        const [overviewRes, usersRes] = await Promise.all([
          request(`/api/colleges/${collegeId}/overview`),
          request(`/api/colleges/${collegeId}/users`),
        ]);
        if (!cancelled) {
          setCollege(overviewRes.college || null);
          setMetrics(overviewRes.metrics || null);
          setRecentEvents(overviewRes.recentEvents || []);
          setLinkedUsers(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
          setViewState('loaded');
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setViewState('error'); }
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [user, isAuthLoading, collegeId]);

  async function handleDelete() {
    setDeleteError('');
    try {
      await request(`/api/colleges/${collegeId}`, { method: 'DELETE' });
      navigate('/admin/colleges');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete college.');
      throw err;
    }
  }

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  if (viewState === 'loading') {
    return (
      <div className="acd-page"><Navbar />
        <main className="acd-main">
          <div className="admin-loading">
            <Loader2 size={32} className="admin-loading__spinner" /><p>Loading college details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="acd-page"><Navbar />
        <main className="acd-main"><div className="acd-container">
          <Link to="/admin/colleges" className="acd-back-link"><ArrowLeft size={16} /> Back to Colleges</Link>
          <div className="admin-error">
            <AlertCircle size={32} className="admin-error__icon" />
            <p className="admin-error__title font-serif">Couldn&rsquo;t load college</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>Check the ID and try again.</p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  const collegeName = college?.name || 'Unknown College';

  return (
    <div className="acd-page">
      <Navbar />
      <main className="acd-main">
        <div className="acd-container">

          <Link to="/admin/colleges" className="acd-back-link">
            <ArrowLeft size={16} /> Back to Colleges
          </Link>

          {/* Header Card */}
          <div className="acd-header-card">
            <div className="acd-header-banner" />
            <div className="acd-header-body">
              <div className="acd-header-identity">
                <div className="acd-header-identity-left">
                  {college?.logo_url ? (
                    <img src={college.logo_url} alt={collegeName} className="acd-logo-img"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="acd-logo-placeholder">{collegeName.substring(0, 2).toUpperCase()}</div>
                  )}
                  <div>
                    <h1 className="acd-college-name font-serif">{collegeName}</h1>
                    <div className="acd-college-meta">
                      {college?.location && (
                        <span className="acd-college-location"><MapPin size={13} /> {college.location}</span>
                      )}
                      <span className="acd-college-id">{college?._id}</span>
                    </div>
                  </div>
                </div>
                <div className="acd-header-actions">
                  <Link to={`/admin/colleges/${collegeId}/edit`} className="acd-btn-edit">
                    <Pencil size={15} /> Edit
                  </Link>
                  <button onClick={() => setShowDelete(true)} className="acd-btn-delete">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
              {college?.description && <p className="acd-description">{college.description}</p>}
            </div>
          </div>

          {/* Metrics */}
          <div className="acd-section">
            <h2 className="acd-section-title font-serif">
              Overview Metrics
              <span className="acd-section-hint">— GET /api/colleges/:id/overview</span>
            </h2>
            <div className="acd-metrics-grid">
              <MetricCard icon={<Users size={16} />}        value={metrics?.usersCount}             label="Users"               accent="#2F5D50" bg="#DCE8E1" />
              <MetricCard icon={<CalendarDays size={16} />} value={metrics?.eventsCount}            label="Events"              accent="#B56E4A" bg="#F5E4D9" />
              <MetricCard icon={<ClipboardList size={16} />}value={metrics?.registrationsCount}     label="Registrations"       accent="#C7A86D" bg="#F5F0E4" />
              <MetricCard icon={<CheckCircle2 size={16} />} value={metrics?.confirmedRegistrations} label="Confirmed"           accent="#2F5D50" bg="#DCE8E1" />
              <MetricCard icon={<Trophy size={16} />}       value={metrics?.resultsCount}           label="Results Published"   accent="#C7A86D" bg="#F5F0E4" />
            </div>
          </div>

          {/* Two-column */}
          <div className="acd-two-col">

            {/* Recent Events */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div>
                  <h2 className="acd-card-title font-serif">Recent Events</h2>
                  <p className="acd-card-hint">recentEvents from overview</p>
                </div>
                <Link to="/events" className="acd-view-all">Full list <ChevronRight size={13} /></Link>
              </div>
              {recentEvents.length === 0 ? (
                <div className="acd-empty-inline">No events found for this college.</div>
              ) : (
                <table className="acd-table">
                  <thead><tr><th>Event</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentEvents.map(e => {
                      const st = getEventStatus(e.date);
                      return (
                        <tr key={e._id}>
                          <td className="acd-td-title">{e.title || '—'}</td>
                          <td className="acd-td-date">{formatDate(e.date)}</td>
                          <td>
                            <span className={`acd-status-badge ${st === 'Upcoming' ? 'acd-status--upcoming' : 'acd-status--completed'}`}>
                              {st}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Linked Users */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div>
                  <h2 className="acd-card-title font-serif">Linked Users</h2>
                  <p className="acd-card-hint">GET /api/colleges/:id/users</p>
                </div>
              </div>
              {linkedUsers.length === 0 ? (
                <div className="acd-empty-inline">No users linked to this college.</div>
              ) : (
                <>
                  <div className="acd-users-list">
                    {linkedUsers.slice(0, 6).map(u => (
                      <Link key={u._id} to={`/admin/users/${u._id}`} className="acd-user-row">
                        <div className="acd-user-avatar"
                          style={{ backgroundColor: u.role === 'college' ? '#B56E4A' : '#2F5D50' }}>
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="acd-user-info">
                          <p className="acd-user-name">{u.name}</p>
                          <p className="acd-user-email">{u.email}</p>
                        </div>
                        <span className={`acd-role-badge ${u.role === 'college' ? 'acd-role--organizer' : 'acd-role--student'}`}>
                          {u.role === 'college' ? <Building2 size={10} /> : <GraduationCap size={10} />}
                          {u.role === 'college' ? 'Organizer' : 'Student'}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {linkedUsers.length > 0 && (
                    <div className="acd-users-footer">
                      Total: <strong>{linkedUsers.length}</strong> user{linkedUsers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="acd-danger-zone">
            <h3 className="acd-danger-title font-serif">Danger Zone</h3>
            <div className="acd-danger-row">
              <div>
                <p className="acd-danger-name">Delete this college</p>
                <p className="acd-danger-desc">Permanently remove the college and break references in events, registrations, and results.</p>
              </div>
              <button onClick={() => setShowDelete(true)} className="acd-btn-delete-solid">
                <Trash2 size={15} /> Delete College
              </button>
            </div>
          </div>

        </div>
      </main>
      <Footer />

      <ConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); }}
        onConfirm={handleDelete}
        title={`Delete ${collegeName}?`}
        confirmLabel="Delete College"
        typeToConfirm={collegeName}
        description={
          <>
            <p>
              This college has <strong style={{ color: 'var(--cep-text-primary)' }}>{metrics?.eventsCount ?? 0} events</strong>,{' '}
              <strong style={{ color: 'var(--cep-text-primary)' }}>{metrics?.usersCount ?? 0} linked users</strong>, and{' '}
              <strong style={{ color: 'var(--cep-text-primary)' }}>{metrics?.registrationsCount ?? 0} registrations</strong>.
            </p>
            <p style={{ marginTop: '0.5rem' }}>All associated records will be removed. This action cannot be undone.</p>
            {deleteError && <p style={{ color: '#B56E4A', marginTop: '0.5rem', fontWeight: 500 }}>{deleteError}</p>}
          </>
        }
      />
    </div>
  );
}
