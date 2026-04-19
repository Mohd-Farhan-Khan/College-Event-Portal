import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, ExternalLink, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './StudentRegistrations.css';

/**
 * /student/registrations
 * GET /api/registrations/me  (also ?status / ?event_id)
 */

const STATUS_CONFIG = {
  confirmed: { bg: '#DCE8E1', text: '#2F5D50', label: 'Confirmed' },
  pending:   { bg: '#F5F0D9', text: '#9A7B3F', label: 'Pending'   },
  cancelled: { bg: '#F5E4D9', text: '#B56E4A', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { bg: '#F0F0F0', text: '#6B6B6B', label: status };
  return (
    <span className="status-badge" style={{ backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function StudentRegistrations() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [viewState, setViewState] = useState('loading'); // loading | loaded | error | empty
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Redirect non-student users
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      navigate('/events');
      return;
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch registrations
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'student') return;

    let cancelled = false;

    async function fetchRegistrations() {
      setViewState('loading');
      try {
        const data = await request('/api/registrations/me');
        if (!cancelled) {
          const arr = Array.isArray(data) ? data : data.data || [];
          setRegistrations(arr);
          setViewState(arr.length === 0 ? 'empty' : 'loaded');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch registrations:', err);
          setViewState('error');
        }
      }
    }

    fetchRegistrations();
    return () => { cancelled = true; };
  }, [user, isAuthLoading]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: registrations.length,
      pending: registrations.filter(r => r.status === 'pending').length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
    };
  }, [registrations]);

  const STATUSES = [
    { value: 'all',       label: 'All',       count: statusCounts.all },
    { value: 'pending',   label: 'Pending',   count: statusCounts.pending },
    { value: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];

  // Client-side filtering
  const filtered = useMemo(() => {
    return registrations.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const eventTitle = r.event_id?.title || '';
      const eventId = r.event_id?._id || r.event_id || '';
      const matchesSearch = !search ||
        eventTitle.toLowerCase().includes(search.toLowerCase()) ||
        String(eventId).includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [registrations, statusFilter, search]);

  if (isAuthLoading || !user || user.role !== 'student') return null;

  return (
    <div className="student-regs-page">
      <Navbar />

      <main className="student-regs-main">
        <div className="student-regs-container">

          {/* Header */}
          <div className="student-regs-header">
            <p className="student-regs-header__eyebrow">Your Activity</p>
            <h1 className="student-regs-header__title font-serif">My Registrations</h1>
            <p className="student-regs-header__desc">
              All events you've signed up for. Track confirmations and revisit upcoming sessions.
            </p>
          </div>

          {/* Status Tabs */}
          {['loaded', 'empty'].includes(viewState) && (
            <div className="student-regs-tabs">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`student-regs-tab ${statusFilter === s.value ? 'student-regs-tab--active' : ''}`}
                >
                  {s.label}
                  <span className="student-regs-tab__count">{s.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {['loaded', 'empty'].includes(viewState) && (
            <div className="student-regs-search-wrap">
              <Search size={16} className="student-regs-search-icon" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by event title or event ID..."
                className="student-regs-search-input"
              />
            </div>
          )}

          {/* Loading State */}
          {viewState === 'loading' && (
            <div className="student-regs-loading">
              <Loader2 size={32} className="student-regs-loading__spinner" />
              <p>Loading your registrations...</p>
            </div>
          )}

          {/* Error State */}
          {viewState === 'error' && (
            <div className="student-regs-error">
              <AlertCircle size={32} className="student-regs-error__icon" />
              <p className="student-regs-error__title font-serif">Couldn't load your registrations</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>
                Check your connection and try again.
              </p>
            </div>
          )}

          {/* Loaded State */}
          {viewState === 'loaded' && (
            <>
              {filtered.length === 0 ? (
                <div className="student-regs-empty">
                  <ClipboardList size={48} className="student-regs-empty__icon" />
                  <p className="student-regs-empty__title font-serif">No registrations yet</p>
                  <p className="student-regs-empty__desc">
                    {search || statusFilter !== 'all'
                      ? 'No registrations match your filters.'
                      : "Browse events and sign up — your registrations will appear here."}
                  </p>
                  <Link to="/events" className="btn btn--primary student-regs-empty__cta">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="student-regs-table-wrap">
                    <table className="student-regs-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Venue</th>
                          <th>Status</th>
                          <th>Registered</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(r => {
                          const event = r.event_id || {};
                          const eventId = event._id || r.event_id;
                          const eventTitle = event.title || 'Event';
                          const eventDate = event.date;
                          const eventVenue = event.venue || '—';

                          return (
                            <tr key={r._id}>
                              <td>
                                <p className="student-regs-td-event">{eventTitle}</p>
                                <p className="student-regs-td-id">{r._id}</p>
                              </td>
                              <td>
                                <div className="student-regs-td-meta">
                                  <Calendar size={14} /> {formatDate(eventDate)}
                                </div>
                              </td>
                              <td>
                                <div className="student-regs-td-venue">
                                  <MapPin size={14} />
                                  <span>{eventVenue}</span>
                                </div>
                              </td>
                              <td><StatusBadge status={r.status} /></td>
                              <td className="student-regs-td-date">{formatDate(r.registeredAt)}</td>
                              <td>
                                <Link
                                  to={`/events/${eventId}`}
                                  className="view-link-btn"
                                >
                                  View Event <ExternalLink size={12} />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="student-regs-mobile-list">
                    {filtered.map(r => {
                      const event = r.event_id || {};
                      const eventId = event._id || r.event_id;
                      const eventTitle = event.title || 'Event';
                      const eventDate = event.date;
                      const eventVenue = event.venue || '—';

                      return (
                        <div key={r._id} className="student-regs-mobile-card">
                          <div className="student-regs-mobile-card__header">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="student-regs-mobile-card__title">{eventTitle}</p>
                              <p className="student-regs-mobile-card__id">{r._id}</p>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>
                          <div className="student-regs-mobile-card__meta">
                            <div className="student-regs-mobile-card__meta-item">
                              <Calendar size={14} /> {formatDate(eventDate)}
                            </div>
                            <div className="student-regs-mobile-card__meta-item">
                              <MapPin size={14} /> <span>{eventVenue}</span>
                            </div>
                          </div>
                          <div className="student-regs-mobile-card__footer">
                            <span className="student-regs-mobile-card__date">
                              Registered {formatDate(r.registeredAt)}
                            </span>
                            <Link to={`/events/${eventId}`} className="student-regs-mobile-card__view">
                              View Event <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Empty data state (no registrations at all) */}
          {viewState === 'empty' && (
            <div className="student-regs-empty">
              <ClipboardList size={48} className="student-regs-empty__icon" />
              <p className="student-regs-empty__title font-serif">No registrations yet</p>
              <p className="student-regs-empty__desc">
                Browse events and sign up — your registrations will appear here.
              </p>
              <Link to="/events" className="btn btn--primary student-regs-empty__cta">
                Browse Events
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
