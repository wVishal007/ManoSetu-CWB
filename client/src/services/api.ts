import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ Needed for CORS and cookies/auth headers
});

// ✅ Automatically attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ All services
export const apiService = {
  // ✅ Auth
  register: async (data: any) => {
    const response = await api.post('/v1/user/register', data);
    return response.data;
  },

  login: async (data: any) => {
    const response = await api.post('/v1/user/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/v1/user/profile');
    return response.data;
  },

  // ✅ Chat
  sendMessage: async (message: string, conversationHistory: any[] = []) => {
    const response = await api.post('/v1/chat', { message, conversationHistory });
    return response.data;
  },

  getChatHistory: async (limit = 50, page = 1) => {
    const response = await api.get(`/v1/chat/history?limit=${limit}&page=${page}`);
    return response.data;
  },

  // ✅ Mood
  logMood: async (moodData: any) => {
    const response = await api.post('/v1/mood', moodData);
    return response.data;
  },

  getMoodHistory: async (limit = 30, page = 1) => {
    const response = await api.get(`/v1/mood/history?limit=${limit}&page=${page}`);
    return response.data;
  },

  getMoodStats: async (days = 30) => {
    const response = await api.get(`/v1/mood/stats?days=${days}`);
    return response.data;
  },

  getTodayMood: async () => {
    const response = await api.get('/v1/mood/today');
    return response.data;
  },

  // ✅ Exercises
  getExercises: async (category?: string, difficulty?: string, limit = 20, page = 1) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const response = await api.get(`/v1/exercise?${params}`);
    return response.data;
  },

  getExercise: async (id: string) => {
    const response = await api.get(`/v1/exercise/${id}`);
    return response.data;
  },

  completeExercise: async (id: string, data: any) => {
    const response = await api.post(`/v1/exercise/${id}/complete`, data);
    return response.data;
  },

  getCompletedExercises: async (limit = 20, page = 1) => {
    const response = await api.get(`/v1/exercise/user/completed?limit=${limit}&page=${page}`);
    return response.data;
  },

  getExerciseStats: async (days = 30) => {
    const response = await api.get(`/v1/exercise/user/stats?days=${days}`);
    return response.data;
  },

  // ✅ Forum
  getPosts: async (category?: string, sort = 'recent', limit = 20, page = 1) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    params.append('sort', sort);
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const response = await api.get(`/v1/forum/posts?${params}`);
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get(`/v1/forum/posts/${id}`);
    return response.data;
  },

  createPost: async (postData: any) => {
    const response = await api.post('/v1/forum/posts', postData);
    return response.data;
  },

  addComment: async (postId: string, commentData: any) => {
    const response = await api.post(`/v1/forum/posts/${postId}/comments`, commentData);
    return response.data;
  },

  votePost: async (postId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    const response = await api.post(`/v1/forum/posts/${postId}/vote`, { voteType });
    return response.data;
  },

  voteComment: async (commentId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    const response = await api.post(`/v1/forum/comments/${commentId}/vote`, { voteType });
    return response.data;
  },

  flagPost: async (postId: string, reason: string) => {
    const response = await api.post(`/v1/forum/posts/${postId}/flag`, { reason });
    return response.data;
  },

  // ✅ Admin
  getAdminStats: async () => {
    const response = await api.get('/v1/admin/stats');
    return response.data;
  },

  getFlaggedContent: async (type = 'posts', limit = 20, page = 1) => {
    const response = await api.get(`/v1/admin/flagged?type=${type}&limit=${limit}&page=${page}`);
    return response.data;
  },

  moderateContent: async (type: 'post' | 'comment', id: string, action: 'approve' | 'delete') => {
    const response = await api.post(`/v1/admin/moderate/${type}/${id}`, { action });
    return response.data;
  },

  getUsers: async (limit = 20, page = 1, search = '') => {
    const response = await api.get(`/v1/admin/users?limit=${limit}&page=${page}&search=${search}`);
    return response.data;
  },
};
