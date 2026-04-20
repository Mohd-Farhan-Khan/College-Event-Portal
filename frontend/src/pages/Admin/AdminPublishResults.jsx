import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Trophy, ExternalLink, XCircle, Upload, Link2, Loader2, FileText, Sparkles } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request, uploadFile, generateCertificate } from '../../services/api';
import './AdminPublishResults.css';

export function AdminPublishResults() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [position, setPosition] = useState("");
  const [certUrl, setCertUrl] = useState("");

  // Certificate mode: 'none' | 'url' | 'upload' | 'auto'
  const [certMode, setCertMode] = useState("none");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const certFileRef = useRef(null);

  // Auto-generate state
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Certificate file upload handler
  const handleCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const data = await uploadFile(file, 'certificate');
      setCertUrl(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload certificate.');
    } finally {
      setIsUploading(false);
      if (certFileRef.current) certFileRef.current.value = '';
    }
  };

  // Auto-generate certificate after result is published
  const handleAutoGenerate = async (resultId) => {
    setIsGenerating(true);
    try {
      const updated = await generateCertificate(resultId);
      setCertUrl(updated.certificate_url || '');
    } catch (err) {
      console.error('Certificate generation error:', err);
      setUploadError(err.message || 'Failed to generate certificate.');
    } finally {
      setIsGenerating(false);
    }
  };

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

      // Auto-generate certificate if that mode was selected
      if (certMode === 'auto' && res._id) {
        await handleAutoGenerate(res._id);
      }

      // Clear form
      setEventId("");
      setStudentId("");
      setPosition("");
      if (certMode !== 'auto') setCertUrl("");

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
                {certUrl && certMode === 'auto' && (
                  <p className="admin-publish-banner-text admin-publish-banner-title--success" style={{ marginTop: '0.25rem' }}>
                    ✓ Certificate auto-generated
                  </p>
                )}
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

            {/* Certificate Section */}
            <div className="admin-publish-card" style={{ gap: '1rem', padding: '1.5rem 2rem' }}>
              <div className="admin-publish-card-divider">
                <span className="admin-publish-card-label admin-publish-card-label--opt">Optional — Certificate</span>
                <div className="admin-publish-card-line admin-publish-card-line--opt" />
              </div>

              {/* Certificate Mode Selector */}
              <div className="cert-mode-selector">
                <button
                  type="button"
                  onClick={() => { setCertMode("none"); setCertUrl(""); setUploadError(""); }}
                  className={`cert-mode-btn ${certMode === 'none' ? 'cert-mode-btn--active' : ''}`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => { setCertMode("url"); setUploadError(""); }}
                  className={`cert-mode-btn ${certMode === 'url' ? 'cert-mode-btn--active' : ''}`}
                >
                  <Link2 size={14} /> URL
                </button>
                <button
                  type="button"
                  onClick={() => { setCertMode("upload"); setUploadError(""); }}
                  className={`cert-mode-btn ${certMode === 'upload' ? 'cert-mode-btn--active' : ''}`}
                >
                  <Upload size={14} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => { setCertMode("auto"); setCertUrl(""); setUploadError(""); }}
                  className={`cert-mode-btn ${certMode === 'auto' ? 'cert-mode-btn--active' : ''}`}
                >
                  <Sparkles size={14} /> Auto-Generate
                </button>
              </div>

              {/* URL mode */}
              {certMode === 'url' && (
                <div className="admin-publish-field">
                  <input
                    id="certUrl"
                    value={certUrl}
                    onChange={e => setCertUrl(e.target.value)}
                    placeholder="https://..."
                    className="admin-publish-input"
                  />
                  <p className="admin-publish-hint" style={{ marginTop: '0.25rem' }}>
                    Direct link to a hosted certificate document.
                  </p>
                </div>
              )}

              {/* Upload mode */}
              {certMode === 'upload' && (
                <div className="admin-publish-field">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    ref={certFileRef}
                    onChange={handleCertUpload}
                    style={{ display: 'none' }}
                    id="admin-cert-file-input"
                  />

                  {certUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'rgba(220, 232, 225, 0.4)', borderRadius: '0.75rem', border: '1px solid var(--cep-border)' }}>
                      <FileText size={20} color="var(--cep-primary)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cep-text-primary)' }}>Certificate uploaded</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{certUrl}</p>
                      </div>
                      <button type="button" onClick={() => setCertUrl('')} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(31,41,51,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1 }} aria-label="Remove">
                        &times;
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => certFileRef.current?.click()}
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
                          <span className="form-upload-zone__text">Click to upload certificate</span>
                          <span className="form-upload-zone__hint">PDF, JPEG, PNG, or WebP — max 5 MB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Auto-generate mode */}
              {certMode === 'auto' && (
                <div style={{ display: 'flex', gap: '0.625rem', backgroundColor: 'rgba(220, 232, 225, 0.4)', border: '1px solid var(--cep-border)', borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <Sparkles size={16} color="var(--cep-primary)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)', lineHeight: 1.6 }}>
                    After the result is published, the backend will automatically generate a PDF certificate with the student's name, event title, position, and organizer details. {isGenerating && <strong>Generating...</strong>}
                  </p>
                </div>
              )}

              {uploadError && <p className="form-upload-error">{uploadError}</p>}
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
