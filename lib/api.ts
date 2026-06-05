// API utility functions for calling Vercel serverless functions

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('supabase_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return response.json();
};

// Auth endpoints
export const authAPI = {
  signup: (data: any) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: any) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  google: (accessToken: string) => apiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  }),
  logout: () => apiCall('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  }),
};

// Posts endpoints
export const postsAPI = {
  getAll: (page = 1, limit = 20) => apiCall(`/posts?page=${page}&limit=${limit}`),
  getById: (id: string) => apiCall(`/posts/${id}`),
  create: (data: any) => apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/posts/${id}`, {
    method: 'DELETE',
  }),
  vote: (id: string, vote: number) => apiCall(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ vote }),
  }),
};

// Solutions endpoints
export const solutionsAPI = {
  create: (data: any) => apiCall('/solutions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/solutions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/solutions/${id}`, {
    method: 'DELETE',
  }),
};
