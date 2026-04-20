import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Trophy, Upload, Link2, Loader2, FileText, Sparkles, XCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request, uploadFile, generateCertificate } from '../../services/api';

import '../CreateEvent/CreateEvent.css'; // Re-use select structural classes like .form-group, .form-label
import './PublishResults.css';

export function PublishResults() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [position, setPosition] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");

  // Certificate mode: 'none' | 'url' | 'upload' | 'auto'
  const [certMode, setCertMode] = useState("none");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const certFileRef = useRef(null);
  
  // Auto-generate state
  const [isGenerating, setIsGenerating] = useState(false);

  const [submitState, setSubmitState] = useState("idle"); // "idle" | "success" | "conflict" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [newResultId, setNewResultId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
    } else if (user.role !== 'college' && user.role !== 'admin') {
      navigate('/events');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || (user.role !== 'college' && user.role !== 'admin')) return null;

  const isValid = eventId.trim() && studentId.trim() && position.trim() && Number(position) > 0;

  // Certificate file upload handler
  const handleCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const data = await uploadFile(file, 'certificate');
      setCertificateUrl(data.url);
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
      setCertificateUrl(updated.certificate_url || '');
    } catch (err) {
      console.error('Certificate generation error:', err);
      setUploadError(err.message || 'Failed to generate certificate.');
    } finally {
      setIsGenerating(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitState("idle");
    setErrorMsg("");

    try {
      const result = await request('/api/results', {
        method: 'POST',
        body: {
          event_id: eventId.trim(),
          student_id: studentId.trim(),
          position: Number(position),
          certificate_url: certificateUrl.trim() || undefined
        }
      });

      setNewResultId(result._id || "");
      setSubmitState("success");

      // Auto-generate certificate if that mode was selected
      if (certMode === 'auto' && result._id) {
        await handleAutoGenerate(result._id);
      }

      // Clear form (keep eventId so they can publish another rank for same event quickly)
      setStudentId("");
      setPosition("");
      if (certMode !== 'auto') setCertificateUrl("");
      
    } catch (err) {
      console.error(err);
      if (err.status === 409) {
        setSubmitState("conflict");
      } else {
        setSubmitState("error");
        setErrorMsg(err.message || 'Failed to publish result. Please try again.');
      }
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
          {submitState === "success" && (
            <div className="success-banner" style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
              <CheckCircle2 size={20} color="#2F5D50" style={{ marginTop: '0.125rem' }} />
              <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                <p className="success-banner__text" style={{ fontWeight: 600 }}>Result published successfully!</p>
                {newResultId && (
                  <p style={{ fontSize: '0.75rem', color: '#2F5D50', marginTop: '0.125rem', fontFamily: 'monospace' }}>
                    Result ID: {newResultId}
                  </p>
                )}
                {certificateUrl && certMode === 'auto' && (
                  <p style={{ fontSize: '0.75rem', color: '#2F5D50', marginTop: '0.25rem' }}>
                    ✓ Certificate auto-generated successfully
                  </p>
                )}
              </div>
              <button onClick={() => setSubmitState("idle")} className="success-banner__close" aria-label="Dismiss">&times;</button>
            </div>
          )}

          {/* 409 Conflict Banner */}
          {submitState === "conflict" && (
            <div className="create-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <XCircle size={20} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Duplicate result — 409 Conflict</p>
                <p style={{ fontSize: '0.875rem' }}>
                  A result for this student/event combination already exists. Each student can only have one result per event.
                </p>
              </div>
              <button onClick={() => setSubmitState("idle")} className="success-banner__close" style={{ color: '#B56E4A' }} aria-label="Dismiss">&times;</button>
            </div>
          )}

          {/* General Error Banner */}
          {submitState === "error" && (
            <div className="create-error" style={{ marginBottom: '1.5rem' }}>
              {errorMsg}
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

            {/* Certificate Section */}
            <div className="pr-form-section">
              <div className="form-section__header">
                <span className="form-section__label">Optional — Certificate</span>
                <div className="form-section__line" />
              </div>

              {/* Certificate Mode Selector */}
              <div className="cert-mode-selector">
                <button
                  type="button"
                  onClick={() => { setCertMode("none"); setCertificateUrl(""); setUploadError(""); }}
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
                  onClick={() => { setCertMode("auto"); setCertificateUrl(""); setUploadError(""); }}
                  className={`cert-mode-btn ${certMode === 'auto' ? 'cert-mode-btn--active' : ''}`}
                >
                  <Sparkles size={14} /> Auto-Generate
                </button>
              </div>

              {/* URL mode */}
              {certMode === 'url' && (
                <div className="form-group">
                  <input
                    id="certificateUrl"
                    value={certificateUrl}
                    onChange={(e) => setCertificateUrl(e.target.value)}
                    placeholder="https://..."
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)' }}>
                    Direct link to a hosted certificate document.
                  </p>
                </div>
              )}

              {/* Upload mode */}
              {certMode === 'upload' && (
                <div className="form-group">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    ref={certFileRef}
                    onChange={handleCertUpload}
                    style={{ display: 'none' }}
                    id="cert-file-input"
                  />

                  {certificateUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'rgba(220, 232, 225, 0.4)', borderRadius: '0.75rem', border: '1px solid var(--cep-border)' }}>
                      <FileText size={20} color="var(--cep-primary)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cep-text-primary)' }}>Certificate uploaded</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cep-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{certificateUrl}</p>
                      </div>
                      <button type="button" onClick={() => setCertificateUrl('')} className="form-upload-preview__remove" style={{ position: 'static' }} aria-label="Remove">
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
