// Unified API client — Firebase for direct data access, Backend for server-side features
export {
  userApi,
  postsApi,
  notificationsApi,
  groupsApi,
  searchApi,
  liveStreamsApi,
  videosApi,
  meetingsApi,
  activitiesApi,
  collaborationsApi,
  conversationsApi,
  productsApi,
  inspirationsApi,
  feedbackApi,
} from './firebaseApi';

// Backend API for server-side features (auth, feedback, uploads, health check)
export {
  authApi,
  backendFeedbackApi,
  backendUploadApi,
  backendHealthApi,
} from './backendApi';

export { socketClient } from './socketClient';
export { apiRequest, checkBackendHealth, ApiError } from './httpClient';
