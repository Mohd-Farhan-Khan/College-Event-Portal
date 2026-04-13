import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronDown, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminRegistrations.css';

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];

function StatusBadge({ status }) {
  const cfg = {
    confirmed: { bg: "#DCE8E1", text: "#2F5D50", label: "Confirmed" },
    pending: { bg: "#F5F0D9", text: "#9A7B3F", label: "Pending" },
    cancelled: { bg: "#F5E4D9", text: "#B56E4A", label: "Cancelled" },
  };
  const c = cfg[status] || { bg: "#F0F0F0", text: "#6B6B6B", label: status };
  return (
    <span className="admin-regs-status-badge" style={{ backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function InlineStatusPicker({ value, onChange, saving }) {
  return (
    <div className="admin-regs-picker-wrap">
      <div className="admin-regs-filter-select-wrap">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="admin-regs-picker"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <ChevronDown size={12} className="admin-regs-filter-select-icon" />
      </div>
      {saving && <Loader2 size={14} className="admin-regs-loading-icon text-[#2F5D50]" />}
    </div>
  );
}

function formatDateStr(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function AdminRegistrations() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [regs, setRegs] = useState([]);
  const [saving, setSaving] = useState(null); // id of saving reg
  const [eventFilter, setEventFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("loading"); // "loading", "loaded", "error"

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

    async function fetchData() {
      try {
        const res = await request('/api/registrations');
        if (!cancelled) {
          const arr = Array.isArray(res) ? res : (res.data || []);
          setRegs(arr);
          setView("loaded");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setView("error");
        }
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  async function handleStatusChange(id, newStatus) {
    setSaving(id);
    try {
      await request(`/api/registrations/${id}`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      // update locally
      setRegs(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setSaving(null);
    }
  }

  // Filter
  const filtered = regs.filter(r => {
    const rEventName = (r.event_id?.title || "").toLowerCase();
    const rEventId = r.event_id?._id || r.event_id || "";
    const matchEvent = !eventFilter || rEventName.includes(eventFilter.toLowerCase()) || String(rEventId).includes(eventFilter);

    const rStudentName = (r.student_id?.name || "").toLowerCase();
    const rStudentId = r.student_id?._id || r.student_id || "";
    const matchStudent = !studentFilter || rStudentName.includes(studentFilter.toLowerCase()) || String(rStudentId).includes(studentFilter);

    const matchStatus = statusFilter === "all" || r.status === statusFilter;

    return matchEvent && matchStudent && matchStatus;
  });

  return (
    <div className="admin-layout-page">
      <Navbar />
      <main className="admin-regs-main">
        <div className="admin-regs-container">

          {/* Header */}
          <div className="admin-regs-header">
            <p className="admin-regs-eyebrow">Administration</p>
            <h1 className="admin-regs-title font-serif">Registrations</h1>
            <p className="admin-regs-desc">
              All registrations across the platform. Update statuses via <span className="admin-regs-desc-badge">PATCH /api/registrations/:id</span>.
            </p>
          </div>

          {/* Scope Notice */}
          <div className="admin-regs-notice">
            <ShieldAlert size={16} color="#C7A86D" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <p>
              You are viewing all registrations platform-wide as an admin.
            </p>
          </div>

          {/* Filters */}
          <div className="admin-regs-filters">
            <div className="admin-regs-filters-row">
              <div className="admin-regs-filter-group">
                <label className="admin-regs-filter-label">Event (name or ID)</label>
                <input
                  type="text"
                  value={eventFilter}
                  onChange={e => setEventFilter(e.target.value)}
                  placeholder="Event name or ID..."
                  className="admin-regs-filter-input"
                />
              </div>
              <div className="admin-regs-filter-group">
                <label className="admin-regs-filter-label">Student (name or ID)</label>
                <input
                  type="text"
                  value={studentFilter}
                  onChange={e => setStudentFilter(e.target.value)}
                  placeholder="Student name or user ID..."
                  className="admin-regs-filter-input"
                />
              </div>
              <div className="admin-regs-filter-group" style={{ flex: '0 0 auto', width: '100%', maxWidth: '200px' }}>
                <label className="admin-regs-filter-label">Status</label>
                <div className="admin-regs-filter-select-wrap">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="admin-regs-filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={16} className="admin-regs-filter-select-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid Area */}
          {view === "loading" && (
            <div className="admin-regs-empty">
              <Loader2 size={32} className="admin-regs-loading-icon text-[#2F5D50]" />
              <p className="admin-regs-error-desc">Loading registrations...</p>
            </div>
          )}

          {view === "error" && (
            <div className="admin-regs-error">
              <AlertCircle size={32} color="#B56E4A" />
              <p className="admin-regs-error-title font-serif">Failed to load registrations</p>
              <p className="admin-regs-error-desc">Check your connection and token.</p>
            </div>
          )}

          {view === "loaded" && (
            <>
              <div className="admin-regs-count">
                Showing <span className="admin-regs-count-bold">{filtered.length}</span> of {regs.length} registrations
              </div>

              {filtered.length === 0 ? (
                <div className="admin-regs-empty">
                  <ClipboardList size={40} color="#DDD6CB" />
                  <p className="admin-regs-error-title font-serif">No registrations match</p>
                  <p className="admin-regs-error-desc">Adjust your filters or verify events exist.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="admin-regs-table-wrap">
                    <table className="admin-regs-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Event</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(r => (
                          <tr key={r._id}>
                            <td className="admin-regs-td-mono">{r._id}</td>
                            <td className="admin-regs-td-primary">{r.student_id?.name || 'Unknown User'}</td>
                            <td className="admin-regs-td-mono">{r.student_id?._id || r.student_id}</td>
                            <td className="admin-regs-td-event">{r.event_id?.title || 'Unknown Event'}</td>
                            <td><StatusBadge status={r.status} /></td>
                            <td className="admin-regs-td-date">{formatDateStr(r.registeredAt)}</td>
                            <td>
                              <InlineStatusPicker
                                value={r.status}
                                onChange={v => handleStatusChange(r._id, v)}
                                saving={saving === r._id}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="admin-regs-mobile-grid">
                    {filtered.map(r => (
                      <div key={r._id} className="admin-regs-card">
                        <div className="admin-regs-card-header">
                          <div>
                            <p className="admin-regs-card-title">{r.student_id?.name || 'Unknown User'}</p>
                            <p className="admin-regs-card-subtitle">{r.student_id?._id || r.student_id}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="admin-regs-card-event">{r.event_id?.title || 'Unknown Event'}</p>
                        <div className="admin-regs-card-meta">
                          <span className="admin-regs-td-mono">{r._id}</span>
                          <span>{formatDateStr(r.registeredAt)}</span>
                        </div>
                        <div className="admin-regs-card-actions">
                          <p className="admin-regs-card-action-label">Update Status</p>
                          <InlineStatusPicker
                            value={r.status}
                            onChange={v => handleStatusChange(r._id, v)}
                            saving={saving === r._id}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
