import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Hash, Building2, ArrowRight, LogOut } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

function RoleBadge({ role }) {
  const config = {
    student: { label: 'Student', bg: '#DCE8E1', text: '#2F5D50' },
    college: { label: 'Organizer', bg: '#F5E4D9', text: '#B56E4A' },
    admin: { label: 'Admin', bg: '#F5F0E4', text: '#9A7B3F' },
  }[role] || { label: role, bg: '#DCE8E1', text: '#2F5D50' };

  return (
    <span
      className="role-badge"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

const studentLinks = [
  { href: '/events', label: 'Browse Events', description: 'Explore upcoming campus events' },
  { href: '/results', label: 'My Results', description: 'View published results for your registrations' },
];

const collegeLinks = [
  { href: '/college/dashboard', label: 'Dashboard', description: 'View your organizer overview' },
  { href: '/college/events/new', label: 'Create Event', description: 'Publish a new campus event' },
  { href: '/college/registrations', label: 'Manage Registrations', description: 'Review and update registrations' },
];

const adminLinks = [
  { href: '/events', label: 'Browse Events', description: 'Monitor all platform events' },
  { href: '/admin/users', label: 'All Users', description: 'View all users' },
];

export function Profile() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-loading">
          <div className="profile-loading__spinner" />
          <p>Loading session...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-error">
          <h2 className="profile-header__title font-serif">Not Logged In</h2>
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="btn btn--primary btn--pill">Go to Login</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const links =
    user.role === 'student'
      ? studentLinks
      : user.role === 'college'
      ? collegeLinks
      : adminLinks;

  const bgColor = user.role === 'student' ? '#2F5D50' : user.role === 'college' ? '#B56E4A' : '#C7A86D';

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        <div className="profile-container">

          {/* Page Header */}
          <div className="profile-header">
            <p className="profile-header__eyebrow">Your Account</p>
            <h1 className="profile-header__title font-serif">Profile</h1>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            {/* Avatar + Name */}
            <div className="profile-user">
              <div
                className="profile-user__avatar"
                style={{ backgroundColor: bgColor }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
              </div>
              <div className="profile-user__info">
                <div className="profile-user__name-row">
                  <h2 className="profile-user__name font-serif">{user.name}</h2>
                  <RoleBadge role={user.role} />
                </div>
                <p className="profile-user__email">{user.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="profile-details">
              <div className="profile-detail-item">
                <Mail className="profile-detail-item__icon" size={16} />
                <div className="profile-detail-item__content">
                  <p className="profile-detail-item__label">Email</p>
                  <p className="profile-detail-item__value">{user.email}</p>
                </div>
              </div>

              <div className="profile-detail-item">
                <Shield className="profile-detail-item__icon" size={16} />
                <div className="profile-detail-item__content">
                  <p className="profile-detail-item__label">Role</p>
                  <div style={{ marginTop: '0.25rem' }}>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>

              <div className="profile-detail-item">
                <Hash className="profile-detail-item__icon" size={16} />
                <div className="profile-detail-item__content">
                  <p className="profile-detail-item__label">User ID</p>
                  <p className="profile-detail-item__value profile-detail-item__value--mono">
                    {user.id || user._id}
                  </p>
                </div>
              </div>

              {((user.role === 'college' && user.college_id) || user.college) && (
                <div className="profile-detail-item">
                  <Building2 className="profile-detail-item__icon" size={16} />
                  <div className="profile-detail-item__content">
                    <p className="profile-detail-item__label">College ID</p>
                    <p className="profile-detail-item__value profile-detail-item__value--mono">
                      {user.college_id || user.college}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="profile-links-card">
            <h3 className="profile-links-card__title font-serif">Quick Access</h3>
            <div className="profile-links__list">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="profile-link-item"
                >
                  <div className="profile-link-item__content">
                    <p className="profile-link-item__label">{link.label}</p>
                    <p className="profile-link-item__desc">{link.description}</p>
                  </div>
                  <ArrowRight size={16} className="profile-link-item__icon" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="profile-logout-card">
            <button className="profile-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign out of this session</span>
            </button>
            <p className="profile-logout-hint">This will clear your session from this browser only.</p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
