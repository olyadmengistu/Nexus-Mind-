
export interface User {
  id: string;
  name: string;
  avatar: string;
  reputation: number;
  bio?: string;
}

export interface Solution {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  upvotes: number;
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
  text: string;
  time: string;
  read: boolean;
  avatar: string;
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
