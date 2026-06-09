
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  reputation: number;
  bio?: string;
  savedItems?: SavedItem[];
  education?: string;
  location?: string;
  work?: string;
  expertise?: string[];
  coverPhoto?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'post' | 'solution' | 'video' | 'product' | 'group' | 'collaboration' | 'stream';
  itemId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  timestamp: number;
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

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  expiresAt?: number;
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
  videoUrl?: string;
  gifUrl?: string;
  timestamp: number;
  votes: number;
  solutions: Solution[];
  isSolved: boolean;
  taggedUsers?: string[];
  emoji?: string;
  location?: string;
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  poll?: Poll;
  scheduledTime?: number;
  privacy?: 'public' | 'friends' | 'private';
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

export interface LiveStream {
  id: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
  streamUrl: string;
  streamKey: string;
  category: string;
  tags: string[];
  viewers: number;
  likes: number;
  status: 'offline' | 'live' | 'scheduled';
  scheduledTime?: number;
  startedAt?: number;
  endedAt?: number;
  duration?: number;
  isRecording: boolean;
  allowChat: boolean;
  isPrivate: boolean;
  maxViewers?: number;
  timestamp: number;
}

export interface LiveChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  isModerator: boolean;
  isStreamer: boolean;
}

export interface StreamViewer {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: number;
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

// Sponsored Content Types
export interface SponsoredContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sponsorName: string;
  sponsorUrl: string;
  category: string;
  ctaText?: string;
  ctaUrl?: string;
  startDate: number;
  endDate: number;
  clicks: number;
  impressions: number;
  isSaved: boolean;
  tags?: string[];
}
