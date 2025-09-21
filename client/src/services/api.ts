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
    (await api.post('/v1/chat', { message, conversationHistory })).data,

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
  
  // 🔹 Therapists
getTherapists: async (): Promise<any[]> => {
  try {
    const params = new URLSearchParams({
      role: 'therapist',
      isVerified: 'true',
    });

    const response = await api.get(`/v1/user?${params.toString()}`);
    // console.log(response.data);
    
    return response.data.users; // Assuming the API returns an array of users
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return []; // Return empty array on failure
  }
},


  applyToBeTherapist: async (applicationData: {
    bio: string;
    specialties: string[];
    licenseNumber: string;
  }) => {
    return (await api.put('/v1/user/profile', {
      role: 'therapist',
      profile: applicationData,
    })).data;
  },
  
  // ✅ Add these new methods
  getTherapistApplications: async () => {
    const response = await api.get('/v1/admin/applications');

    return response.data;
  },
  
  moderateTherapistApplication: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.put(`/v1/admin/applications/${id}/moderate`, { action });
console.log("l2",response.data);

    return response.data;
  },

getVideoToken:async(id:string)=>{
    const response = await api.get(`/v1/session/${id}/token`)
    return response.data
},
// 🔹 Sessions
scheduleSession: async (data: {
  therapistId: string;
  startTime: string;   // ISO string
  endTime: string;     // ISO string
  durationMinutes: number;
}) => {
  return (await api.post('/v1/session/schedule', data)).data;
},

getMySessions: async () => {
  return (await api.get('/v1/session/my-sessions')).data;
},

startSession: async (id: string) => {
  return (await api.post(`/v1/session/${id}/start`)).data;
},

endSession: async (id: string) => {
  return (await api.post(`/v1/session/${id}/end`)).data;
},


}




// ✅ Export default
export default apiService;