import { apiRequest } from './httpClient';

// ==================== USER API ====================

export const userApi = {
  createProfile: async (userId: string, data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ id: userId, ...data }),
    });
  },

  getProfile: async (userId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(`/api/users/${userId}`);
  },

  updateProfile: async (userId: string, data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getAllUsers: async (queryStr?: string) => {
    const params = queryStr ? `?query=${encodeURIComponent(queryStr)}` : '';
    return apiRequest<Array<{ id: string } & Record<string, unknown>>>(`/api/users${params}`);
  },

  getSavedItems: async (userId: string) => {
    return apiRequest<unknown[]>(`/api/users/${userId}/saved`);
  },

  saveItem: async (userId: string, item: unknown) => {
    return apiRequest<{ success: boolean }>(`/api/users/${userId}/saved`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  removeSavedItem: async (userId: string, itemId: string) => {
    return apiRequest<{ message: string }>(`/api/users/${userId}/saved/${itemId}`, {
      method: 'DELETE',
    });
  },

  getActivityLog: async (userId: string) => {
    return apiRequest<Array<{ id: string } & Record<string, unknown>>>(
      `/api/users/${userId}/activity`
    );
  },
};

// ==================== POSTS API ====================

export const postsApi = {
  getAllPosts: async (params?: { userId?: string; category?: string; sortBy?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    const qs = searchParams.toString();
    return apiRequest<Array<{ id: string; timestamp: number } & Record<string, unknown>>>(
      `/api/posts${qs ? `?${qs}` : ''}`
    );
  },

  getPost: async (postId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(`/api/posts/${postId}`);
  },

  createPost: async (data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePost: async (postId: string, data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost: async (postId: string) => {
    return apiRequest<{ message: string }>(`/api/posts/${postId}`, { method: 'DELETE' });
  },

  votePost: async (
    postId: string,
    delta: number,
    userId: string,
    userAvatar: string
  ) => {
    return apiRequest<{ id: string; votes: number } & Record<string, unknown>>(
      `/api/posts/${postId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ delta, userId, userAvatar }),
      }
    );
  },

  addSolution: async (postId: string, data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/posts/${postId}/solutions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  voteSolution: async (postId: string, solutionId: string, delta: number) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/posts/${postId}/solutions/${solutionId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ delta }),
      }
    );
  },

  markSolutionHelpful: async (postId: string, solutionId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/posts/${postId}/solutions/${solutionId}/helpful`,
      { method: 'POST' }
    );
  },

  addComment: async (postId: string, data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/posts/${postId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  getNotifications: async (userId: string) => {
    return apiRequest<Array<{ id: string } & Record<string, unknown>>>(
      `/api/users/${userId}/notifications`
    );
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/notifications/${notificationId}/read`,
      { method: 'PUT' }
    );
  },

  markAllAsRead: async (userId: string) => {
    return apiRequest<{ message: string }>(`/api/users/${userId}/notifications/read-all`, {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: string) => {
    return apiRequest<{ message: string }>(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== GROUPS API ====================

export const groupsApi = {
  getAllGroups: async (params?: { query?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.category) searchParams.set('category', params.category);
    const qs = searchParams.toString();
    return apiRequest<Array<{ id: string } & Record<string, unknown>>>(
      `/api/groups${qs ? `?${qs}` : ''}`
    );
  },

  getGroup: async (groupId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(`/api/groups/${groupId}`);
  },

  createGroup: async (data: Record<string, unknown>) => {
    return apiRequest<{ id: string } & Record<string, unknown>>('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  joinGroup: async (groupId: string, userId: string) => {
    return apiRequest<{ id: string } & Record<string, unknown>>(
      `/api/groups/${groupId}/join`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
  },
};

// ==================== SEARCH API ====================

export const searchApi = {
  globalSearch: async (query: string, type?: string) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.set('type', type);
    return apiRequest<{
      users: unknown[];
      posts: unknown[];
      groups: unknown[];
      videos?: unknown[];
      products?: unknown[];
    }>(`/api/search?${params}`);
  },
};

// ==================== FEEDBACK API ====================

export const feedbackApi = {
  submitFeedback: async (data: Record<string, unknown>) => {
    return apiRequest<{ success: boolean; message: string }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
