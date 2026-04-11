import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Filter, ChevronDown } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../services/api';
import './EventListing.css';

// Local asset fallbacks keyed by category (lowercase)
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

const CATEGORY_COLORS = {
  cultural: '#B56E4A',
  tech: '#2F5D50',
  technology: '#2F5D50',
  hackathon: '#2F5D50',
  academic: '#5B6673',
  business: '#1F2933',
  sports: '#C7A86D',
};

const CATEGORIES = ['All Events', 'Tech', 'Cultural', 'Sports', 'Academic', 'Business'];

/** Fallback data used when the backend has no events or is unreachable */
const FALLBACK_EVENTS = [
  {
    _id: 'fb-1',
    title: 'Symphony of Senses',
    category: 'Cultural',
    date: '2024-10-24T18:00:00Z',
    venue: 'Main Auditorium',
    description: 'An evening of music and performance celebrating campus talent.',
    createdBy: { name: 'Music Society' },
  },
  {
    _id: 'fb-2',
    title: "HackTheFuture '24",
    category: 'Tech',
    date: '2024-11-02T00:00:00Z',
    venue: 'Innovation Center',
    description: 'A 48-hour hackathon pushing the boundaries of student innovation.',
    createdBy: { name: 'CS Department' },
  },
  {
    _id: 'fb-3',
    title: 'The Architecture of Tomorrow',
    category: 'Academic',
    date: '2024-11-12T14:00:00Z',
    venue: 'Design Building Annex',
    description: 'Guest lecture on the future of sustainable architecture.',
    createdBy: { name: 'Guest Lecture Series' },
  },
  {
    _id: 'fb-4',
    title: 'Inter-College Basketball Finals',
    category: 'Sports',
    date: '2024-11-15T16:30:00Z',
    venue: 'Varsity Arena',
    description: 'The championship game of the inter-college basketball league.',
    createdBy: { name: 'Athletics Board' },
  },
  {
    _id: 'fb-5',
    title: 'Startup Pitch Mixer',
    category: 'Business',
    date: '2024-11-20T17:00:00Z',
    venue: 'Student Union, Hall B',
    description: 'Network with founders and pitch your startup ideas.',
    createdBy: { name: 'Entrepreneurship Cell' },
  },
  {
    _id: 'fb-6',
    title: 'Winter Arts Showcase',
    category: 'Cultural',
    date: '2024-12-05T00:00:00Z',
    venue: 'Fine Arts Gallery',
    description: 'An all-day exhibition of student artwork from across departments.',
    createdBy: { name: 'Creative Arts Dept' },
  },
];

/* ────────────────────────── Helpers ────────────────────────── */

function getEventImage(event) {
  if (event.poster_url) return event.poster_url;
  const cat = (event.category || '').toLowerCase();
  return CATEGORY_IMAGES[cat] || eventTalkImg;
}

function getOrganizerName(event) {
  if (event.college_id?.name) return event.college_id.name;
  if (event.createdBy?.name) return event.createdBy.name;
  return 'EventHub';
}

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ────────────────────────── Component ────────────────────────── */

