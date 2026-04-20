import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImageIcon, CheckCircle2, ChevronDown, ExternalLink, Info, Upload, Link2, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request, uploadFile } from '../../services/api';

import '../CreateEvent/CreateEvent.css'; // Re-use event form CSS

const CATEGORIES = ["Tech", "Cultural", "Sports", "Academic", "Workshop", "Other"];

export function AdminCreateEvent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [collegeId, setCollegeId] = useState("");

  // Upload state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  
  const [submittedEventId, setSubmittedEventId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  const isValid = title.trim() && date.trim();

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const data = await uploadFile(file, 'poster');
      setPosterUrl(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError("");
    setSubmittedEventId("");

    try {
      const payload = {
        title: title.trim(),
        // Standardize date to prevent timezone shift
        date: date.trim() + "T00:00:00",
        description: description.trim() || undefined,
        category: category || undefined,
        venue: venue.trim() || undefined,
        poster_url: posterUrl.trim() || undefined,
      };

      if (collegeId.trim()) {
        payload.college = collegeId.trim(); // The backend expects 'college' or 'college_id' natively.
      }

      const res = await request('/api/events', {
        method: 'POST',
        body: payload
      });

      setSubmittedEventId(res._id);
      
      setTitle("");
      setDate("");
      setDescription("");
      setCategory("");
      setVenue("");
      setPosterUrl("");
      setCollegeId("");
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create event. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <Navbar />

      <main className="create-event-main">
        <div className="create-event-container">
          
          {/* Header */}
          <div className="form-header">
            <p className="form-header__eyebrow">Administration</p>
            <h1 className="form-header__title font-serif">Create Event</h1>
            <p className="form-header__desc">Create a new platform event. Admin-created events can optionally be linked to a college.</p>
          </div>

          {/* Success Banner */}
          {submittedEventId && (
            <div className="success-banner" style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
              <CheckCircle2 size={20} color="#2F5D50" style={{ marginTop: '0.125rem' }} />
              <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                <p className="success-banner__text" style={{ fontWeight: 600 }}>Event created successfully!</p>
                <p style={{ fontSize: '0.75rem', color: '#2F5D50', marginTop: '0.125rem' }}>
                  Event ID: <span style={{ fontFamily: 'monospace' }}>{submittedEventId}</span>
                </p>
                <Link to={`/events/${submittedEventId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#2F5D50', marginTop: '0.375rem', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  View public event listing <ExternalLink size={12} />
                </Link>
              </div>
              <button onClick={() => setSubmittedEventId("")} className="success-banner__close" aria-label="Dismiss">&times;</button>
            </div>
          )}

          {error && (
            <div className="create-error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Required Fields */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label" style={{ color: '#2F5D50' }}>Required</span>
                <div className="form-section__line" style={{ backgroundColor: '#DCE8E1' }} />
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Coding Championship 2025"
                  className="form-input form-input--lg"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Event Date <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label">Optional Details</span>
                <div className="form-section__line" />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give participants a clear picture of the event — format, schedule, who should attend..."
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="category" className="form-label">Category</label>
                  <div className="form-select-wrap">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="form-select-icon" />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="venue" className="form-label">Venue</label>
                  <input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Convention Centre, Delhi"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Poster — Upload or URL */}
              <div className="form-group">
                <div className="form-upload-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>Event Poster</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="form-upload-toggle"
                  >
                    <Link2 size={12} /> {showUrlInput ? 'Upload file' : 'Or paste URL'}
                  </button>
                </div>

                {showUrlInput ? (
                  <>
                    <input
                      id="posterUrl"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                      className="form-input"
                    />
                    <div className="poster-preview">
                      {posterUrl ? (
                        <img src={posterUrl} alt="Preview" className="poster-preview__img" onError={(e) => (e.currentTarget.style.display = "none")} />
                      ) : (
                        <div className="poster-preview__empty">
                          <ImageIcon size={24} />
                          <p>Poster preview</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="admin-poster-file-input"
                    />

                    {posterUrl ? (
                      <div className="form-upload-preview">
                        <img src={posterUrl} alt="Poster preview" className="form-upload-preview__img" onError={e => { e.currentTarget.style.display = 'none'; }} />
                        <button
                          type="button"
                          onClick={() => setPosterUrl('')}
                          className="form-upload-preview__remove"
                          aria-label="Remove poster"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`form-upload-zone ${isUploading ? 'form-upload-zone--uploading' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={24} className="icon-spin" style={{ color: 'var(--cep-primary)' }} />
                            <span className="form-upload-zone__text">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <div className="form-upload-zone__icon">
                              <Upload size={16} color="var(--cep-primary)" />
                            </div>
                            <span className="form-upload-zone__text">Click to upload poster</span>
                            <span className="form-upload-zone__hint">JPEG, PNG, WebP or GIF — max 5 MB</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}

                {uploadError && (
                  <p className="form-upload-error">{uploadError}</p>
                )}
              </div>
            </div>

            {/* College Association */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label">College Association</span>
                <div className="form-section__line" />
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', backgroundColor: '#F5F0E4', border: '1px solid #E8D9B8', borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <Info size={16} color="#C7A86D" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: '#9A7B3F', lineHeight: 1.6 }}>
                  Optional: enter a known college ID if this event should be associated with a specific college. There is no dynamic college picker — the ID must be provided manually from an existing college record.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="collegeId" className="form-label">College ID</label>
                <input
                  id="collegeId"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="clg_4b7e2a91d38f0c55"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn btn--primary form-submit-btn"
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
