import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageIcon, CheckCircle2, ChevronDown } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './CreateEvent.css';

const CATEGORIES = ["Tech", "Cultural", "Sports", "Academic", "Workshop", "Other"];

export function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check: Must be college or admin to create events
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'college' && user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'college' && user.role !== 'admin')) return null;

  const hasRequiredFields = title.trim() && date.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasRequiredFields) return;

    setIsSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      const payload = {
        title: title.trim(),
        date: new Date(date).toISOString(),
      };
      
      if (description.trim()) payload.description = description.trim();
      if (category) payload.category = category;
      if (venue.trim()) payload.venue = venue.trim();
      if (posterUrl.trim()) payload.posterUrl = posterUrl.trim(); // Backend supports poster_url or posterUrl

      await request('/api/events', {
        method: 'POST',
        body: payload
      });

      setSubmitted(true);
      // Reset form on success if desired, or let them navigate away
      setTitle("");
      setDate("");
      setDescription("");
      setCategory("");
      setVenue("");
      setPosterUrl("");
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-event-page">
      <Navbar />

      <main className="create-event-main">
        <div className="create-event-container">
          
          {/* Header */}
          <div className="create-event-header">
            <p className="create-event-header__eyebrow">College Organizer</p>
            <h1 className="create-event-header__title font-serif">Create Event</h1>
            <p className="create-event-header__desc">Publish a new event for your college community.</p>
          </div>

          {/* Success Banner */}
          {submitted && (
            <div className="success-banner">
              <CheckCircle2 size={20} color="#2F5D50" />
              <p className="success-banner__text">Event created successfully! It will appear in the event listing shortly.</p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="success-banner__close"
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          )}

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

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HackTheFuture '25 — 48-Hour Hackathon"
                  className="form-input"
                  required
                />
                {!title && <p className="form-error-text">Title is required</p>}
              </div>

              {/* Date */}
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
                {!date && <p className="form-error-text">Date is required</p>}
              </div>
            </div>

            {/* Optional Section */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__label">Optional Details</span>
                <div className="form-section__line" />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give students a clear sense of what to expect — schedule, format, prizes, who should attend..."
                  rows={4}
                  className="form-textarea"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <div className="form-select-wrap">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="form-select-icon" />
                </div>
              </div>

              {/* Venue */}
              <div className="form-group">
                <label htmlFor="venue" className="form-label">Venue</label>
                <input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Main Auditorium, MIT Pune"
                  className="form-input"
                />
              </div>

              {/* Poster URL */}
              <div className="form-group">
                <label htmlFor="posterUrl" className="form-label">Poster URL</label>
                <input
                  id="posterUrl"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
                {/* Poster Preview */}
                <div className="poster-preview">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt="Poster preview"
                      className="poster-preview__img"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="poster-preview__empty">
                      <ImageIcon size={32} />
                      <p className="poster-preview__text">Poster preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={!hasRequiredFields || isSubmitting}
                className="btn btn--primary form-submit-btn"
              >
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </button>
              <p className="form-submit-hint">
                Your college ID will be attached automatically from your account.
              </p>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
