import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Users, Zap } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';

import eventCultural from '../../assets/event-cultural.png';
import eventHackathon from '../../assets/event-hackathon.png';
import eventTalk from '../../assets/event-talk.png';

import './Home.css';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Navbar />

      {/* ===== Hero Section ===== */}
      <section className="hero" id="hero-section">
        <div className="hero__inner container">
          <div className="hero__content">
            {/* Badge */}
            <div className="hero__badge animate-fade-in-up">
              <span className="hero__badge-dot"></span>
              Fall Semester Events Now Live
            </div>

            {/* Heading */}
            <h1 className="hero__title font-serif animate-fade-in-up-delay-1">
              Campus life,<br />
              <span className="hero__title-accent">curated.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero__subtitle animate-fade-in-up-delay-2">
              Discover concerts, hackathons, academic talks, and cultural fests happening across campus. The digital noticeboard's smart successor for thoughtful students.
            </p>

            {/* CTA Buttons */}
            <div className="hero__actions animate-fade-in-up-delay-3">
              <Link to="/events" className="btn btn--primary btn--lg btn--pill" id="hero-explore-btn">
                Explore Events
                <ArrowRight size={16} className="btn__icon" />
              </Link>
              {!user && (
                <Link to="/login" className="btn btn--outline btn--lg btn--pill" id="hero-signin-btn">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="hero__glow"></div>
      </section>

      {/* ===== Featured Events Section ===== */}
      <section className="featured" id="featured-section">
        <div className="featured__inner container">
          <div className="featured__header">
            <div>
              <h2 className="featured__title font-serif">Featured This Week</h2>
              <p className="featured__subtitle">Don't miss out on these headline events.</p>
            </div>
            <Link to="/events" className="btn btn--link featured__view-all-desktop" id="featured-view-all">
              View all events <ArrowRight size={16} className="btn__icon" />
            </Link>
          </div>

          <div className="featured__grid">
            {/* Event Card 1 */}
            <div className="event-card" id="event-card-cultural">
              <div className="event-card__image-wrap">
                <img src={eventCultural} alt="Symphony of Senses — Cultural Festival" className="event-card__image" />
                <span className="event-card__badge event-card__badge--cream">Cultural</span>
              </div>
              <div className="event-card__body">
                <h3 className="event-card__title font-serif">Symphony of Senses</h3>
                <div className="event-card__meta">
                  <span className="event-card__meta-item">
                    <Calendar size={16} className="event-card__meta-icon" /> Oct 24
                  </span>
                  <span className="event-card__meta-item">
                    <MapPin size={16} className="event-card__meta-icon" /> Main Auditorium
                  </span>
                </div>
              </div>
            </div>

            {/* Event Card 2 (offset) */}
            <div className="event-card event-card--offset" id="event-card-hackathon">
              <div className="event-card__image-wrap">
                <img src={eventHackathon} alt="HackTheFuture 2024 — Technology Hackathon" className="event-card__image" />
                <span className="event-card__badge event-card__badge--green">Technology</span>
              </div>
              <div className="event-card__body">
                <h3 className="event-card__title font-serif">HackTheFuture '24</h3>
                <div className="event-card__meta">
                  <span className="event-card__meta-item">
                    <Calendar size={16} className="event-card__meta-icon" /> Nov 02 – 04
                  </span>
                  <span className="event-card__meta-item">
                    <MapPin size={16} className="event-card__meta-icon" /> Innovation Center
                  </span>
                </div>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="event-card" id="event-card-talk">
              <div className="event-card__image-wrap">
                <img src={eventTalk} alt="The Architecture of Tomorrow — Academic Talk" className="event-card__image" />
                <span className="event-card__badge event-card__badge--terracotta">Academic</span>
              </div>
              <div className="event-card__body">
                <h3 className="event-card__title font-serif">The Architecture of Tomorrow</h3>
                <div className="event-card__meta">
                  <span className="event-card__meta-item">
                    <Calendar size={16} className="event-card__meta-icon" /> Nov 12
                  </span>
                  <span className="event-card__meta-item">
                    <MapPin size={16} className="event-card__meta-icon" /> Design Building
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA */}
          <Link to="/events" className="btn btn--outline-dark btn--full featured__view-all-mobile" id="featured-view-all-mobile">
            View all events
          </Link>
        </div>
      </section>

      {/* ===== Value Proposition Section ===== */}
      <section className="value-prop" id="value-prop-section">
        <div className="value-prop__inner container">
          <div className="value-prop__grid">
            {/* Text side */}
            <div className="value-prop__text">
              <h2 className="value-prop__title font-serif">
                Designed for the <br />
                <span className="value-prop__title-accent">active student.</span>
              </h2>
              <p className="value-prop__description">
                No more digging through cluttered WhatsApp groups or outdated college websites. Find exactly what matches your interests, register in one tap, and build your campus network.
              </p>

              <ul className="value-prop__features">
                <li className="value-prop__feature">
                  <div className="value-prop__feature-icon value-prop__feature-icon--green">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="value-prop__feature-title">Smart Discovery</h4>
                    <p className="value-prop__feature-desc">Personalized recommendations based on your major and past attendance.</p>
                  </div>
                </li>
                <li className="value-prop__feature">
                  <div className="value-prop__feature-icon value-prop__feature-icon--warm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="value-prop__feature-title">See Who's Going</h4>
                    <p className="value-prop__feature-desc">Connect with peers before the event even starts.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual side — Mockup UI */}
            <div className="value-prop__visual">
              <div className="mockup">
                {/* Browser chrome mockup */}
                <div className="mockup__window">
                  <div className="mockup__titlebar">
                    <div className="mockup__dot mockup__dot--red"></div>
                    <div className="mockup__dot mockup__dot--amber"></div>
                    <div className="mockup__dot mockup__dot--green"></div>
                  </div>
                  <div className="mockup__content">
                    <div className="mockup__row">
                      <div className="mockup__avatar"></div>
                      <div className="mockup__lines">
                        <div className="mockup__line mockup__line--md"></div>
                        <div className="mockup__line mockup__line--sm"></div>
                      </div>
                    </div>
                    <div className="mockup__area"></div>
                    <div className="mockup__actions">
                      <div className="mockup__btn-primary"></div>
                      <div className="mockup__btn-icon"></div>
                    </div>
                  </div>
                </div>

                {/* Decorative blurs */}
                <div className="mockup__blur mockup__blur--bottom"></div>
                <div className="mockup__blur mockup__blur--top"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta" id="cta-section">
        <div className="cta__inner container">
          <h2 className="cta__title font-serif">
            {user ? 'Discover what\'s next.' : 'Ready to experience'}  {!user && <><br />{'campus fully?'}</>}
          </h2>
          <p className="cta__subtitle">
            {user
              ? 'Browse the latest events and find your next campus experience.'
              : 'Join thousands of students discovering their next favorite college memory.'}
          </p>
          <div className="cta__action">
            {user ? (
              <Link to="/events" className="btn btn--gold btn--lg btn--pill" id="cta-events-btn">
                Browse Events
              </Link>
            ) : (
              <Link to="/signup" className="btn btn--gold btn--lg btn--pill" id="cta-signup-btn">
                Create Student Account
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
