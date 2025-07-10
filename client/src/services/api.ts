import axios from 'axios';

// ✅ Pull base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL
// ✅ Axios instance with CORS & credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Automatically attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ API methods
const apiService = {
  // 🔐 User Authentication
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post('/api/v1/user/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/api/v1/user/login', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/api/v1/user/profile');
    return res.data;
  },

  // 💬 Chat Messaging
  sendMessage: async (
    message: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ) => {
    const res = await api.post('/chat', { message, conversationHistory });
    return res.data;
  },
};

export default apiService;
