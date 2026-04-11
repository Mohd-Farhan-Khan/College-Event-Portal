import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';

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
        }
      } catch {
        // Token expired / invalid — clear it
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
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
  }, []);

  /**
   * Clear the session.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
