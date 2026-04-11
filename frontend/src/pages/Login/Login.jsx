import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin } from '../../services/api';
import eventTalkImg from '../../assets/event-talk.png';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const { user, saveSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Redirect if already logged in */
  useEffect(() => {
    if (user) navigate('/events', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiLogin({ email, password });

      // Save token + user in auth context + localStorage
      saveSession({ token: data.token, user: data.user });

      // Role-based redirect per frontend-guidelines
      const role = data.user.role;
      if (role === 'admin') {
        navigate('/admin/users');
      } else if (role === 'college') {
        navigate('/college/events/new');
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-main">
        <div className="login-card" id="login-card">

          {/* ── Form Side ── */}
          <div className="login-card__form-side">
            <div className="login-card__form-inner">
              <div className="login-card__header">
                <h1 className="login-card__title font-serif">Welcome back</h1>
                <p className="login-card__subtitle">Enter your details to access your events.</p>
              </div>

              {error && (
                <div className="login-card__error" id="login-error" role="alert">
                  {error}
                </div>
              )}

              <form className="login-card__form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="login-email" className="form-field__label">College Email</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="student@university.edu"
                    className="form-field__input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-field">
                  <div className="form-field__label-row">
                    <label htmlFor="login-password" className="form-field__label">Password</label>
                    <span className="form-field__helper-link">Forgot password?</span>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="form-field__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--dark btn--full btn--submit"
                  id="login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                  {!isSubmitting && <ArrowRight size={16} className="btn__icon" />}
                </button>
              </form>

              <p className="login-card__footer-text">
                Don't have an account?{' '}
                <Link to="/signup" className="login-card__footer-link">Sign up instead</Link>
              </p>
            </div>
          </div>

          {/* ── Editorial Image Side ── */}
          <div className="login-card__image-side">
            <img
              src={eventTalkImg}
              alt="Students gathering at a campus talk"
              className="login-card__image"
            />
            <div className="login-card__image-overlay"></div>

            <div className="login-card__testimonial">
              <blockquote className="login-card__quote font-serif">
                "EventHub transformed how our theater club reaches students. We sold out three nights in a row."
              </blockquote>
              <div className="login-card__author">
                <div className="login-card__avatar">SJ</div>
                <div>
                  <div className="login-card__author-name">Sarah Jenkins</div>
                  <div className="login-card__author-role">Drama Society President</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
