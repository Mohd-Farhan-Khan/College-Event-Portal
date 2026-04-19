import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Building2, Trash2,
  Upload, Loader2, Link2, AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminCollegeEdit.css';

/**
 * /admin/colleges/:collegeId/edit
 * GET /api/colleges/:id          (preload)
 * PUT /api/colleges/:id          body: { name, location, description, logo_url }
 * POST /api/upload               kind=generic (logo replacement)
 * DELETE /api/colleges/:id
 */

const API_BASE = 'http://localhost:8000';

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
            <input type="text" value={typed} onChange={e => setTyped(e.target.value)}
              className="confirm-dialog__confirm-input" placeholder={typeToConfirm} autoFocus />
          </div>
        )}
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="confirm-dialog__delete" disabled={!enabled || busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>
            {busy ? 'Deleting...' : (confirmLabel || 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCollegeEdit() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { collegeId } = useParams();

  // Preloaded values (for dirty checking)
  const [original, setOriginal] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  // Page state
  const [pageState, setPageState] = useState('loading'); // loading | loaded | error
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Auth guard
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/events'); return; }
  }, [user, isAuthLoading, navigate]);

  // Fetch college data
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin' || !collegeId) return;
    let cancelled = false;

    async function fetchCollege() {
      setPageState('loading');
      try {
        const data = await request(`/api/colleges/${collegeId}`);
        if (!cancelled) {
          setOriginal(data);
          setName(data.name || '');
          setLocation(data.location || '');
          setDescription(data.description || '');
          setLogoUrl(data.logo_url || '');
          setPageState('loaded');
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setPageState('error'); }
      }
    }

    fetchCollege();
    return () => { cancelled = true; };
  }, [user, isAuthLoading, collegeId]);

  const isDirty = original && (
    name !== (original.name || '') ||
    location !== (original.location || '') ||
    description !== (original.description || '') ||
    logoUrl !== (original.logo_url || '')
  );

  // File upload handler
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'generic');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        let d; try { d = await res.json(); } catch { d = null; }
        throw new Error(d?.message || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setLogoUrl(data.url);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Save handler
  async function handleSave(e) {
    e.preventDefault();
    if (!isDirty || !name.trim()) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await request(`/api/colleges/${collegeId}`, {
        method: 'PUT',
        body: {
          name: name.trim(),
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          logo_url: logoUrl.trim() || undefined,
        },
      });
      setOriginal({ name, location, description, logo_url: logoUrl });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  // Delete handler
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

  if (pageState === 'loading') {
    return (
      <div className="ace-page"><Navbar />
        <main className="ace-main">
          <div className="admin-loading">
            <Loader2 size={32} className="admin-loading__spinner" /><p>Loading college...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="ace-page"><Navbar />
        <main className="ace-main"><div className="ace-container">
          <Link to="/admin/colleges" className="ace-back-link"><ArrowLeft size={16} /> Back to Colleges</Link>
          <div className="admin-error">
            <AlertCircle size={32} className="admin-error__icon" />
            <p className="admin-error__title font-serif">College not found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>
              Check the ID or return to the colleges list.
            </p>
          </div>
        </div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="ace-page">
      <Navbar />
      <main className="ace-main">
        <div className="ace-container">

          <Link to={`/admin/colleges/${collegeId}`} className="ace-back-link">
            <ArrowLeft size={16} /> Back to {original?.name || 'College'}
          </Link>

          {/* Header */}
          <div className="ace-header">
            <p className="ace-eyebrow">Administration → Colleges</p>
            <h1 className="ace-title font-serif">Edit College</h1>
            <p className="ace-subtitle">
              Editing{' '}
              <code className="ace-id-chip">{collegeId}</code>
            </p>
          </div>

          {/* Save success banner */}
          {savedAt && (
            <div className="ace-success-banner">
              <CheckCircle2 size={18} />
              <p className="ace-success-text">
                <strong>Saved.</strong> Changes were updated at {savedAt}.
              </p>
              <button onClick={() => setSavedAt(null)} className="ace-banner-close">&times;</button>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <div className="ace-error-banner">
              <AlertCircle size={18} />
              <p style={{ flex: 1 }}>{saveError}</p>
              <button onClick={() => setSaveError('')} className="ace-banner-close">&times;</button>
            </div>
          )}

          <form className="ace-form" onSubmit={handleSave}>

            {/* Logo Section */}
            <div className="ace-section">
              <div className="ace-section-header">
                <span className="ace-section-label">Identity</span>
                <div className="ace-section-line" />
              </div>

              <div className="ace-form-group">
                <div className="ace-logo-label-row">
                  <label className="ace-label">College Logo</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="ace-toggle-url-btn"
                  >
                    <Link2 size={12} /> {showUrlInput ? 'Upload file' : 'Or paste URL'}
                  </button>
                </div>

                {showUrlInput ? (
                  <input
                    type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png" className="ace-input"
                  />
                ) : (
                  <>
                    <input
                      type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      ref={fileInputRef} onChange={handleFileUpload}
                      style={{ display: 'none' }} id="ace-logo-input"
                    />
                    {logoUrl ? (
                      <div className="ace-logo-preview">
                        <img src={logoUrl} alt="Logo preview" className="ace-logo-preview-img"
                          onError={e => { e.currentTarget.style.display = 'none'; }} />
                        <button type="button" onClick={() => setLogoUrl('')} className="ace-logo-remove" aria-label="Remove logo">&times;</button>
                      </div>
                    ) : (
                      <button
                        type="button" onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading} className="ace-upload-btn"
                      >
                        {isUploading ? (
                          <><Loader2 size={20} className="ace-spin" /><span>Uploading...</span></>
                        ) : (
                          <>
                            <div className="ace-upload-icon-wrap"><Upload size={15} /></div>
                            <span className="ace-upload-label">Click to upload — PNG or SVG</span>
                            <span className="ace-upload-hint">Square logo recommended</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
                {uploadError && <p className="ace-field-error">{uploadError}</p>}
                <p className="ace-field-hint">Uploaded URL saved as logo_url.</p>
              </div>
            </div>

            {/* Required */}
            <div className="ace-section">
              <div className="ace-section-header">
                <span className="ace-section-label ace-section-label--required">Required</span>
                <div className="ace-section-line ace-section-line--green" />
              </div>

              <div className="ace-form-group">
                <label htmlFor="ace-name" className="ace-label">
                  <Building2 size={14} style={{ color: 'var(--cep-text-secondary)' }} />
                  College Name <span className="ace-asterisk">*</span>
                </label>
                <input
                  id="ace-name" value={name} onChange={e => setName(e.target.value)}
                  required className="ace-input ace-input--lg"
                />
              </div>
            </div>

            {/* Optional */}
            <div className="ace-section">
              <div className="ace-section-header">
                <span className="ace-section-label">Optional Details</span>
                <div className="ace-section-line" />
              </div>

              <div className="ace-form-group">
                <label htmlFor="ace-location" className="ace-label">Location</label>
                <input
                  id="ace-location" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="City, State" className="ace-input"
                />
              </div>

              <div className="ace-form-group">
                <label htmlFor="ace-description" className="ace-label">Description</label>
                <textarea
                  id="ace-description" value={description} onChange={e => setDescription(e.target.value)}
                  rows={4} className="ace-textarea"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="ace-action-bar">
              <button
                type="button" className="ace-btn ace-btn--cancel"
                onClick={() => navigate(`/admin/colleges/${collegeId}`)}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={!isDirty || !name.trim() || isSaving}
                className="ace-btn ace-btn--save"
              >
                {isSaving ? 'Saving...' : (isDirty ? 'Save Changes' : 'No changes')}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="ace-danger-zone">
              <h3 className="ace-danger-title font-serif">Danger Zone</h3>
              <p className="ace-danger-desc">Permanently remove this college from the platform.</p>
              <button
                type="button" onClick={() => setShowDelete(true)}
                className="ace-btn-delete"
              >
                <Trash2 size={15} /> Delete College
              </button>
            </div>
          </form>

        </div>
      </main>
      <Footer />

      <ConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); }}
        onConfirm={handleDelete}
        title={`Delete ${original?.name || 'this college'}?`}
        confirmLabel="Delete College"
        typeToConfirm={original?.name}
        description={
          <>
            <p>
              This will permanently remove{' '}
              <strong style={{ color: 'var(--cep-text-primary)' }}>{original?.name}</strong>{' '}
              and break references in events, registrations, and results.
            </p>
            <p style={{ marginTop: '0.5rem' }}>This action cannot be undone.</p>
            {deleteError && <p style={{ color: '#B56E4A', marginTop: '0.5rem', fontWeight: 500 }}>{deleteError}</p>}
          </>
        }
      />
    </div>
  );
}
