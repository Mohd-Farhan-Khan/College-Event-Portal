import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          <div className="footer__brand-col">
            <Link to="/" className="footer__brand font-serif">
              Event<span className="footer__brand-accent">Hub</span>
            </Link>
            <p className="footer__description">
              Discover concerts, hackathons, academic talks, and cultural fests happening across campus. The digital noticeboard's smart successor.
            </p>
          </div>

          <div className="footer__links-col">
            <h4 className="footer__heading font-serif">Platform</h4>
            <ul className="footer__list">
              <li><Link to="/events" className="footer__link">Browse Events</Link></li>
              <li><Link to="#" className="footer__link">For Organizers</Link></li>
              <li><Link to="#" className="footer__link">Colleges</Link></li>
            </ul>
          </div>

          <div className="footer__links-col">
            <h4 className="footer__heading font-serif">Company</h4>
            <ul className="footer__list">
              <li><Link to="#" className="footer__link">About Us</Link></li>
              <li><Link to="#" className="footer__link">Privacy Policy</Link></li>
              <li><Link to="#" className="footer__link">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} EventHub. All rights reserved.</p>
          <p>Crafted with intention.</p>
        </div>
      </div>
    </footer>
  );
}
