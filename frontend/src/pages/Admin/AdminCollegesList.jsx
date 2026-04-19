import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, Eye, Pencil, Trash2, MapPin, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminCollegesList.css';

/**
 * /admin/colleges
 * GET /api/colleges
 * DELETE /api/colleges/:id
 */

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

/** Confirm Dialog for destructive actions */
function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, typeToConfirm }) {
  const [typed, setTyped] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset typed text when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTyped('');
      setIsDeleting(false);
    }
  }, [open]);

  if (!open) return null;

  const isConfirmEnabled = !typeToConfirm || typed === typeToConfirm;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="confirm-dialog__title font-serif">{title}</h2>
        <div className="confirm-dialog__desc">
          {description}
        </div>
        {typeToConfirm && (
          <div className="confirm-dialog__confirm-field">
            <p className="confirm-dialog__confirm-label">
              Type <strong>{typeToConfirm}</strong> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              className="confirm-dialog__confirm-input"
              placeholder={typeToConfirm}
              autoFocus
            />
          </div>
        )}
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__cancel" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            className="confirm-dialog__delete"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isDeleting}
          >
            {isDeleting ? 'Deleting...' : (confirmLabel || 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCollegesList() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [viewState, setViewState] = useState('loading'); // loading | loaded | error | empty
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Redirect non-admin
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
  }, [user, isAuthLoading, navigate]);

  // Fetch colleges
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin') return;

    let cancelled = false;

    async function fetchColleges() {
      setViewState('loading');
      try {
        const data = await request('/api/colleges');
        if (!cancelled) {
          const arr = Array.isArray(data) ? data : data.data || [];
          setColleges(arr);
          setViewState(arr.length === 0 ? 'empty' : 'loaded');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch colleges:', err);
          setViewState('error');
        }
      }
    }

    fetchColleges();
    return () => { cancelled = true; };
  }, [user, isAuthLoading]);

  // Filter + Sort
  const filtered = useMemo(() => {
    let list = colleges.filter(c => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c._id || '').includes(q);
    });

    list.sort((a, b) => {
      switch (sort) {
        case 'name-asc':  return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'newest':    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default: return 0;
      }
    });

    return list;
  }, [colleges, query, sort]);

  // Delete handler
  async function handleDelete() {
    if (!toDelete) return;
    setDeleteError('');
    try {
      await request(`/api/colleges/${toDelete._id}`, { method: 'DELETE' });
      setColleges(prev => {
        const updated = prev.filter(c => c._id !== toDelete._id);
        if (updated.length === 0) setViewState('empty');
        return updated;
      });
      setToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError(err.message || 'Failed to delete college.');
    }
  }

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="admin-colleges-page">
      <Navbar />

      <main className="admin-colleges-main">
        <div className="admin-colleges-container">

          {/* Header */}
          <div className="admin-colleges-header-row">
            <div>
              <p className="admin-eyebrow">Administration</p>
              <h1 className="admin-title font-serif">Colleges</h1>
              <p className="admin-desc">Manage all colleges on the platform.</p>
            </div>
            <Link
              to="/admin/colleges/new"
              className="btn btn--primary"
              style={{ borderRadius: 'var(--radius-xl)', gap: '0.375rem' }}
            >
              <Plus size={16} /> New College
            </Link>
          </div>

          {/* Filters */}
          {['loaded', 'empty'].includes(viewState) && (
            <div className="admin-colleges-filters">
              <div className="admin-colleges-search-wrap">
                <Search size={16} className="admin-colleges-search-icon" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or college ID..."
                  className="admin-colleges-search-input"
                />
              </div>
              <div className="admin-colleges-sort-wrap">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="admin-colleges-sort-select"
                >
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <ChevronDown size={16} className="admin-colleges-sort-icon" />
              </div>
            </div>
          )}

          {/* Count */}
          {viewState === 'loaded' && (
            <p className="admin-colleges-count">
              Showing <strong>{filtered.length}</strong> of {colleges.length} colleges
            </p>
          )}

          {/* Loading State */}
          {viewState === 'loading' && (
            <div className="admin-loading">
              <Loader2 size={32} className="admin-loading__spinner" />
              <p>Loading colleges...</p>
            </div>
          )}

          {/* Error State */}
          {viewState === 'error' && (
            <div className="admin-error">
              <AlertCircle size={32} className="admin-error__icon" />
              <p className="admin-error__title font-serif">Couldn't load colleges</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>
                Check your connection and try again.
              </p>
            </div>
          )}

          {/* Empty State (zero colleges) */}
          {viewState === 'empty' && !query && (
            <div className="admin-empty">
              <Building2 size={40} className="admin-empty__icon" />
              <p className="admin-error__title font-serif">No colleges yet</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>
                Create the first college on the platform to get started.
              </p>
              <Link to="/admin/colleges/new" className="btn btn--primary" style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-xl)', gap: '0.375rem' }}>
                <Plus size={16} /> Create First College
              </Link>
            </div>
          )}

          {/* Loaded Data */}
          {viewState === 'loaded' && (
            <>
              {filtered.length === 0 ? (
                <div className="admin-empty">
                  <Search size={40} className="admin-empty__icon" />
                  <p className="admin-error__title font-serif">No colleges match</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>
                    Try a different search term.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="admin-table-wrap" style={{ display: 'none' }}>
                    <table className="admin-table" style={{ display: 'table' }}>
                      <thead>
                        <tr>
                          <th>College</th>
                          <th>Location</th>
                          <th>ID</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(c => (
                          <tr key={c._id}>
                            <td>
                              <div className="admin-colleges-td-name">
                                {c.logo_url ? (
                                  <img src={c.logo_url} alt={c.name} className="college-logo-img" />
                                ) : (
                                  <div className="college-logo-placeholder">
                                    {(c.name || '??').substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="admin-colleges-td-name__info">
                                  <p className="admin-colleges-td-name__label">{c.name}</p>
                                  <p className="admin-colleges-td-name__desc">{c.description || ''}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="admin-colleges-td-location">
                                <MapPin size={14} /> {c.location || '—'}
                              </div>
                            </td>
                            <td className="admin-td-id">{c._id}</td>
                            <td className="admin-td-date">{formatDate(c.createdAt)}</td>
                            <td>
                              <div className="admin-colleges-actions">
                                <Link to={`/admin/colleges/${c._id}`} className="admin-colleges-action-btn" title="View">
                                  <Eye size={16} />
                                </Link>
                                <Link to={`/admin/colleges/${c._id}/edit`} className="admin-colleges-action-btn" title="Edit">
                                  <Pencil size={16} />
                                </Link>
                                <button
                                  className="admin-colleges-action-btn admin-colleges-action-btn--danger"
                                  title="Delete"
                                  onClick={() => { setDeleteError(''); setToDelete(c); }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Responsive: show table on sm+ */}
                  <style>{`
                    @media (min-width: 640px) {
                      .admin-colleges-page .admin-table-wrap { display: block !important; }
                    }
                  `}</style>

                  {/* Mobile Cards */}
                  <div className="admin-colleges-mobile-list">
                    {filtered.map(c => (
                      <div key={c._id} className="admin-colleges-mobile-card">
                        <div className="admin-colleges-mobile-card__header">
                          <div className="college-logo-placeholder">
                            {(c.name || '??').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="admin-colleges-mobile-card__info">
                            <p className="admin-colleges-mobile-card__name">{c.name}</p>
                            <p className="admin-colleges-mobile-card__location">
                              <MapPin size={12} /> {c.location || '—'}
                            </p>
                          </div>
                        </div>
                        <p className="admin-colleges-mobile-card__desc">{c.description || ''}</p>
                        <p className="admin-colleges-mobile-card__id">{c._id}</p>
                        <div className="admin-colleges-mobile-card__footer">
                          <span className="admin-colleges-mobile-card__date">{formatDate(c.createdAt)}</span>
                          <div className="admin-colleges-mobile-card__actions">
                            <Link to={`/admin/colleges/${c._id}`} className="admin-colleges-mobile-action">View</Link>
                            <Link to={`/admin/colleges/${c._id}/edit`} className="admin-colleges-mobile-action">Edit</Link>
                            <button
                              onClick={() => { setDeleteError(''); setToDelete(c); }}
                              className="admin-colleges-mobile-action admin-colleges-mobile-action--danger"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={!!toDelete}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
            title={`Delete ${toDelete?.name}?`}
            confirmLabel="Delete College"
            typeToConfirm={toDelete?.name}
            description={
              <>
                <p>You're about to permanently delete this college from the platform.</p>
                <p>All associated events, registrations, and results will be removed. This action cannot be undone.</p>
                {deleteError && (
                  <p style={{ color: '#B56E4A', marginTop: '0.5rem', fontWeight: 500 }}>{deleteError}</p>
                )}
                <span className="confirm-dialog__endpoint">
                  DELETE /api/colleges/{toDelete?._id}
                </span>
              </>
            }
          />

        </div>
      </main>

      <Footer />
    </div>
  );
}
