import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImageIcon, CheckCircle2, ChevronDown, ExternalLink, Info } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError("");
    setSubmittedEventId("");

    try {
      const payload = {
        title: title.trim(),
        date: date.trim(),
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

              <div className="form-group">
                <label htmlFor="posterUrl" className="form-label">Poster URL</label>
                <input
                  id="posterUrl"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
                
                <div className="form-poster-preview">
                  {posterUrl ? (
                    <img src={posterUrl} alt="Preview" className="form-poster-img" onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="form-poster-empty">
                      <ImageIcon size={24} />
                      <p>Poster preview</p>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)', marginTop: '0.5rem' }}>
                  Image upload is not supported. Provide a publicly accessible image URL.
                </p>
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
