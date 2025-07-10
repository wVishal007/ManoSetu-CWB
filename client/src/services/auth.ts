import axios from 'axios';

// ✅ Ensure environment variable is defined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // if your backend uses cookies
});

// ✅ Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ Log errors for debugging (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export interface AuthUser {
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

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await api.post('/api/v1/user/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const res = await api.post('/api/v1/user/register', { name, email, password });
    return res.data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const res = await api.get('/api/v1/user/me');
    return res.data.user;
  },

  updateProfile: async (profileData: Partial<AuthUser>): Promise<AuthUser> => {
    const res = await api.put('/api/v1/user/profile', profileData);
    return res.data.user;
  },
};
