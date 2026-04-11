import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setIsOpen(false);
    navigate('/');
  }

  /** Determine dashboard link based on role */
  function getDashboardLink() {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/users';
    if (user.role === 'college') return '/college/events/new';
    return '/events';
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand font-serif">
          Event<span className="navbar__brand-accent">Hub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links">
          <Link to="/events" className="navbar__link">Events</Link>
          <Link to="#" className="navbar__link">Colleges</Link>
          <Link to="#" className="navbar__link">About</Link>
        </div>

        {/* Desktop Actions — conditional on auth state */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="navbar__user-badge" id="nav-user-badge">
                <span className="navbar__user-avatar">
                  {user.name?.charAt(0).toUpperCase() || <User size={14} />}
                </span>
                <span className="navbar__user-name">{user.name}</span>
              </Link>
              <button
                className="btn btn--ghost navbar__logout-btn"
                onClick={handleLogout}
                id="nav-logout-btn"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost" id="nav-login-btn">Log in</Link>
              <Link to="/signup" className="btn btn--primary" id="nav-signup-btn">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          id="mobile-menu-toggle"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="navbar__mobile" id="mobile-menu">
          <div className="navbar__mobile-inner">
            <Link to="/events" className="navbar__mobile-link" onClick={() => setIsOpen(false)}>Events</Link>
            <Link to="#" className="navbar__mobile-link" onClick={() => setIsOpen(false)}>Colleges</Link>
            <Link to="#" className="navbar__mobile-link" onClick={() => setIsOpen(false)}>About</Link>
            <div className="navbar__mobile-actions">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="btn btn--outline btn--full"
                    onClick={() => setIsOpen(false)}
                  >
                    {user.name}'s Dashboard
                  </Link>
                  <button
                    className="btn btn--primary btn--full"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn--outline btn--full" onClick={() => setIsOpen(false)}>Log in</Link>
                  <Link to="/signup" className="btn btn--primary btn--full" onClick={() => setIsOpen(false)}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
