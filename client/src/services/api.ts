import axios from 'axios';

// ✅ Use environment variable safely
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE}/api`;

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ Response error interceptor (optional, good for debugging)
api.interceptors.response.use(
  res => res,
  err => {
    console.error("❌ API Error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ✅ API Methods
const apiService = {
  // 🔹 Chat
  sendMessage: async (message: string, conversationHistory: any[] = []) =>
    (await api.post('/chat', { message, conversationHistory })).data,

  getChatHistory: async (limit = 50, page = 1) =>
    (await api.get(`/v1/chat/history?limit=${limit}&page=${page}`)).data,

  // 🔹 Mood
  logMood: async (moodData: any) =>
    (await api.post('/v1/mood', moodData)).data,

  getMoodHistory: async (limit = 30, page = 1) =>
    (await api.get(`/v1/mood/history?limit=${limit}&page=${page}`)).data,

  getMoodStats: async (days = 30) =>
    (await api.get(`/v1/mood/stats?days=${days}`)).data,

  getTodayMood: async () =>
    (await api.get('/v1/mood/today')).data,

  // 🔹 Exercises
  getExercises: async (category?: string, difficulty?: string, limit = 20, page = 1) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    params.append('limit', String(limit));
    params.append('page', String(page));

    return (await api.get(`/v1/exercise?${params.toString()}`)).data;
  },

  getExercise: async (id: string) =>
    (await api.get(`/v1/exercise/${id}`)).data,

  completeExercise: async (id: string, data: any) =>
    (await api.post(`/v1/exercise/${id}/complete`, data)).data,

  getCompletedExercises: async (limit = 20, page = 1) =>
    (await api.get(`/v1/exercise/user/completed?limit=${limit}&page=${page}`)).data,

  getExerciseStats: async (days = 30) =>
    (await api.get(`/v1/exercise/user/stats?days=${days}`)).data,

  // 🔹 Forum
  getPosts: async (category?: string, sort = 'recent', limit = 20, page = 1) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    params.append('sort', sort);
    params.append('limit', String(limit));
    params.append('page', String(page));

    return (await api.get(`/v1/forum/posts?${params.toString()}`)).data;
  },

  getPost: async (id: string) =>
    (await api.get(`/v1/forum/posts/${id}`)).data,

  createPost: async (postData: any) =>
    (await api.post('/v1/forum/posts', postData)).data,

  addComment: async (postId: string, commentData: any) =>
    (await api.post(`/v1/forum/posts/${postId}/comments`, commentData)).data,

  votePost: async (postId: string, voteType: 'upvote' | 'downvote' | 'remove') =>
    (await api.post(`/v1/forum/posts/${postId}/vote`, { voteType })).data,

  voteComment: async (commentId: string, voteType: 'upvote' | 'downvote' | 'remove') =>
    (await api.post(`/v1/forum/comments/${commentId}/vote`, { voteType })).data,

  flagPost: async (postId: string, reason: string) =>
    (await api.post(`/v1/forum/posts/${postId}/flag`, { reason })).data,

  // 🔹 Admin
  getAdminStats: async () =>
    (await api.get('/v1/admin/stats')).data,

  getFlaggedContent: async (type = 'posts', limit = 20, page = 1) =>
    (await api.get(`/v1/admin/flagged?type=${type}&limit=${limit}&page=${page}`)).data,

  moderateContent: async (type: 'post' | 'comment', id: string, action: 'approve' | 'delete') =>
    (await api.post(`/v1/admin/moderate/${type}/${id}`, { action })).data,

  getUsers: async (limit = 20, page = 1, search = '') =>
    (await api.get(`/v1/admin/users?limit=${limit}&page=${page}&search=${search}`)).data,
};

// ✅ Export default
export default apiService;
