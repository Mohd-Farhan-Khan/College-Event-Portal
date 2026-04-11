import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { register as apiRegister } from '../../services/api';
import './Signup.css';

const ROLES = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Attend events',
    Icon: GraduationCap,
    activeClass: 'role-card--student-active',
  },
  {
    value: 'college',
    label: 'Organizer',
    desc: 'Host events',
    Icon: Building2,
    activeClass: 'role-card--college-active',
  },
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Manage college',
    Icon: ShieldCheck,
    activeClass: 'role-card--admin-active',
  },
];

export function Signup() {
  const navigate = useNavigate();
  const { user, saveSession } = useAuth();

  const [role, setRole] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Redirect if already logged in */
  useEffect(() => {
    if (user) navigate('/events', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic validation
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // Build the payload per BACKEND_API_REFERENCE.md
    const payload = {
      name: fullName,
      email,
      password,
      role,
    };

    // Only attach college when role is 'college' and a college ID is provided
    if (role === 'college' && collegeId.trim()) {
      payload.college = collegeId.trim();
    }

    setIsSubmitting(true);

    try {
      const data = await apiRegister(payload);

      // Backend returns { token, user } on successful register
      saveSession({ token: data.token, user: data.user });

      // Role-based redirect (same logic as login per frontend-guidelines)
      const userRole = data.user.role;
      if (userRole === 'admin') {
        navigate('/admin/users');
      } else if (userRole === 'college') {
        navigate('/college/events/new');
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signup-page">
      <Navbar />

      <main className="signup-main">
        <div className="signup-card" id="signup-card">

          {/* Header */}
          <div className="signup-card__header">
            <h1 className="signup-card__title font-serif">Join EventHub</h1>
            <p className="signup-card__subtitle">Create your account to start discovering campus life.</p>
          </div>

          {error && (
            <div className="signup-card__error" id="signup-error" role="alert">
              {error}
            </div>
          )}

          <form className="signup-card__form" onSubmit={handleSubmit}>

            {/* ── Role Selection ── */}
            <div className="signup-section">
              <span className="signup-section__label">I am joining as a...</span>
              <div className="role-grid">
                {ROLES.map(({ value, label, desc, Icon, activeClass }) => (
                  <label
                    key={value}
                    htmlFor={`role-${value}`}
                    className={`role-card ${role === value ? activeClass : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      id={`role-${value}`}
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                      className="sr-only"
                    />
                    <Icon size={32} className="role-card__icon" />
                    <span className="role-card__label">{label}</span>
                    <span className="role-card__desc">{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="signup-divider"></div>

            {/* ── Form Fields ── */}
            <div className="signup-fields">
              <div className="signup-fields__row">
                <div className="form-field">
                  <label htmlFor="signup-first-name" className="form-field__label">First Name</label>
                  <input
                    id="signup-first-name"
                    type="text"
                    placeholder="Jane"
                    className="form-field__input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="signup-last-name" className="form-field__label">Last Name</label>
                  <input
                    id="signup-last-name"
                    type="text"
                    placeholder="Doe"
                    className="form-field__input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="signup-email" className="form-field__label">
                  {role === 'student' ? 'College Email (.edu preferred)' : 'Official Email'}
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="jane@university.edu"
                  className="form-field__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="signup-password" className="form-field__label">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Create a strong password"
                  className="form-field__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Conditional field for college / admin */}
              {role !== 'student' && (
                <div className="signup-extra-field" id="signup-college-field">
                  <label htmlFor="signup-college-id" className="form-field__label">
                    {role === 'college' ? 'Club / Organization ID' : 'Administrative Access Code'}
                  </label>
                  <input
                    id="signup-college-id"
                    type="text"
                    placeholder="Provided by your institution"
                    className="form-field__input form-field__input--white"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                  />
                  <p className="form-field__hint">
                    Verification required. Your account will be pending until reviewed by the institution.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--xl"
              id="signup-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account…' : 'Create Account'}
              {!isSubmitting && <ArrowRight size={20} className="btn__icon" />}
            </button>

            <p className="signup-card__footer-text">
              Already have an account?{' '}
              <Link to="/login" className="signup-card__footer-link">Log in</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
