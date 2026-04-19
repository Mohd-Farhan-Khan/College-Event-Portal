import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ExternalLink, Building2, Upload, ImageIcon, Link2, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';

import '../CreateEvent/CreateEvent.css'; // Re-use the shared form CSS

const API_BASE = 'http://localhost:8000';

/**
 * /admin/colleges/new
 * POST /api/colleges    body: { name (req), location?, description?, logo_url? }
 * POST /api/upload      for logo (kind=generic)
 */
export function AdminCollegeCreate() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  // Submission state
  const [submittedId, setSubmittedId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect non-admin
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  const isValid = name.trim().length > 0;

  // File upload handler
  const handleFileUpload = async (e) => {
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
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        let data;
        try { data = await res.json(); } catch { data = null; }
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setLogoUrl(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError('');
    setSubmittedId('');

    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      };

      const res = await request('/api/colleges', {
        method: 'POST',
        body: payload,
      });

      setSubmittedId(res._id);

      // Reset form
      setName('');
      setLocation('');
      setDescription('');
      setLogoUrl('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create college. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <Navbar />

      <main className="create-event-main">
        <div className="create-event-container">

          {/* Back Link */}
          <Link to="/admin/colleges" className="admin-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--cep-text-secondary)', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Colleges
          </Link>

          {/* Header */}
          <div className="form-header" style={{ marginBottom: '2.5rem' }}>
            <p className="form-header__eyebrow" style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B56E4A', marginBottom: '0.5rem' }}>
              Administration → Colleges
            </p>
            <h1 className="form-header__title font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--cep-text-primary)' }}>
              Create College
            </h1>
            <p className="form-header__desc" style={{ marginTop: '0.5rem', color: 'var(--cep-text-secondary)' }}>
              Add a new college institution to the platform.
            </p>
          </div>

          {/* Success Banner */}
          {submittedId && (
            <div className="success-banner" style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
              <CheckCircle2 size={20} color="#2F5D50" style={{ marginTop: '0.125rem' }} />
              <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                <p className="success-banner__text" style={{ fontWeight: 600 }}>College created!</p>
                <p style={{ fontSize: '0.75rem', color: '#2F5D50', marginTop: '0.125rem', fontFamily: 'monospace' }}>
                  {submittedId}
                </p>
                <Link
                  to={`/admin/colleges/${submittedId}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#2F5D50', marginTop: '0.375rem', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  Open college detail <ExternalLink size={12} />
                </Link>
              </div>
              <button onClick={() => setSubmittedId('')} className="success-banner__close" aria-label="Dismiss">&times;</button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="create-error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Logo Upload Section */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label">Identity</span>
                <div className="form-section__line" />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>College Logo</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--cep-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Link2 size={12} /> {showUrlInput ? 'Upload file' : 'Or paste URL'}
                  </button>
                </div>

                {showUrlInput ? (
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="form-input"
                  />
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="logo-file-input"
                    />

                    {logoUrl ? (
                      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cep-border)', overflow: 'hidden', aspectRatio: '1/1', maxWidth: '10rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cep-background)' }}>
                        <img src={logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(31, 41, 51, 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', lineHeight: 1, border: 'none', cursor: 'pointer' }}
                          aria-label="Remove logo"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--cep-border)', backgroundColor: 'var(--cep-surface)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--cep-text-secondary)', cursor: isUploading ? 'wait' : 'pointer', transition: 'border-color 0.2s ease' }}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--cep-accent-primary)' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--cep-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Upload size={16} color="var(--cep-accent-primary)" />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cep-text-primary)' }}>Click to upload, or drag and drop</span>
                            <span style={{ fontSize: '0.75rem' }}>Square logo recommended — PNG or SVG</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}

                {uploadError && (
                  <p className="form-error-text" style={{ marginTop: '0.375rem' }}>{uploadError}</p>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)', marginTop: '0.375rem', fontStyle: 'italic' }}>
                  Optional. Uploaded URL will be saved to logo_url.
                </p>
              </div>
            </div>

            {/* Required Fields */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label" style={{ color: '#2F5D50' }}>Required</span>
                <div className="form-section__line" style={{ backgroundColor: '#DCE8E1' }} />
              </div>

              <div className="form-group">
                <label htmlFor="college-name" className="form-label">
                  <Building2 size={16} style={{ color: 'var(--cep-text-secondary)' }} />
                  College Name <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="college-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology, Madras"
                  className="form-input form-input--lg"
                  required
                />
                {!name && (
                  <p className="form-error-text">Name is required</p>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label">Optional Details</span>
                <div className="form-section__line" />
              </div>

              <div className="form-group">
                <label htmlFor="college-location" className="form-label">Location</label>
                <input
                  id="college-location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="college-description" className="form-label">Description</label>
                <textarea
                  id="college-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A brief introduction to the college, its programs, and culture..."
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/admin/colleges"
                className="btn btn--outline"
                style={{ flex: 1, height: '3rem', borderRadius: 'var(--radius-lg)', justifyContent: 'center', fontSize: '1rem' }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="btn btn--primary form-submit-btn"
                style={{ flex: 1, margin: 0, opacity: (!isValid || isSubmitting) ? 0.5 : 1, cursor: (!isValid || isSubmitting) ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Creating College...' : 'Create College'}
              </button>
            </div>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
