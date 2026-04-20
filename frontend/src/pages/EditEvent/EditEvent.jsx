import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImageIcon, ChevronDown, Upload, Link2, Loader2, ArrowLeft, Info } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request, uploadFile, getEvent } from '../../services/api';
import '../CreateEvent/CreateEvent.css';

const CATEGORIES = ["Tech", "Cultural", "Sports", "Academic", "Workshop", "Other"];

export function EditEvent() {
  const { eventId } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [collegeId, setCollegeId] = useState(""); // Only used by admins
  
  // Upload state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security & data fetching
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'college' && user.role !== 'admin') {
      navigate('/events');
      return;
    }

    async function fetchEvent() {
      try {
        const data = await getEvent(eventId);
        
        // Ensure user can edit
        const isOwner = user.role === 'college' && user.college_id === data.college_id?._id;
        const isAdmin = user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
          navigate('/events');
          return;
        }

        setTitle(data.title || "");
        if (data.date) {
          setDate(data.date.split('T')[0]); // Extact YYYY-MM-DD
        }
        setDescription(data.description || "");
        setCategory(data.category || "");
        setVenue(data.venue || "");
        setPosterUrl(data.poster_url || "");
        if (isAdmin && data.college_id) {
          setCollegeId(data.college_id._id);
        }
        
      } catch (err) {
        setError("Failed to load event details. It may have been removed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || (user.role !== 'college' && user.role !== 'admin')) return null;

  const isAdmin = user.role === 'admin';
  const hasRequiredFields = title.trim() && date.trim();

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasRequiredFields) return;

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        date: date + "T00:00:00",
        description: description.trim() || undefined,
        category: category || undefined,
        venue: venue.trim() || undefined,
        poster_url: posterUrl.trim() || undefined,
      };
      
      if (isAdmin && collegeId.trim()) {
        payload.college = collegeId.trim();
      } else if (isAdmin && !collegeId.trim()) {
        // If admin clears college, how to send? Depends on backend. Let's just omit it or send null.
        // We'll just omit it, though removing existing college might require an explicit null.
      }

      await request(`/api/events/${eventId}`, {
        method: 'PUT',
        body: payload
      });

      navigate(`/events/${eventId}`);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="create-event-page">
        <Navbar />
        <main className="create-event-main">
          <div className="create-event-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} className="icon-spin" color="var(--cep-primary)" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <Navbar />

      <main className="create-event-main">
        <div className="create-event-container">
          
          {/* Back Navigation */}
          <Link to={`/events/${eventId}`} className="btn btn--outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', border: 'none', padding: '0', color: '#6B6B6B' }}>
            <ArrowLeft size={16} /> Back to Event
          </Link>
          
          {/* Header */}
          <div className="create-event-header">
            <p className="create-event-header__eyebrow">{isAdmin ? 'Administration' : 'College Organizer'}</p>
            <h1 className="create-event-header__title font-serif">Edit Event</h1>
            <p className="create-event-header__desc">Update details for {title || 'this event'}.</p>
          </div>

          {error && (
            <div className="create-error mb-6">
              {error}
            </div>
          )}

          <form className="create-event-form" onSubmit={handleSubmit}>
            {/* Required Section */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label form-section__label--required">Required Fields</span>
                <div className="form-section__line form-section__line--required" />
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
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

            {/* Optional Section */}
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
                  rows={4}
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
                    className="form-input"
                  />
                </div>
              </div>

              {/* Poster Upload */}
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
                      id="poster-file-input"
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
                {uploadError && <p className="form-upload-error">{uploadError}</p>}
              </div>
            </div>

            {/* Admin College ID */}
            {isAdmin && (
              <div className="form-section">
                <div className="form-section__header">
                  <span className="form-section__label">College Association</span>
                  <div className="form-section__line" />
                </div>

                <div style={{ display: 'flex', gap: '0.625rem', backgroundColor: '#F5F0E4', border: '1px solid #E8D9B8', borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1.25rem' }}>
                  <Info size={16} color="#C7A86D" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.75rem', color: '#9A7B3F', lineHeight: 1.6 }}>
                    Optional: enter a known college ID if this event should be associated with a specific college.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="collegeId" className="form-label">College ID</label>
                  <input
                    id="collegeId"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="clg_..."
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={!hasRequiredFields || isSubmitting}
                className="btn btn--primary form-submit-btn"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
