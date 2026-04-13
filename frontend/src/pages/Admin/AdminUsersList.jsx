import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, GraduationCap, Building2, ShieldCheck, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import './AdminUsersList.css';

const ROLE_CONFIG = {
  student: { label: "Student",  bg: "#DCE8E1", text: "#2F5D50", icon: <GraduationCap size={12} />, desc: "Can browse events and register as a participant." },
  college: { label: "Organizer",bg: "#F5E4D9", text: "#B56E4A", icon: <Building2 size={12} />, desc: "Can create events, manage registrations, and publish results for their college." },
  admin:   { label: "Admin",    bg: "#F5F0E4", text: "#C7A86D", icon: <ShieldCheck size={12} />, desc: "Full platform access including user management and global registration control." },
};

export function RoleBadge({ role }) {
  const c = ROLE_CONFIG[role] || { label: role, bg: "#F0F0F0", text: "#6B6B6B", icon: null };
  return (
    <span className="role-badge" style={{ backgroundColor: c.bg, color: c.text }}>
      {c.icon} {c.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

export function AdminUsersList() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [viewState, setViewState] = useState("loading"); // "loading" | "loaded" | "error" | "empty"

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

    async function fetchUsers() {
      try {
        const data = await request('/api/users');
        if (!cancelled) {
          const arr = Array.isArray(data) ? data : data.data || [];
          setUsersList(arr);
          setViewState(arr.length === 0 ? "empty" : "loaded");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setViewState("error");
        }
      }
    }

    fetchUsers();
    return () => { cancelled = true; };
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user || user.role !== 'admin') return null;

  const filtered = usersList.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (u.name?.toLowerCase() || "").includes(q) || 
           (u.email?.toLowerCase() || "").includes(q) || 
           (u.role?.toLowerCase() || "").includes(q);
  });

  return (
    <div className="admin-users-page">
      <Navbar />

      <main className="admin-main">
        <div className="admin-container">

          {/* Header */}
          <div className="admin-header-row">
            <div>
              <p className="admin-eyebrow">Administration</p>
              <h1 className="admin-title font-serif">Users</h1>
              <p className="admin-desc">All registered users on the platform.</p>
            </div>
            {viewState === "loaded" && (
              <div className="admin-count">
                <strong>{usersList.length}</strong> total users
              </div>
            )}
          </div>

          {/* Client-side Search */}
          {["loaded", "empty"].includes(viewState) && (
            <div className="admin-search-wrap">
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="admin-search-input"
              />
              {query && <p className="admin-search-hint">Client-side filter — searching loaded records only.</p>}
            </div>
          )}

          {/* Loading State */}
          {viewState === "loading" && (
            <div className="admin-loading">
              <Loader2 size={32} className="admin-loading__spinner" />
              <p>Loading users...</p>
            </div>
          )}

          {/* Error State */}
          {viewState === "error" && (
            <div className="admin-error">
              <AlertCircle size={32} className="admin-error__icon" />
              <p className="admin-error__title font-serif">Failed to load users</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>There was a problem fetching user data. Check your connection or permissions and try again.</p>
            </div>
          )}

          {/* Empty State */}
          {viewState === "empty" && !query && (
            <div className="admin-empty">
              <Users size={40} className="admin-empty__icon" />
              <p className="admin-error__title font-serif">No users found</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--cep-text-secondary)' }}>No users are registered on the platform yet.</p>
            </div>
          )}

          {/* Data Table */}
          {viewState === "loaded" && (
            <>
              {/* Desktop */}
              <div className="admin-table-wrap hidden sm:block">
                <table className="admin-table" style={{ display: 'table' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>College ID</th>
                      <th>Joined</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--cep-text-secondary)' }}>
                          No users match your search.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="admin-td-name">
                              <div 
                                className="user-avatar"
                                style={{ backgroundColor: ROLE_CONFIG[u.role]?.text || "#5B6673" }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              {u.name}
                            </div>
                          </td>
                          <td className="admin-td-email">{u.email}</td>
                          <td><RoleBadge role={u.role} /></td>
                          <td className="admin-td-id">
                            {u.college_id ? u.college_id : <span style={{ color: 'var(--cep-border)' }}>—</span>}
                          </td>
                          <td className="admin-td-date">{formatDate(u.createdAt)}</td>
                          <td>
                            <Link to={`/admin/users/${u._id}`} className="view-link-btn">
                              View <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="admin-mobile-list sm:hidden">
                {filtered.map(u => (
                  <div key={u._id} className="admin-mobile-card">
                    <div className="admin-mobile-header">
                      <div className="admin-mobile-user">
                        <div 
                          className="user-avatar"
                          style={{ backgroundColor: ROLE_CONFIG[u.role]?.text || "#5B6673", width: '2.25rem', height: '2.25rem' }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="admin-mobile-name">{u.name}</p>
                          <p className="admin-mobile-email">{u.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>
                    {u.college_id && (
                      <p className="admin-mobile-id">College: {u.college_id}</p>
                    )}
                    <div className="admin-mobile-footer">
                      <p className="admin-mobile-date">Joined {formatDate(u.createdAt)}</p>
                      <Link to={`/admin/users/${u._id}`} className="admin-mobile-view">
                        View details <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
