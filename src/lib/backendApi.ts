// Backend API Client for NexusMind
// Handles communication with Express backend for server-side features only
// Data operations (users, posts, notifications, etc.) use Firebase directly
import { apiRequest } from './httpClient';

// ==================== AUTHENTICATION ====================

export const authApi = {
  // Verify Firebase token and get JWT
  verifyToken: async (idToken: string) => {
    return apiRequest<{ uid: string; email: string; token: string }>('/api/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },
};

// ==================== FEEDBACK ====================

export const backendFeedbackApi = {
  // Submit feedback (sends email notification)
  submitFeedback: async (data: { name: string; email: string; message: string; type?: string }) => {
    return apiRequest<{ success: boolean; message: string }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== FILE UPLOAD ====================

export const backendUploadApi = {
  // Upload file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// ==================== HEALTH CHECK ====================

export const backendHealthApi = {
  // Check backend health
  checkHealth: async () => {
    return apiRequest<{ status: string; timestamp: string }>('/api/health', {
      method: 'GET',
    });
  },
};

// ==================== ANALYTICS API ====================

export const analyticsApi = {
  // Get real-time analytics overview
  getOverview: async () => {
    return apiRequest<{
      activeUsers: number;
      totalUsers: number;
      totalSessions: number;
      peakActiveUsers: number;
      peakTime: string | null;
      messagesSent: number;
      notificationsSent: number;
      timestamp: string;
    }>('/api/analytics/overview', {
      method: 'GET',
    });
  },

  // Get active users list
  getActiveUsers: async () => {
    return apiRequest<any[]>('/api/analytics/active-users', {
      method: 'GET',
    });
  },

  // Get hourly stats
  getHourlyStats: async (hours: number = 24) => {
    return apiRequest<any[]>(`/api/analytics/hourly?hours=${hours}`, {
      method: 'GET',
    });
  },

  // Get daily stats
  getDailyStats: async (days: number = 7) => {
    return apiRequest<any[]>(`/api/analytics/daily?days=${days}`, {
      method: 'GET',
    });
  },

  // Get geographic distribution
  getGeographicData: async () => {
    return apiRequest<{ country: string; count: number }[]>('/api/analytics/geographic', {
      method: 'GET',
    });
  },

  // Get device distribution
  getDeviceData: async () => {
    return apiRequest<{ device: string; count: number }[]>('/api/analytics/devices', {
      method: 'GET',
    });
  },

  // Get page views
  getPageViews: async () => {
    return apiRequest<{ page: string; count: number }[]>('/api/analytics/page-views', {
      method: 'GET',
    });
  },

  // Get user activity details
  getUserActivity: async (userId: string) => {
    return apiRequest<any>(`/api/analytics/user-activity/${userId}`, {
      method: 'GET',
    });
  },

  // Get realtime events feed
  getRealtimeEvents: async (limit: number = 50) => {
    return apiRequest<any[]>(`/api/analytics/events?limit=${limit}`, {
      method: 'GET',
    });
  },
};

export default {
  authApi,
  backendFeedbackApi,
  backendUploadApi,
  backendHealthApi,
  analyticsApi,
};
