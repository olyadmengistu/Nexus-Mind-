// Unified API client — all data flows through the Express backend
export {
  userApi,
  postsApi,
  notificationsApi,
  groupsApi,
  searchApi,
  feedbackApi,
} from './backendApi';

export { socketClient } from './socketClient';
export { apiRequest, checkBackendHealth, ApiError } from './httpClient';
