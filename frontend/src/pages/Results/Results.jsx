import { useState, useEffect, useMemo } from 'react';
import { Search, Award, ExternalLink, Trophy, Medal, Ribbon } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { request } from '../../services/api';
import './Results.css';

function PositionBadge({ position }) {
  if (position === 1) {
    return (
      <span className="pos-badge pos-badge--1">
        <Trophy size={12} /> 1st
      </span>
    );
  }
  if (position === 2) {
    return (
      <span className="pos-badge pos-badge--2">
        <Medal size={12} /> 2nd
      </span>
    );
  }
  if (position === 3) {
    return (
      <span className="pos-badge pos-badge--3">
        <Ribbon size={12} /> 3rd
      </span>
    );
  }
  return (
    <span className="pos-badge pos-badge--other">
      #{position}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function Results() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [eventFilter, setEventFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (applied) {
          if (eventFilter.trim()) queryParams.append('event_id', eventFilter.trim());
          if (studentFilter.trim()) queryParams.append('student_id', studentFilter.trim());
        }

        const q = queryParams.toString();
        const data = await request(`/api/results${q ? `?${q}` : ''}`);
        
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Failed to load results. Please try again later.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [applied, eventFilter, studentFilter]);

  function handleApply() {
    setApplied(true);
  }

  function handleClear() {
    setApplied(false);
    setEventFilter('');
    setStudentFilter('');
  }

  // Client-side fallback filtering if an API isn't exactly mapping it correctly,
  // but we mostly rely on the server side fetch triggered by `applied`
  const filteredResults = useMemo(() => {
    // If we're relying entirely on server-side, we just return `results`.
    // We already fetch with filters on apply, so client-side filter is optional,
    // but useful if user types and doesn't click apply yet. Actually wait,
    // the UI reference applies on "Apply" click. So we just show `results`.
    // Wait, the UI reference says `MOCK_RESULTS.filter(...)`. Since we hit the API on Apply,
    // we don't need to filter client side dynamically while typing.
    return results;
  }, [results]);

  return (
    <div className="results-page">
      <Navbar />

      <main className="results-main">
        <div className="results-container">
          
          {/* Header */}
          <div className="results-header">
            <p className="results-header__eyebrow">Platform</p>
            <h1 className="results-header__title font-serif">Results</h1>
            <p className="results-header__desc">Browse published results from completed campus events.</p>
          </div>

          {/* Filter Bar */}
          <div className="results-filter-bar">
            <div className="results-filter-row">
              <div className="results-filter-group">
                <label className="results-filter-label">Filter by Event ID</label>
                <input
                  type="text"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  placeholder="e.g. evt_4b7e2a91..."
                  className="results-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
              </div>
              <div className="results-filter-group">
                <label className="results-filter-label">Filter by Student ID (or Name)</label>
                <input
                  type="text"
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  placeholder="Name or user ID..."
                  className="results-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
              </div>
              <div className="results-filter-actions">
                <button className="results-btn-apply" onClick={handleApply}>
                  Apply
                </button>
                {applied && (
                  <button className="results-btn-clear" onClick={handleClear}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-count">
            <strong>{filteredResults.length}</strong> {filteredResults.length === 1 ? 'result' : 'results'} found
          </div>

          {/* Error Notice */}
          {error && (
            <div className="events-notice" style={{ marginBottom: '1rem' }} role="status">{error}</div>
          )}

          {/* Results Table */}
          {isLoading ? (
            <div className="results-empty">
              <div className="results-empty__icon results-empty__icon--spin" />
              <p className="results-empty__title font-serif">Loading Results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="results-empty">
              <Award size={40} className="results-empty__icon" />
              <p className="results-empty__title font-serif">No results found</p>
              <p className="results-empty__desc">No results match your current filters. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="results-table-wrap">
              {/* Desktop Table */}
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Issued</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r, i) => {
                    const studentName = r.student_id?.name || r.studentName || 'Student';
                    const eventTitle = r.event_id?.title || r.eventTitle || 'Event';
                    const certUrl = r.certificate_url || r.certificateUrl;

                    return (
                      <tr key={r._id || r.id || i}>
                        <td>
                          <PositionBadge position={r.position} />
                        </td>
                        <td className="results-td-student">{studentName}</td>
                        <td className="results-td-event">{eventTitle}</td>
                        <td className="results-td-date">{formatDate(r.issuedAt || r.issuedDate)}</td>
                        <td>
                          {certUrl ? (
                            <a
                              href={certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="results-cert-link"
                            >
                              View <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="results-cert-empty">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="results-mobile-list">
                {filteredResults.map((r, i) => {
                  const studentName = r.student_id?.name || r.studentName || 'Student';
                  const eventTitle = r.event_id?.title || r.eventTitle || 'Event';
                  const certUrl = r.certificate_url || r.certificateUrl;

                  return (
                    <div key={r._id || r.id || i} className="results-mobile-card">
                      <div className="results-mobile-card-row">
                        <span className="results-mobile-student">{studentName}</span>
                        <PositionBadge position={r.position} />
                      </div>
                      <p className="results-mobile-event">{eventTitle}</p>
                      <div className="results-mobile-card-row">
                        <span className="results-mobile-date">{formatDate(r.issuedAt || r.issuedDate)}</span>
                        {certUrl && (
                          <a href={certUrl} className="results-cert-link" target="_blank" rel="noopener noreferrer">
                            Certificate <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
