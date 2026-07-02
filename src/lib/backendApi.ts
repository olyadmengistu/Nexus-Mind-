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

// ==================== USER MANAGEMENT API ====================

export const userApi = {
  // Get user profile
  getUser: async (userId: string) => {
    return apiRequest<any>(`/api/users/${userId}`, {
      method: 'GET',
    });
  },

  // Update user profile
  updateUser: async (userId: string, updates: any) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== POSTS MANAGEMENT API ====================

export const postsApi = {
  // Get all posts with optional filters
  getPosts: async (params?: { limit?: number; category?: string; userId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/api/posts${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single post
  getPost: async (postId: string) => {
    return apiRequest<any>(`/api/posts/${postId}`, {
      method: 'GET',
    });
  },

  // Create post
  createPost: async (postData: any) => {
    return apiRequest<{ id: string; message: string }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Update post
  updatePost: async (postId: string, updates: any) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete post
  deletePost: async (postId: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Vote on post
  votePost: async (postId: string, userId: string, voteType: 'up' | 'down') => {
    return apiRequest<{ success: boolean; votes: any }>(`/api/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ userId, voteType }),
    });
  },
};

// ==================== COMMENTS API ====================

export const commentsApi = {
  // Get comments for a post
  getComments: async (postId: string) => {
    return apiRequest<any[]>(`/api/posts/${postId}/comments`, {
      method: 'GET',
    });
  },

  // Add comment to post
  addComment: async (postId: string, userId: string, text: string) => {
    return apiRequest<{ id: string; message: string }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userId, text }),
    });
  },

  // Delete comment
  deleteComment: async (commentId: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SOLUTIONS API ====================

export const solutionsApi = {
  // Add solution to post
  addSolution: async (postId: string, userId: string, description: string, code?: string) => {
    return apiRequest<{ id: string; message: string }>(`/api/posts/${postId}/solutions`, {
      method: 'POST',
      body: JSON.stringify({ userId, description, code }),
    });
  },

  // Vote on solution
  voteSolution: async (solutionId: string, userId: string, voteType: 'up' | 'down') => {
    return apiRequest<{ success: boolean; votes: any }>(`/api/solutions/${solutionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ userId, voteType }),
    });
  },

  // Mark solution as helpful
  markHelpful: async (solutionId: string, isHelpful: boolean) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/solutions/${solutionId}/helpful`, {
      method: 'PUT',
      body: JSON.stringify({ isHelpful }),
    });
  },
};

// ==================== ACTIVITY LOGGING API ====================

export const activityApi = {
  // Log user activity
  logActivity: async (userId: string, action: string, details?: any) => {
    return apiRequest<{ success: boolean; message: string }>('/api/activities', {
      method: 'POST',
      body: JSON.stringify({ userId, action, details }),
    });
  },

  // Get user activities
  getUserActivities: async (userId: string, limit: number = 50) => {
    return apiRequest<any[]>(`/api/users/${userId}/activities?limit=${limit}`, {
      method: 'GET',
    });
  },
};

// ==================== GROUPS MANAGEMENT API ====================

export const groupsApi = {
  // Get all groups
  getGroups: async () => {
    return apiRequest<any[]>('/api/groups', {
      method: 'GET',
    });
  },

  // Create group
  createGroup: async (name: string, description: string, creatorId: string, category?: string) => {
    return apiRequest<{ id: string; message: string }>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description, creatorId, category }),
    });
  },

  // Join group
  joinGroup: async (groupId: string, userId: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
};

// ==================== GLOBAL SEARCH API ====================

export const searchApi = {
  // Global search across users, posts, groups
  search: async (query: string, type?: 'users' | 'posts' | 'groups') => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return apiRequest<{ users: any[]; posts: any[]; groups: any[] }>(`/api/search?${params.toString()}`, {
      method: 'GET',
    });
  },
};

// ==================== LEADERBOARD API ====================

export const leaderboardApi = {
  // Get global leaderboard
  getGlobal: async (limit?: number, timeFrame?: 'all' | 'weekly' | 'monthly') => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (timeFrame) params.append('timeFrame', timeFrame);
    return apiRequest<{ timeFrame: string; leaderboard: any[] }>(`/api/leaderboard/global?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Get domain-specific leaderboard
  getDomain: async (domainId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<{ domainId: string; leaderboard: any[] }>(`/api/leaderboard/domain/${domainId}${params}`, {
      method: 'GET',
    });
  },

  // Get streak leaderboard
  getStreaks: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<{ leaderboard: any[] }>(`/api/leaderboard/streaks${params}`, {
      method: 'GET',
    });
  },

  // Get badge leaderboard
  getBadges: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<{ leaderboard: any[] }>(`/api/leaderboard/badges${params}`, {
      method: 'GET',
    });
  },
};

// ==================== EXPERTISE API ====================

export const expertiseApi = {
  // Get all expertise domains
  getDomains: async () => {
    return apiRequest<any[]>('/api/expertise/domains', {
      method: 'GET',
    });
  },

  // Get user's expertise scores
  getUserExpertise: async (userId: string) => {
    return apiRequest<{ expertiseScores: any[]; overallExpertise: number }>(`/api/users/${userId}/expertise`, {
      method: 'GET',
    });
  },

  // Update user's expertise scores
  updateExpertise: async (userId: string) => {
    return apiRequest<{ expertiseScores: any[]; overallExpertise: number; message: string }>(`/api/users/${userId}/expertise/update`, {
      method: 'POST',
    });
  },

  // Get experts by domain
  getExpertsByDomain: async (domainId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<{ domain: string; experts: any[] }>(`/api/expertise/${domainId}/experts${params}`, {
      method: 'GET',
    });
  },
};

// ==================== BADGE API ====================

export const badgesApi = {
  // Get all badge definitions
  getDefinitions: async () => {
    return apiRequest<any[]>('/api/badges/definitions', {
      method: 'GET',
    });
  },

  // Get user's badges
  getUserBadges: async (userId: string) => {
    return apiRequest<{ badges: any[]; progress: any[] }>(`/api/users/${userId}/badges`, {
      method: 'GET',
    });
  },

  // Check and award badges
  checkBadges: async (userId: string) => {
    return apiRequest<{ newBadges: any[]; updatedProgress: any[]; totalBadges: number }>(`/api/users/${userId}/badges/check`, {
      method: 'POST',
    });
  },
};

// ==================== STREAK API ====================

export const streakApi = {
  // Update user streak
  updateStreak: async (userId: string) => {
    return apiRequest<{ streak: number; longestStreak: number; streakFreezes: number; message: string }>(`/api/users/${userId}/streak`, {
      method: 'POST',
    });
  },

  // Add streak freeze
  addStreakFreeze: async (userId: string) => {
    return apiRequest<{ streakFreezes: number; message: string }>(`/api/users/${userId}/streak/freeze`, {
      method: 'POST',
    });
  },

  // Get streak leaderboard
  getLeaderboard: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest<any[]>(`/api/streaks/leaderboard${query}`, {
      method: 'GET',
    });
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  // Get all notifications for user
  getNotifications: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest<any[]>(`/api/notifications${query}`, {
      method: 'GET',
    });
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest<{ success: boolean; count: number }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    return apiRequest<{ success: boolean }>(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CONVERSATIONS API ====================

export const conversationsApi = {
  // Get all conversations for user
  getConversations: async () => {
    return apiRequest<any[]>('/api/conversations', {
      method: 'GET',
    });
  },

  // Create new conversation
  createConversation: async (participantIds: string[], name?: string, isGroup?: boolean) => {
    return apiRequest<{ id: string; message: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantIds, name, isGroup }),
    });
  },

  // Get messages for conversation
  getMessages: async (conversationId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest<any[]>(`/api/conversations/${conversationId}/messages${query}`, {
      method: 'GET',
    });
  },

  // Send message
  sendMessage: async (conversationId: string, text: string, imageUrl?: string) => {
    return apiRequest<{ id: string; message: string }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, imageUrl }),
    });
  },

  // Mark messages as read
  markAsRead: async (conversationId: string) => {
    return apiRequest<{ success: boolean }>(`/api/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  },
};

// ==================== SAVED ITEMS API ====================

export const savedItemsApi = {
  // Get saved items for user
  getSavedItems: async (userId: string) => {
    return apiRequest<any[]>(`/api/users/${userId}/saved`, {
      method: 'GET',
    });
  },

  // Save item
  saveItem: async (userId: string, itemId: string, itemType: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/users/${userId}/saved`, {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType }),
    });
  },

  // Remove saved item
  removeSavedItem: async (userId: string, savedId: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/users/${userId}/saved/${savedId}`, {
      method: 'DELETE',
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
  userApi,
  postsApi,
  commentsApi,
  solutionsApi,
  activityApi,
  groupsApi,
  searchApi,
  leaderboardApi,
  expertiseApi,
  badgesApi,
  streakApi,
  notificationsApi,
  conversationsApi,
  savedItemsApi,
  analyticsApi,
};
