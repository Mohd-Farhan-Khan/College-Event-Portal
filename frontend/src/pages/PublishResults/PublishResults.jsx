import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';

import '../CreateEvent/CreateEvent.css'; // Re-use select structural classes like .form-group, .form-label
import './PublishResults.css';

export function PublishResults() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [position, setPosition] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'college' && user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'college' && user.role !== 'admin')) return null;

  const isValid = eventId.trim() && studentId.trim() && position.trim() && Number(position) > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      await request('/api/results', {
        method: 'POST',
        body: {
          event_id: eventId.trim(),
          student_id: studentId.trim(),
          position: Number(position),
          certificateUrl: certificateUrl.trim() || undefined
        }
      });

      setSubmitted(true);
      // Optional: don't clear so they can publish another rank for same event quickly
      setStudentId("");
      setPosition("");
      setCertificateUrl("");
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to publish result. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="publish-results-page">
      <Navbar />

      <main className="publish-results-main">
        <div className="publish-results-container">
          
          {/* Header */}
          <div className="form-header">
            <p className="form-header__eyebrow">College Organizer</p>
            <h1 className="form-header__title font-serif">Publish Result</h1>
            <p className="form-header__desc">Record the final result for a student in your event.</p>
          </div>

          {/* Success Banner */}
          {submitted && (
            <div className="success-banner">
              <CheckCircle2 size={20} color="#2F5D50" />
              <p className="success-banner__text">Result published successfully! It will appear on the public results page.</p>
              <button onClick={() => setSubmitted(false)} className="success-banner__close" aria-label="Dismiss">&times;</button>
            </div>
          )}

          {error && (
            <div className="create-error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {/* Guidance Note */}
          <div className="info-banner">
            <AlertCircle size={16} className="info-banner__icon" />
            <p className="info-banner__text">
              Each student and event combination can only have one result. Submitting a duplicate entry for the same student and event will be rejected by the server.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Main Card */}
            <div className="pr-form-section">
              {/* Position */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="position" className="form-label" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Trophy size={16} color="#C7A86D" />
                  Position <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="position"
                  type="number"
                  min={1}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="1"
                  className="position-input"
                  required
                />
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--cep-text-secondary)', marginTop: '0.25rem' }}>
                  Enter 1 for 1st place, 2 for 2nd, and so on
                </p>
              </div>

              <div className="pr-form-divider" />

              {/* Event ID */}
              <div className="form-group">
                <label htmlFor="eventId" className="form-label">
                  Event ID <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="eventId"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="evt_4b7e2a91d38f0c55"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)' }}>
                  The ID of the event you manage. Must be an event owned by your college.
                </p>
              </div>

              {/* Student ID */}
              <div className="form-group">
                <label htmlFor="studentId" className="form-label">
                  Student User ID <span className="form-label__asterisk">*</span>
                </label>
                <input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="usr_8f3a9d2e1c74b560"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)' }}>
                  The user ID of the student who participated.
                </p>
              </div>
            </div>

            {/* Optional Certificate */}
            <div className="pr-form-section">
              <div className="form-section__header">
                <span className="form-section__label">Optional</span>
                <div className="form-section__line" />
              </div>
              <div className="form-group">
                <label htmlFor="certificateUrl" className="form-label">Certificate URL</label>
                <input
                  id="certificateUrl"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)' }}>
                  Leave blank if no certificate is issued. This should be a direct link to a hosted certificate — file uploads are not supported.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn btn--primary form-submit-btn"
            >
              {isSubmitting ? 'Publishing Result...' : 'Publish Result'}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
