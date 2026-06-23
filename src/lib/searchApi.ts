import { User, Video, Collaboration, Group, Product, Conversation } from '../types';
import { searchApi } from './api';

// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Search parameters interfaces
interface UserSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

interface VideoSearchParams {
  query: string;
  category?: string;
  sortBy?: 'recent' | 'views' | 'likes';
  limit?: number;
  offset?: number;
}

interface CollaborationSearchParams {
  query: string;
  category?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

interface GroupSearchParams {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
  offset?: number;
}

interface ConversationSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

// Helper function to simulate API calls (replace with actual fetch when backend is ready)
async function simulateApiCall<T>(data: T, delay: number = 300): Promise<ApiResponse<T>> {
  await new Promise(resolve => setTimeout(resolve, delay));
  return { data, success: true };
}

// User Search API
export const searchUsers = async (params: UserSearchParams): Promise<ApiResponse<User[]>> => {
  try {
    const results = await searchApi.globalSearch(params.query, 'users');
    const users = (results.users as User[]).slice(
      params.offset || 0,
      (params.offset || 0) + (params.limit || 10)
    );
    return { data: users, success: true };
  } catch (error) {
    console.warn('Backend user search failed, using localStorage:', error);
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const query = params.query.toLowerCase();
    const results = users.filter((u: User) =>
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query)
    ).slice(params.offset || 0, (params.offset || 0) + (params.limit || 10));
    return simulateApiCall(results);
  }
};

// Video Search API
export const searchVideos = async (params: VideoSearchParams): Promise<ApiResponse<Video[]>> => {
  console.log('Backend: Search videos payload', params);
  
  // TODO: Replace with actual API call
  // const queryParams = new URLSearchParams({
  //   query: params.query,
  //   ...(params.category && { category: params.category }),
  //   ...(params.sortBy && { sortBy: params.sortBy }),
  //   limit: String(params.limit || 20),
  //   offset: String(params.offset || 0)
  // });
  // const response = await fetch(`${API_BASE_URL}/search/videos?${queryParams}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
  // });
  // return response.json();
  
  // Temporary: Use localStorage for demo
  const videos = JSON.parse(localStorage.getItem('nexus_videos') || '[]');
  const query = params.query.toLowerCase();
  let results = videos.filter((v: Video) =>
    v.title.toLowerCase().includes(query) ||
    v.description.toLowerCase().includes(query) ||
    v.tags.some((tag: string) => tag.toLowerCase().includes(query))
  );
  
  if (params.category && params.category !== 'All') {
    results = results.filter((v: Video) => v.category === params.category);
  }
  
  // Sort
  if (params.sortBy === 'recent') {
    results.sort((a: Video, b: Video) => b.timestamp - a.timestamp);
  } else if (params.sortBy === 'views') {
    results.sort((a: Video, b: Video) => b.views - a.views);
  } else if (params.sortBy === 'likes') {
    results.sort((a: Video, b: Video) => b.likes - a.likes);
  }
  
  return simulateApiCall(results.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20)));
};

// Collaboration Search API
export const searchCollaborations = async (params: CollaborationSearchParams): Promise<ApiResponse<Collaboration[]>> => {
  console.log('Backend: Search collaborations payload', params);
  
  // TODO: Replace with actual API call
  // const queryParams = new URLSearchParams({
  //   query: params.query,
  //   ...(params.category && { category: params.category }),
  //   ...(params.type && { type: params.type }),
  //   limit: String(params.limit || 20),
  //   offset: String(params.offset || 0)
  // });
  // const response = await fetch(`${API_BASE_URL}/search/collaborations?${queryParams}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
  // });
  // return response.json();
  
  // Temporary: Use localStorage for demo
  const collaborations = JSON.parse(localStorage.getItem('nexus_collaborations') || '[]');
  const query = params.query.toLowerCase();
  let results = collaborations.filter((c: Collaboration) =>
    c.title.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query)
  );
  
  if (params.category && params.category !== 'All') {
    results = results.filter((c: Collaboration) => c.category === params.category);
  }
  
  if (params.type && params.type !== 'All') {
    results = results.filter((c: Collaboration) => c.type === params.type);
  }
  
  return simulateApiCall(results.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20)));
};

// Group Search API
export const searchGroups = async (params: GroupSearchParams): Promise<ApiResponse<Group[]>> => {
  try {
    const results = await searchApi.globalSearch(params.query, 'groups');
    let groups = results.groups as Group[];
    if (params.category && params.category !== 'All') {
      groups = groups.filter((g) => g.category === params.category);
    }
    return {
      data: groups.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20)),
      success: true,
    };
  } catch (error) {
    console.warn('Backend group search failed, using localStorage:', error);
    const groups = JSON.parse(localStorage.getItem('nexus_groups') || '[]');
    const query = params.query.toLowerCase();
    let results = groups.filter((g: Group) =>
      g.name.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query)
    );
    if (params.category && params.category !== 'All') {
      results = results.filter((g: Group) => g.category === params.category);
    }
    return simulateApiCall(results.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20)));
  }
};

// Product Search API
export const searchProducts = async (params: ProductSearchParams): Promise<ApiResponse<Product[]>> => {
  console.log('Backend: Search products payload', params);
  
  // TODO: Replace with actual API call
  // const queryParams = new URLSearchParams({
  //   query: params.query,
  //   ...(params.category && { category: params.category }),
  //   ...(params.minPrice && { minPrice: String(params.minPrice) }),
  //   ...(params.maxPrice && { maxPrice: String(params.maxPrice) }),
  //   ...(params.condition && { condition: params.condition }),
  //   limit: String(params.limit || 20),
  //   offset: String(params.offset || 0)
  // });
  // const response = await fetch(`${API_BASE_URL}/search/products?${queryParams}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
  // });
  // return response.json();
  
  // Temporary: Use localStorage for demo
  const products = JSON.parse(localStorage.getItem('nexus_products') || '[]');
  const query = params.query.toLowerCase();
  let results = products.filter((p: Product) =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
  
  if (params.category && params.category !== 'All') {
    results = results.filter((p: Product) => p.category === params.category);
  }
  
  if (params.minPrice) {
    results = results.filter((p: Product) => p.price >= params.minPrice);
  }
  
  if (params.maxPrice) {
    results = results.filter((p: Product) => p.price <= params.maxPrice);
  }
  
  if (params.condition) {
    results = results.filter((p: Product) => p.condition === params.condition);
  }
  
  return simulateApiCall(results.slice(params.offset || 0, (params.offset || 0) + (params.limit || 20)));
};

// Conversation Search API
export const searchConversations = async (params: ConversationSearchParams): Promise<ApiResponse<Conversation[]>> => {
  console.log('Backend: Search conversations payload', params);
  
  // TODO: Replace with actual API call
  // const queryParams = new URLSearchParams({
  //   query: params.query,
  //   limit: String(params.limit || 20),
  //   offset: String(params.offset || 0)
  // });
  // const response = await fetch(`${API_BASE_URL}/search/conversations?${queryParams}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
  // });
  // return response.json();
  
  // Temporary: Use localStorage for demo
  const conversations = JSON.parse(localStorage.getItem('nexus_conversations') || '[]');
  const query = params.query.toLowerCase();
  const results = conversations.filter((c: Conversation) => {
    const otherParticipant = c.participants.find((p: User) => p.name.toLowerCase().includes(query) || p.username.toLowerCase().includes(query));
    return otherParticipant !== undefined;
  }).slice(params.offset || 0, (params.offset || 0) + (params.limit || 20));
  
  return simulateApiCall(results);
};

// Debounce utility for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
