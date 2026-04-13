import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, request } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Wraps the app and provides:
 *  - user         – the current user object (or null)
 *  - token        – the JWT string (or null)
 *  - isLoading    – true while we're bootstrapping the session
 *  - saveSession  – call after login/register with { token, user }
 *  - logout       – clears session
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState(new Set());

  /**
   * On mount (or when token changes), try to restore the session
   * with GET /api/auth/me.
   */
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getMe();
        if (!cancelled) {
          setUser(data.user);
          // If student, fetch their registrations
          if (data.user.role === 'student') {
            try {
              const regs = await request('/api/registrations');
              if (!cancelled) {
                // Store a Set of registered event IDs for O(1) lookup
                const regSet = new Set(regs.map(r => r.event_id?._id || r.event_id || r.event));
                setUserRegistrations(regSet);
              }
            } catch (err) {
              console.error('Failed to fetch registrations', err);
            }
          }
        }
      } catch {
        // Token expired / invalid — clear it
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setUserRegistrations(new Set());
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [token]);

  /**
   * Save token + user after a successful login / register.
   */
  const saveSession = useCallback(({ token: newToken, user: newUser }) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    // Registrations will be fetched by the useEffect once token changes
  }, []);

  /**
   * Clear the session.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserRegistrations(new Set());
  }, []);

  /**
   * Add a registration (called when a student newly registers for an event)
   */
  const addRegistration = useCallback((eventId) => {
    setUserRegistrations(prev => new Set(prev).add(eventId));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, saveSession, logout, userRegistrations, addRegistration }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
