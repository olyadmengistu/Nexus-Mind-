// API Client for NexusMind - Firebase Firestore
// This file now exports Firebase-based API functions
export { userApi, postsApi, notificationsApi, groupsApi, searchApi } from './firebaseApi';

// Placeholder for feedback API (can be implemented with Firebase Cloud Functions later)
export const feedbackApi = {
  submitFeedback: async (data: any) => {
    console.log('Feedback submitted:', data);
    return { success: true };
  },
};

// WebSocket client removed - using Firebase Realtime Database for real-time features
export const socketClient = {
  connect: () => {
    console.warn('Socket.io removed - using Firebase Realtime Database for real-time features');
    return null;
  },
  disconnect: () => {},
  join: () => {},
  joinConversation: () => {},
  sendMessage: () => {},
  sendTyping: () => {},
  on: () => {},
  off: () => {},
};
