import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronDown, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';

import '../Results/Results.css'; // Re-use table structure token classes
import '../CollegeDashboard/CollegeDashboard.css'; // Re-use StatusBadge
import './ManageRegistrations.css';

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];

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

function StatusSelector({ value, onChange, saving }) {
  return (
    <div className="status-selector">
      <div className="status-selector__select-wrap">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={saving}
          className="status-selector__select"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <ChevronDown size={12} className="status-selector__icon" />
      </div>
      {saving && <Loader2 size={14} className="status-selector__spinner" />}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function ManageRegistrations() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [regs, setRegs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'college' && user.role !== 'admin') {
      navigate('/events');
      return;
    }

    let cancelled = false;

    async function fetchRegs() {
      try {
        const data = await request('/api/registrations');
        if (!cancelled) {
          // Normalize legacy 'registered' state into 'pending' 
          const cleanData = Array.isArray(data) ? data : data.data || [];
          setRegs(cleanData.map(r => ({ ...r, status: r.status === 'registered' ? 'pending' : r.status })));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load registrations.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchRegs();
    return () => { cancelled = true; };
  }, [user, navigate]);

  if (!user || (user.role !== 'college' && user.role !== 'admin')) return null;

  async function handleStatusChange(id, newStatus) {
    setSaving(id);
    try {
      await request(`/api/registrations/${id}`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      setRegs((prev) => prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error("Failed to update status", err);
      alert(err.message || "Failed to update registration status.");
    } finally {
      setSaving(null);
    }
  }

  const filtered = useMemo(() => {
    return regs.filter((r) => {
      const eId = r.event_id?._id || '';
      const eTitle = r.event_id?.title || '';
      
      const matchEvent = !eventFilter || 
        eId.includes(eventFilter) || 
        eTitle.toLowerCase().includes(eventFilter.toLowerCase());
        
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchEvent && matchStatus;
    });
  }, [regs, eventFilter, statusFilter]);

  return (
    <div className="manage-regs-page">
      <Navbar />

      <main className="manage-regs-main">
        <div className="manage-regs-container">
          
          {/* Header */}
          <div className="manage-regs-header">
            <p className="manage-regs-header__eyebrow">College Organizer</p>
            <h1 className="manage-regs-header__title font-serif">Registrations</h1>
            <p className="manage-regs-header__desc">Review and update student registrations for your events.</p>
          </div>

          {/* Filters */}
          <div className="regs-filter-bar">
            <div className="regs-filter-row">
              <div className="regs-filter-group">
                <label className="regs-filter-label">Filter by Event</label>
                <input
                  type="text"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  placeholder="Event name or ID..."
                  className="regs-input"
                />
              </div>
              <div className="regs-filter-group regs-select-wrap">
                <label className="regs-filter-label">Status</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="regs-input"
                    style={{ paddingRight: '2rem', appearance: 'none' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={16} className="regs-select-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Count */}
          <div className="regs-count">
            <strong>{filtered.length}</strong> registration{filtered.length !== 1 ? "s" : ""}
          </div>

          {error && (
            <div className="create-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Table / Cards */}
          {isLoading ? (
            <div className="regs-empty">
              <Loader2 size={32} className="regs-empty__icon status-selector__spinner" style={{ animation: 'spin 1s linear infinite' }} />
              <p className="regs-empty__title font-serif">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="regs-empty">
              <ClipboardList size={40} className="regs-empty__icon" />
              <p className="regs-empty__title font-serif">No registrations found</p>
              <p className="regs-empty__desc">Try adjusting your filters, or create an event to get started.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table (Re-use regs-wrap from dashboard) */}
              <div className="regs-wrap hidden sm:block">
                <table className="regs-table" style={{ display: 'table' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r._id}>
                        <td className="regs-td-date" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {r._id.substring(0, 8)}...
                        </td>
                        <td className="regs-td-student">{r.student_id?.name || 'Unknown User'}</td>
                        <td className="regs-td-event" style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.event_id?.title || r.event_id || 'Unknown Event'}
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td className="regs-td-date">{formatDate(r.registeredAt)}</td>
                        <td>
                          <StatusSelector 
                            value={r.status} 
                            onChange={(v) => handleStatusChange(r._id, v)} 
                            saving={saving === r._id} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="regs-mobile-list sm:hidden" style={{ display: 'flex', gap: '0.75rem' }}>
                {filtered.map((r) => (
                  <div key={r._id} className="regs-mobile-card" style={{ border: '1px solid var(--cep-border)', borderRadius: '1rem', backgroundColor: 'var(--cep-surface)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="regs-mobile-card-row" style={{ alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div>
                        <p className="regs-mobile-student">{r.student_id?.name || 'Unknown User'}</p>
                        <p className="regs-mobile-event" style={{ marginTop: '0.125rem' }}>{r.event_id?.title || 'Unknown Event'}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="regs-mobile-card-row" style={{ marginTop: '0.5rem' }}>
                      <p className="regs-mobile-date" style={{ fontFamily: 'monospace' }}>{r._id.substring(0, 8)}...</p>
                      <p className="regs-mobile-date">{formatDate(r.registeredAt)}</p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--cep-border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--cep-text-secondary)', marginBottom: '0.5rem' }}>Update Status</p>
                      <StatusSelector 
                        value={r.status} 
                        onChange={(v) => handleStatusChange(r._id, v)} 
                        saving={saving === r._id} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
