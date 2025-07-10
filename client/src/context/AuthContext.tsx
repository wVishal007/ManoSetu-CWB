import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  profile?: {
    age?: number;
    gender?: string;
    preferences?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Init Auth on mount
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await authService.getCurrentUser(savedToken); // pass token if needed
          setUser(userData);
          setToken(savedToken);
        } catch (err) {
          console.error('Auth init failed', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
