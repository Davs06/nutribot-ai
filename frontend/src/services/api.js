import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  registerWeight: (data) => api.post('/auth/weight-log', data),
  getWeightHistory: (days = 30) => api.get(`/auth/weight-log?days=${days}`),
};

// Serviços de Alimentação
export const food = {
  search: (query) => api.get(`/food/search?query=${query}`),
  getNutrients: (fdcId) => api.get(`/food/nutrients/${fdcId}`),
  registerMeal: (data) => api.post('/food/meal', data),
  analyzeImage: (formData) =>
    api.post('/food/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeText: (description) => api.post('/food/analyze-text', { description }),
  getMeals: (period = 'today') => api.get(`/food/meals?period=${period}`),
  getDailySummary: () => api.get('/food/daily-summary'),
  deleteMeal: (id) => api.delete(`/food/meals/${id}`),
};

// Serviços de Exercícios
export const exercises = {
  list: (category) => api.get(`/exercises${category ? `?category=${category}` : ''}`),
  search: (query) => api.get(`/exercises/search?query=${query}`),
  register: (data) => api.post('/exercises', data),
  getHistory: (period = 'all') => api.get(`/exercises/history?period=${period}`),
  getStats: () => api.get('/exercises/stats'),
  delete: (id) => api.delete(`/exercises/${id}`),
  addCustom: (data) => api.post('/exercises/custom', data),
};

// Serviços de Água
export const water = {
  register: (data) => api.post('/water', data),
  getToday: () => api.get('/water/today'),
  getStats: (period = 'week') => api.get(`/water/stats?period=${period}`),
  updateGoal: (data) => api.put('/water/goal', data),
  delete: (id) => api.delete(`/water/${id}`),
  getRecommendedGoal: () => api.get('/water/recommended-goal'),
};

// Serviços do Dashboard
export const dashboard = {
  get: (period = 'week') => api.get(`/dashboard?period=${period}`),
  getRecommendations: () => api.get('/dashboard/recommendations'),
  chatWithCoach: (pergunta) => api.post('/dashboard/coach', { pergunta }),
};

export default api;
