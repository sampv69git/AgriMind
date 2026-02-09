import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') || '';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/farmer/check-auth`);
      setIsAuthenticated(response.ok);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/farmer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        let message = 'Login failed';
        try {
          const data = await response.json();
          message = data?.error || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }
      
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/farmer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        let message = 'Registration failed';
        try {
          const data = await response.json();
          message = data?.error || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }
      
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/farmer/logout`, { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
