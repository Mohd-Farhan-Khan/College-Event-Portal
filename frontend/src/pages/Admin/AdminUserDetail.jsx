import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Hash, Building2, Calendar, Clock, Loader2, AlertCircle, GraduationCap, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';

import './AdminUsersList.css'; // Re-using styles

const ROLE_CONFIG = {
  student: { label: "Student",  bg: "#DCE8E1", text: "#2F5D50", icon: <GraduationCap size={12} />, desc: "Can browse events and register as a participant." },
  college: { label: "Organizer",bg: "#F5E4D9", text: "#B56E4A", icon: <Building2 size={12} />, desc: "Can create events, manage registrations, and publish results for their college." },
  admin:   { label: "Admin",    bg: "#F5F0E4", text: "#C7A86D", icon: <ShieldCheck size={12} />, desc: "Full platform access including user management and global registration control." },
};

function Field({ icon, label, value, mono = false }) {
  return (
    <div className="admin-field">
      <div className="admin-field__icon">{icon}</div>
      <div className="admin-field__content">
        <p className="admin-field__label">{label}</p>
        <div className={`admin-field__value ${mono ? 'admin-field__value--mono' : ''}`}>{value}</div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function AdminUserDetail() {
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);
  const [viewState, setViewState] = useState("loading"); // "loading" | "loaded" | "error"

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/events');
      return;
    }

    let cancelled = false;

    async function fetchUser() {
      try {
        const data = await request(`/api/users/${id}`);
        if (!cancelled) {
          setTargetUser(data);
          setViewState("loaded");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setViewState("error");
        }
      }
    }

    fetchUser();
    return () => { cancelled = true; };
  }, [id, user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  if (viewState === "loading") {
    return (
      <div className="admin-users-page">
        <Navbar />
        <main className="admin-main">
          <div className="admin-loading">
            <Loader2 size={32} className="admin-loading__spinner" />
            <p>Loading user details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (viewState === "error" || !targetUser) {
    return (
      <div className="admin-users-page">
        <Navbar />
        <main className="admin-main">
          <div className="admin-container" style={{ maxWidth: '48rem' }}>
            <Link to="/admin/users" className="admin-back-link">
              <ArrowLeft size={16} /> Back to Users
            </Link>
            <div className="admin-error">
              <AlertCircle size={32} className="admin-error__icon" />
              <p className="admin-error__title font-serif">Failed to load user detail</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>The user might not exist or there was a server error.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const u = targetUser;
  const role = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;

  return (
    <div className="admin-users-page">
      <Navbar />

      <main className="admin-main">
        <div className="admin-container" style={{ maxWidth: '42rem' }}>
          
          {/* Back Link */}
          <Link to="/admin/users" className="admin-back-link">
            <ArrowLeft size={16} /> Back to Users
          </Link>

          {/* Header */}
          <div className="admin-header-row" style={{ marginBottom: '2rem' }}>
            <div>
              <p className="admin-eyebrow">Administration → Users</p>
              <h1 className="admin-title font-serif">User Detail</h1>
            </div>
          </div>

          {/* Details Card */}
          <div className="admin-detail-card">
            
            {/* Avatar & Name */}
            <div className="admin-detail-profile">
              <div 
                className="user-avatar user-avatar--lg"
                style={{ backgroundColor: role.text }}
              >
                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="admin-detail-name">{u.name}</h2>
                <p className="admin-detail-email">{u.email}</p>
              </div>
            </div>

            {/* Role Banner */}
            <div className="admin-role-banner" style={{ backgroundColor: role.bg }}>
              <div style={{ color: role.text }}>{role.icon}</div>
              <div style={{ color: role.text }}>
                <p className="banner-label">{role.label}</p>
                <p className="banner-desc">{role.desc}</p>
              </div>
            </div>

            {/* Fields list */}
            <div>
              <Field icon={<Mail size={16} />} label="Email" value={u.email} />
              <Field icon={<Hash size={16} />} label="User ID" value={u._id} mono />
              <Field icon={<Shield size={16} />} label="Role" value={
                <span className="role-badge" style={{ backgroundColor: role.bg, color: role.text }}>
                  {role.icon} {role.label}
                </span>
              } />
              {u.college_id && (
                <Field icon={<Building2 size={16} />} label="College ID" value={u.college_id} mono />
              )}
              <Field icon={<Calendar size={16} />} label="Joined" value={formatDate(u.createdAt)} />
              <Field icon={<Clock size={16} />} label="Last Updated" value={formatDate(u.updatedAt)} />
            </div>
          </div>

          {/* Notice */}
          <div className="admin-notice-box">
            <p>
              <strong>Read-only view.</strong> User editing and deletion are not supported by the current backend. To modify user data, use direct database access or contact the platform administrator.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
