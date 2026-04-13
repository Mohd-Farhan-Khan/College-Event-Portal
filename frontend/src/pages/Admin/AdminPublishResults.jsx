import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Trophy, ExternalLink, XCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminPublishResults.css';

export function AdminPublishResults() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [position, setPosition] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [submitState, setSubmitState] = useState("idle"); // "idle", "success", "conflict", "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [newResultId, setNewResultId] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  const isValid = eventId.trim() && studentId.trim() && position.trim() && Number(position) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitState("idle");
    setErrorMsg("");

    try {
      const res = await request('/api/results', {
        method: 'POST',
        body: {
          event_id: eventId.trim(),
          student_id: studentId.trim(),
          position: Number(position),
          certificate_url: certUrl.trim() || undefined
        }
      });

      setNewResultId(res._id || "Published");
      setSubmitState("success");

      // Clear form
      setEventId("");
      setStudentId("");
      setPosition("");
      setCertUrl("");

    } catch (err) {
      console.error(err);
      if (err.status === 409) {
        setSubmitState("conflict");
      } else {
        setSubmitState("error");
        setErrorMsg(err.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="admin-layout-page">
      <Navbar />
      <main className="admin-publish-main">
        <div className="admin-publish-container">

          {/* Header */}
          <div className="admin-publish-header">
            <p className="admin-regs-eyebrow">Administration</p>
            <h1 className="admin-regs-title font-serif">Publish Result</h1>
            <p className="admin-regs-desc">Record a final result for any student in any event on the platform.</p>
          </div>

          {/* Success Banner */}
          {submitState === "success" && (
            <div className="admin-publish-banner admin-publish-banner--success">
              <CheckCircle2 size={20} className="admin-publish-banner-title--success" style={{ marginTop: '0.125rem' }} />
              <div className="admin-publish-banner-content">
                <p className="admin-publish-banner-title admin-publish-banner-title--success">Result published successfully!</p>
                {newResultId && <p className="admin-publish-banner-text admin-publish-banner-title--success admin-publish-banner-text-mono">{newResultId}</p>}
                <Link to="/results" className="admin-publish-banner-link">
                  View on Results page <ExternalLink size={12} />
                </Link>
              </div>
              <button onClick={() => setSubmitState("idle")} className="admin-publish-banner-close admin-publish-banner-close--success">&times;</button>
            </div>
          )}

          {/* 409 Conflict Banner */}
          {submitState === "conflict" && (
            <div className="admin-publish-banner admin-publish-banner--conflict">
              <XCircle size={20} className="admin-publish-banner-title--conflict" style={{ marginTop: '0.125rem' }} />
              <div className="admin-publish-banner-content">
                <p className="admin-publish-banner-title admin-publish-banner-title--conflict">Duplicate result — 409 Conflict</p>
                <p className="admin-publish-banner-text admin-publish-banner-title--conflict" style={{ marginTop: '0.25rem' }}>
                  A result for this student/event combination already exists. Each student can only have one result per event. Check the Results page and update if needed.
                </p>
              </div>
              <button onClick={() => setSubmitState("idle")} className="admin-publish-banner-close admin-publish-banner-close--conflict">&times;</button>
            </div>
          )}

          {/* General Error Banner */}
          {submitState === "error" && (
            <div className="admin-publish-banner admin-publish-banner--conflict">
              <AlertCircle size={20} className="admin-publish-banner-title--conflict" style={{ marginTop: '0.125rem' }} />
              <div className="admin-publish-banner-content">
                <p className="admin-publish-banner-title admin-publish-banner-title--conflict">Submission failed</p>
                <p className="admin-publish-banner-text admin-publish-banner-title--conflict" style={{ marginTop: '0.25rem' }}>
                  {errorMsg}
                </p>
              </div>
              <button onClick={() => setSubmitState("idle")} className="admin-publish-banner-close admin-publish-banner-close--conflict">&times;</button>
            </div>
          )}

          {/* Guidance Note */}
          <div className="admin-publish-notice">
            <AlertCircle size={16} color="#B56E4A" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <div className="admin-publish-notice-text">
              <p>
                <span className="admin-publish-notice-strong">Duplicate prevention:</span> Each student/event pair can only have one result. A duplicate submission will return <span className="admin-publish-notice-code">409 Conflict</span>.
              </p>
              <p>
                <span className="admin-publish-notice-strong">Admin scope:</span> As an admin, you can publish results for any event on the platform regardless of college association. Organizing colleges can only select their own events.
              </p>
            </div>
          </div>

          <form className="admin-publish-form" onSubmit={handleSubmit}>
            {/* Core Card */}
            <div className="admin-publish-card">
              <div className="admin-publish-card-divider">
                <span className="admin-publish-card-label admin-publish-card-label--req">Required</span>
                <div className="admin-publish-card-line admin-publish-card-line--req" />
              </div>

              {/* Position */}
              <div className="admin-publish-field">
                <label htmlFor="position" className="admin-publish-label">
                  <Trophy size={16} color="#C7A86D" />
                  Final Position <span className="admin-publish-asterisk">*</span>
                </label>
                <input
                  id="position"
                  type="number"
                  min="1"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="1"
                  className="admin-publish-input admin-publish-input--large"
                  required
                />
                <p className="admin-publish-hint admin-publish-hint--center">1 = 1st place · 2 = 2nd · and so on</p>
              </div>

              <div className="admin-publish-divider-line" />

              {/* Event ID */}
              <div className="admin-publish-field">
                <label htmlFor="eventId" className="admin-publish-label">
                  Event ID <span className="admin-publish-asterisk">*</span>
                </label>
                <input
                  id="eventId"
                  value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  placeholder="evt_4b7e2a91d38f0c55"
                  className="admin-publish-input admin-publish-input--mono"
                  required
                />
                <p className="admin-publish-hint">The ID of an existing event. Must already be in the database.</p>
              </div>

              {/* Student ID */}
              <div className="admin-publish-field">
                <label htmlFor="studentId" className="admin-publish-label">
                  Student User ID <span className="admin-publish-asterisk">*</span>
                </label>
                <input
                  id="studentId"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="usr_8f3a9d2e1c74b560"
                  className="admin-publish-input admin-publish-input--mono"
                  required
                />
                <p className="admin-publish-hint">The user ID of the student who participated. Must be a registered user.</p>
              </div>
            </div>

            {/* Certificate URL */}
            <div className="admin-publish-card" style={{ gap: '1rem', padding: '1.5rem 2rem' }}>
              <div className="admin-publish-card-divider">
                <span className="admin-publish-card-label admin-publish-card-label--opt">Optional</span>
                <div className="admin-publish-card-line admin-publish-card-line--opt" />
              </div>
              <div className="admin-publish-field">
                <label htmlFor="certUrl" className="admin-publish-label">Certificate URL</label>
                <input
                  id="certUrl"
                  value={certUrl}
                  onChange={e => setCertUrl(e.target.value)}
                  placeholder="https://..."
                  className="admin-publish-input"
                />
                <p className="admin-publish-hint" style={{ marginTop: '0.25rem' }}>
                  Leave blank if no certificate is issued. File upload and certificate generation are not supported — provide a direct link to a hosted certificate only.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid}
              className="admin-publish-btn"
            >
              Publish Result
            </button>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}