export function EventListing() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');

  /* Fetch events from backend on mount */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getEvents();
        const list = Array.isArray(data) ? data : data.events ?? data.data ?? [];
        if (!cancelled) {
          setEvents(list.length > 0 ? list : FALLBACK_EVENTS);
        }
      } catch {
        if (!cancelled) {
          setEvents(FALLBACK_EVENTS);
          setError('Could not load events from the server. Showing sample events.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /* Client-side category + search filter */
  const filtered = useMemo(() => {
    let list = events;

    if (activeCategory !== 'All Events') {
      list = list.filter(
        (e) => (e.category || '').toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          getOrganizerName(e).toLowerCase().includes(q)
      );
    }

    return list;
  }, [events, activeCategory, searchQuery]);

  /* Pick the first event as the "Featured" highlight */
  const featured = events[0];

  return (
    <div className="events-page">
      <Navbar />

      {/* ── Page Header ── */}
      <div className="events-header">
        <div className="events-header__inner container">
          <h1 className="events-header__title font-serif" id="events-page-title">Discover Events</h1>

          <div className="events-header__controls">
            <div className="events-search">
              <Search size={20} className="events-search__icon" />
              <input
                type="text"
                placeholder="Search events, clubs, or venues..."
                className="events-search__input"
                id="events-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn btn--outline btn--pill events-filter-btn" id="events-filter-btn">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="events-main container">

        {/* Category chips */}
        <div className="events-chips" id="category-filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`events-chip ${activeCategory === cat ? 'events-chip--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="events-notice" role="status">{error}</div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="events-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="event-card event-card--skeleton">
                <div className="event-card__image-wrap skeleton-pulse" />
                <div className="event-card__body">
                  <div className="skeleton-line skeleton-line--sm" />
                  <div className="skeleton-line skeleton-line--lg" />
                  <div className="skeleton-line skeleton-line--md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Featured Highlight ── */}
            {featured && activeCategory === 'All Events' && !searchQuery && (
              <Link to={`/events/${featured._id}`} className="featured-banner" id="featured-event-banner">
                <div className="featured-banner__content">
                  <span className="featured-banner__badge">Featured Event</span>
                  <h2 className="featured-banner__title font-serif">{featured.title}</h2>
                  <p className="featured-banner__desc">
                    {featured.description?.slice(0, 120)}
                    {featured.description?.length > 120 ? '…' : ''}
                  </p>
                  <div className="featured-banner__meta">
                    <span className="featured-banner__meta-item">
                      <Calendar size={16} /> {formatDate(featured.date)}
                    </span>
                    <span className="featured-banner__meta-item">
                      <MapPin size={16} /> {featured.venue}
                    </span>
                  </div>
                  <span className="btn btn--outline-light btn--pill featured-banner__cta">
                    Register Now
                  </span>
                </div>
                <div className="featured-banner__image-wrap">
                  <img
                    src={getEventImage(featured)}
                    alt={featured.title}
                    className="featured-banner__image"
                  />
                  <div className="featured-banner__gradient featured-banner__gradient--mobile" />
                  <div className="featured-banner__gradient featured-banner__gradient--desktop" />
                </div>
              </Link>
            )}

            {/* Grid heading */}
            <div className="events-grid-header">
              <h3 className="events-grid-header__title font-serif">Upcoming Events</h3>
              <span className="events-grid-header__sort">
                Sort by: Date <ChevronDown size={16} />
              </span>
            </div>

            {/* ── Event Grid ── */}
            {filtered.length > 0 ? (
              <div className="events-grid" id="events-grid">
                {filtered.map((event, i) => (
                  <Link
                    to={`/events/${event._id}`}
                    key={event._id}
                    className="event-card"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="event-card__image-wrap">
                      <img
                        src={getEventImage(event)}
                        alt={event.title}
                        className="event-card__image"
                      />
                      <span
                        className="event-card__category-badge"
                        style={{
                          backgroundColor: CATEGORY_COLORS[(event.category || '').toLowerCase()] || '#1F2933',
                        }}
                      >
                        {event.category || 'Event'}
                      </span>
                    </div>

                    <div className="event-card__body">
                      <span className="event-card__organizer">
                        By {getOrganizerName(event)}
                      </span>
                      <h3 className="event-card__title font-serif">{event.title}</h3>

                      <div className="event-card__meta">
                        <div className="event-card__meta-row">
                          <Calendar size={16} className="event-card__meta-icon" />
                          <div>
                            <span className="event-card__meta-primary">{formatDate(event.date)}</span>
                            <span className="event-card__meta-secondary">{formatTime(event.date)}</span>
                          </div>
                        </div>
                        <div className="event-card__meta-row">
                          <MapPin size={16} className="event-card__meta-icon" />
                          <span className="event-card__meta-venue">{event.venue}</span>
                        </div>
                      </div>

                      <div className="event-card__footer">
                        <div className="event-card__attendees">
                          <div className="event-card__attendee-dot" />
                          <div className="event-card__attendee-dot" />
                          <div className="event-card__attendee-count">+42</div>
                        </div>
                        <span className="event-card__view-link">
                          View Details
                          <ArrowRight size={16} className="event-card__arrow" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* ── Empty State ── */
              <div className="events-empty" id="events-empty-state">
                <div className="events-empty__icon-wrap">
                  <Search size={32} />
                </div>
                <h4 className="events-empty__title font-serif">No events found</h4>
                <p className="events-empty__desc">
                  We couldn't find any events matching your criteria. Try adjusting your filters or search term.
                </p>
                <button
                  className="btn btn--outline btn--pill"
                  onClick={() => { setActiveCategory('All Events'); setSearchQuery(''); }}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Load more (placeholder for pagination) */}
            {filtered.length >= 6 && (
              <div className="events-load-more">
                <button className="btn btn--outline btn--pill events-load-more__btn">
                  Load More Events
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
