import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Share2, Heart,
  Users, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { getEvent, request } from '../../services/api';
import './EventDetail.css';

import eventCulturalImg from '../../assets/event-cultural.png';
import eventHackathonImg from '../../assets/event-hackathon.png';
import eventTalkImg from '../../assets/event-talk.png';
import eventSportsImg from '../../assets/event-sports.png';

const CATEGORY_IMAGES = {
  cultural: eventCulturalImg,
  tech: eventHackathonImg,
  technology: eventHackathonImg,
  hackathon: eventHackathonImg,
  academic: eventTalkImg,
  business: eventTalkImg,
  sports: eventSportsImg,
};

/* ────────────── Helpers ────────────── */

function resolveImage(event) {
  if (event.poster_url) return event.poster_url;
  return CATEGORY_IMAGES[(event.category || '').toLowerCase()] || eventTalkImg;
}

function fmtDate(raw) {
  if (!raw) return '';
  return new Date(raw).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtTime(raw) {
  if (!raw) return '';
  return new Date(raw).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ────────────── Component ────────────── */

export function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, userRegistrations, addRegistration } = useAuth();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isLiked, setIsLiked] = useState(false);
  const [regState, setRegState] = useState('idle'); // idle | loading | registered | error | already
  const [regError, setRegError] = useState('');

  /* Fetch the event */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getEvent(eventId);
        if (!cancelled) setEvent(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Event not found.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [eventId]);

  /* Sync component state with global registration state on mount/update */
  useEffect(() => {
    if (userRegistrations?.has(eventId)) {
      setRegState('already'); // Or keep as 'already' vs 'registered' depending on UI needs
    }
  }, [userRegistrations, eventId]);

  /* Register for event → POST /api/registrations/:eventId */
  async function handleRegister() {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegState('loading');
    setRegError('');

    try {
      await request(`/api/registrations/${eventId}`, { method: 'POST' });
      setRegState('registered');
      addRegistration(eventId);
    } catch (err) {
      if (err.status === 409) {
        setRegState('already');
        addRegistration(eventId);
      } else {
        setRegState('error');
        setRegError(err.message || 'Registration failed.');
      }
    }
  }

  /* Organizer info */
  const orgName =
    event?.college_id?.name || event?.createdBy?.name || 'EventHub';
  const orgInitials = getInitials(orgName);

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="detail-back-bar"><div className="container detail-container" /></div>
        <main className="container detail-container detail-main">
          <div className="detail-poster detail-poster--skeleton skeleton-pulse" />
          <div className="detail-layout">
            <div className="detail-left">
              <div className="skeleton-line skeleton-line--xl" />
              <div className="skeleton-line skeleton-line--lg" />
              <div className="skeleton-line skeleton-line--md" />
            </div>
            <div className="detail-right">
              <div className="detail-action-card">
                <div className="skeleton-line skeleton-line--md" />
                <div className="skeleton-line skeleton-line--sm" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Error / 404 ── */
  if (error || !event) {
    return (
      <div className="detail-page">
        <Navbar />
        <main className="container detail-container detail-main">
          <div className="detail-error">
            <h2 className="font-serif">{error || 'Event not found'}</h2>
            <Link to="/events" className="btn btn--primary btn--pill">Back to Events</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Navbar />

      {/* Back navigation */}
      <div className="detail-back-bar">
        <div className="container detail-container">
          <Link to="/events" className="detail-back-link" id="back-to-events">
            <ArrowLeft size={16} className="detail-back-link__icon" />
            Back to Events
          </Link>
        </div>
      </div>

      <main className="container detail-container detail-main">

        {/* ── Poster / Hero ── */}
        <div className="detail-poster" id="event-poster">
          <img
            src={resolveImage(event)}
            alt={event.title}
            className="detail-poster__image"
          />
          <div className="detail-poster__gradient" />

          {/* Top badges */}
          <div className="detail-poster__badges">
            {event.category && (
              <span className="detail-poster__badge detail-poster__badge--category">
                {event.category}
              </span>
            )}
            <span className="detail-poster__badge detail-poster__badge--filling">
              <span className="detail-poster__pulse" />
              Filling Fast
            </span>
          </div>

          {/* Top-right actions */}
          <div className="detail-poster__actions">
            <button
              className={`detail-poster__action-btn ${isLiked ? 'detail-poster__action-btn--liked' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
              aria-label="Like event"
            >
              <Heart size={20} className={isLiked ? 'icon-filled' : ''} />
            </button>
            <button className="detail-poster__action-btn" aria-label="Share event">
              <Share2 size={20} />
            </button>
          </div>

          {/* Bottom overlay text */}
          <div className="detail-poster__overlay-text">
            <h1 className="detail-poster__title font-serif" id="event-title">{event.title}</h1>
            <p className="detail-poster__subtitle">
              {event.description?.slice(0, 140)}{event.description?.length > 140 ? '…' : ''}
            </p>
          </div>
        </div>

        {/* ── Content Layout ── */}
        <div className="detail-layout">

          {/* Left Column */}
          <div className="detail-left">

            {/* Quick Info Bar */}
            <div className="detail-info-bar" id="event-info-bar">
              <div className="detail-info-bar__item">
                <span className="detail-info-bar__label"><Calendar size={14} /> Date</span>
                <span className="detail-info-bar__value">{fmtDate(event.date)}</span>
              </div>
              <div className="detail-info-bar__item">
                <span className="detail-info-bar__label"><Clock size={14} /> Time</span>
                <span className="detail-info-bar__value">{fmtTime(event.date)}</span>
              </div>
              <div className="detail-info-bar__item">
                <span className="detail-info-bar__label"><MapPin size={14} /> Venue</span>
                <span className="detail-info-bar__value">{event.venue || '—'}</span>
              </div>
              <div className="detail-info-bar__item">
                <span className="detail-info-bar__label"><Users size={14} /> Capacity</span>
                <span className="detail-info-bar__value">Open</span>
              </div>
            </div>

            {/* About */}
            <section className="detail-section" id="event-about">
              <h3 className="detail-section__heading font-serif">About the Event</h3>
              <div className="detail-section__prose">
                {event.description ? (
                  event.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>No description provided for this event.</p>
                )}
              </div>
            </section>

            {/* Organizer */}
            <section className="detail-organizer" id="event-organizer">
              <div className="detail-organizer__avatar">{orgInitials}</div>
              <div className="detail-organizer__info">
                <span className="detail-organizer__label">Organized By</span>
                <h4 className="detail-organizer__name font-serif">{orgName}</h4>
                <span className="detail-organizer__link">
                  View Organizer Profile <ExternalLink size={12} />
                </span>
              </div>
            </section>
          </div>

          {/* Right Column — Sticky Action Card */}
          <div className="detail-right">
            <div className="detail-action-card" id="event-action-card">
              <div className="detail-action-card__inner">
                <div className="detail-action-card__price font-serif">Free</div>
                <p className="detail-action-card__note">Open registration.</p>

                <div className="detail-action-card__divider" />

                {/* Attendees teaser */}
                <div className="detail-action-card__attendees">
                  <div className="detail-action-card__dots">
                    <span className="detail-action-card__dot" />
                    <span className="detail-action-card__dot" />
                    <span className="detail-action-card__dot" />
                  </div>
                  <span className="detail-action-card__going">
                    <strong>142</strong> friends going
                  </span>
                </div>

                {/* Registration state */}
                {regState === 'registered' || regState === 'already' ? (
                  <div className="detail-action-card__success" id="registration-success">
                    <div className="detail-action-card__check">
                      <span className="detail-action-card__check-icon">✓</span>
                      You're Registered
                    </div>
                    <p>
                      {regState === 'already'
                        ? 'You already registered for this event.'
                        : 'Ticket sent to your student email.'}
                    </p>
                  </div>
                ) : (
                  <div className="detail-action-card__buttons">
                    {regError && (
                      <div className="detail-action-card__error" role="alert">{regError}</div>
                    )}

                    {user && user.role === 'student' ? (
                      <button
                        className="btn btn--primary btn--full btn--xl"
                        onClick={handleRegister}
                        disabled={regState === 'loading'}
                        id="register-btn"
                      >
                        {regState === 'loading' ? 'Registering…' : 'Register Now'}
                      </button>
                    ) : user ? (
                      <div className="detail-action-card__non-student">
                        Only students can register for events.
                      </div>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="btn btn--primary btn--full btn--xl"
                          id="login-to-register-btn"
                        >
                          Log in to Register
                        </Link>
                      </>
                    )}

                    {!user && (
                      <>
                        <div className="detail-action-card__or">
                          <span>or</span>
                        </div>
                        <Link to="/login" className="btn btn--outline btn--full btn--lg-2">
                          Log in as Guest
                        </Link>
                      </>
                    )}
                  </div>
                )}

                <p className="detail-action-card__footer-note">
                  Requires active college ID verification upon entry.
                </p>
              </div>

              <div className="detail-action-card__band" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
