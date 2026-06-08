
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  reputation: number;
  bio?: string;
}

export interface SolutionReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface Solution {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  upvotes: number;
  helpful: number;
  replies: SolutionReply[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  category: string;
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  votes: number;
  solutions: Solution[];
  isSolved: boolean;
  taggedUsers?: string[];
  emoji?: string;
  location?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  thumbnail: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'reply' | 'like' | 'follow' | 'solution' | 'vote' | 'system';
  text: string;
  time: string;
  createdAt: number;
  read: boolean;
  avatar: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage: string;
  time: string;
}

// Video/Meeting Types
export interface Video {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: number;
  duration: string;
  timestamp: number;
  category: string;
  tags: string[];
}

export interface Meeting {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  description: string;
  scheduledTime: number;
  duration: number;
  participants: User[];
  maxParticipants: number;
  status: 'scheduled' | 'live' | 'ended';
  meetingUrl: string;
}

// Marketplace Types
export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  stock: number;
  rating: number;
  reviews: number;
  timestamp: number;
  location?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: number;
  shippingAddress: string;
}

// Groups/Community Types
export interface Group {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  coverImage: string;
  members: User[];
  posts: GroupPost[];
  isPrivate: boolean;
  memberCount: number;
  timestamp: number;
}

export interface GroupPost {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  comments: GroupComment[];
}

export interface GroupComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

// Collaboration/Partnership Types
export interface Collaboration {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  category: string;
  type: 'project' | 'partnership' | 'mentorship' | 'investment';
  requiredSkills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  applicants: CollaborationApplicant[];
  selectedPartner?: User;
  timestamp: number;
  deadline?: number;
  budget?: number;
}

export interface CollaborationApplicant {
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  skills: string[];
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

// Daily Reflection Types
export interface DailyReflection {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  timestamp: number;
  likes: number;
}

// Contact Types
export interface Contact {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: number;
  bio?: string;
  email?: string;
  phone?: string;
}
