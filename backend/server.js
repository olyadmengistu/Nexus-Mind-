import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { auth, db } from './firebaseAdmin.js';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'nexusmind_super_secret_jwt_key_2024_change_in_production';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Track active users and conversations
const activeUsers = new Map();
const conversations = new Map();

// ==================== REAL-TIME ANALYTICS TRACKING ====================

// Comprehensive user session tracking
const userSessions = new Map(); // userId -> session data
const analyticsData = {
  totalUsers: 0,
  activeUsers: 0,
  totalSessions: 0,
  peakActiveUsers: 0,
  peakTime: null,
  messagesSent: 0,
  notificationsSent: 0,
  hourlyStats: new Map(), // hour -> { users, sessions, messages }
  dailyStats: new Map(), // date -> { users, sessions, messages, peakUsers }
  userActivity: new Map(), // userId -> { lastActive, sessionCount, messagesSent }
  geographicData: new Map(), // country -> user count
  deviceData: new Map(), // device type -> user count
  pageViews: new Map(), // page -> view count
  realtimeEvents: [] // recent events for live feed
};

// Initialize hourly stats
const initializeHourlyStats = () => {
  const now = new Date();
  const hourKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
  if (!analyticsData.hourlyStats.has(hourKey)) {
    analyticsData.hourlyStats.set(hourKey, {
      users: 0,
      sessions: 0,
      messages: 0,
      notifications: 0,
      pageViews: 0,
      peakUsers: 0
    });
  }
  return hourKey;
};

// Initialize daily stats
const initializeDailyStats = () => {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!analyticsData.dailyStats.has(dateKey)) {
    analyticsData.dailyStats.set(dateKey, {
      users: 0,
      sessions: 0,
      messages: 0,
      notifications: 0,
      pageViews: 0,
      peakUsers: 0,
      peakTime: null
    });
  }
  return dateKey;
};

// Add realtime event
const addRealtimeEvent = (type, data) => {
  const event = {
    type,
    data,
    timestamp: new Date().toISOString()
  };
  analyticsData.realtimeEvents.unshift(event);
  if (analyticsData.realtimeEvents.length > 100) {
    analyticsData.realtimeEvents.pop();
  }
  // Broadcast to admin dashboard
  io.emit('analytics_event', event);
};

// Update peak users
const updatePeakUsers = (currentCount) => {
  if (currentCount > analyticsData.peakActiveUsers) {
    analyticsData.peakActiveUsers = currentCount;
    analyticsData.peakTime = new Date().toISOString();
    
    // Update hourly peak
    const hourKey = initializeHourlyStats();
    const hourStats = analyticsData.hourlyStats.get(hourKey);
    if (currentCount > hourStats.peakUsers) {
      hourStats.peakUsers = currentCount;
    }
    
    // Update daily peak
    const dateKey = initializeDailyStats();
    const dateStats = analyticsData.dailyStats.get(dateKey);
    if (currentCount > dateStats.peakUsers) {
      dateStats.peakUsers = currentCount;
      dateStats.peakTime = new Date().toISOString();
    }
  }
};

// Initialize stats
initializeHourlyStats();
initializeDailyStats();

// ==================== JWT AUTHENTICATION MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Firebase token required' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid Firebase token' });
  }
};

// ==================== REST API ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic user status endpoint
app.get('/api/users/:userId/status', (req, res) => {
  const { userId } = req.params;
  const isOnline = activeUsers.has(userId);
  res.json({ userId, isOnline, lastSeen: activeUsers.get(userId)?.lastSeen || null });
});

// ==================== CONVERSATIONS ENDPOINTS ====================

// Get all conversations for a user
app.get('/api/conversations', authenticateFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
app.post('/api/conversations', authenticateFirebaseToken, async (req, res) => {
  try {
    const { participantIds, name, isGroup } = req.body;
    const userId = req.user.uid;
    
    const participants = [userId, ...participantIds];
    
    const conversationData = {
      participants,
      name: name || null,
      isGroup: isGroup || false,
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null
    };
    
    const docRef = await db.collection('conversations').add(conversationData);
    
    res.status(201).json({
      id: docRef.id,
      ...conversationData
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:conversationId/messages', authenticateFirebaseToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const snapshot = await db.collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const messages = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .reverse();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message to a conversation
app.post('/api/conversations/:conversationId/messages', authenticateFirebaseToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, imageUrl } = req.body;
    const userId = req.user.uid;
    
    // Get user info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : { name: 'User', avatar: '' };
    
    const messageData = {
      conversationId,
      senderId: userId,
      senderName: userData.name || 'User',
      senderAvatar: userData.avatar || '',
      text: text || '',
      imageUrl: imageUrl || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      readBy: [userId]
    };
    
    const docRef = await db.collection('messages').add(messageData);
    
    // Update conversation's last message
    await db.collection('conversations').doc(conversationId).update({
      lastMessage: text || 'Image',
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      id: docRef.id,
      ...messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
app.put('/api/conversations/:conversationId/read', authenticateFirebaseToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uid;
    
    const snapshot = await db.collection('messages')
      .where('conversationId', '==', conversationId)
      .where('readBy', '!=', userId)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        readBy: admin.firestore.FieldValue.arrayUnion(userId)
      });
    });
    
    await batch.commit();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// ==================== NOTIFICATIONS ENDPOINTS ====================

// Get all notifications for a user
app.get('/api/notifications', authenticateFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 50;
    
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', authenticateFirebaseToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/read-all', authenticateFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    res.json({ success: true, count: snapshot.size });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
app.delete('/api/notifications/:notificationId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await db.collection('notifications').doc(notificationId).delete();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ==================== STREAK SYSTEM ENDPOINTS ====================

// Helper function to calculate streak
const calculateStreak = (lastActiveDate, currentStreak) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (lastActiveDate === today) {
    // Already active today, no change
    return currentStreak;
  } else if (lastActiveDate === yesterday) {
    // Active yesterday, increment streak
    return currentStreak + 1;
  } else {
    // Streak broken, reset to 1
    return 1;
  }
};

// Update user streak
app.post('/api/users/:userId/streak', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Can only update your own streak' });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = userData.lastActiveDate;
    
    let newStreak = userData.streak || 0;
    let longestStreak = userData.longestStreak || 0;
    let streakFreezes = userData.streakFreezes || 0;
    
    // Check if already active today
    if (lastActiveDate === today) {
      return res.json({
        streak: newStreak,
        longestStreak,
        streakFreezes,
        message: 'Streak already updated today'
      });
    }
    
    // Calculate new streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (lastActiveDate === yesterday) {
      // Continue streak
      newStreak += 1;
    } else if (lastActiveDate !== today) {
      // Check if streak freeze should be used
      const daysDiff = Math.floor((Date.now() - new Date(lastActiveDate).getTime()) / 86400000);
      
      if (daysDiff <= 2 && streakFreezes > 0) {
        // Use streak freeze
        streakFreezes -= 1;
        newStreak += 1;
      } else {
        // Reset streak
        newStreak = 1;
      }
    }
    
    // Update longest streak
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }
    
    // Update user document
    await db.collection('users').doc(userId).update({
      streak: newStreak,
      longestStreak,
      lastActiveDate: today,
      streakFreezes,
      streakHistory: admin.firestore.FieldValue.arrayUnion({
        date: today,
        streak: newStreak
      })
    });
    
    res.json({
      streak: newStreak,
      longestStreak,
      streakFreezes,
      message: newStreak > (userData.streak || 0) ? 'Streak increased!' : 'Streak reset'
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// Use streak freeze
app.post('/api/users/:userId/streak/freeze', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Can only use your own streak freeze' });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const currentFreezes = userData.streakFreezes || 0;
    
    if (currentFreezes >= 3) {
      return res.status(400).json({ error: 'Maximum streak freezes reached' });
    }
    
    await db.collection('users').doc(userId).update({
      streakFreezes: currentFreezes + 1
    });
    
    res.json({
      streakFreezes: currentFreezes + 1,
      message: 'Streak freeze added'
    });
  } catch (error) {
    console.error('Error adding streak freeze:', error);
    res.status(500).json({ error: 'Failed to add streak freeze' });
  }
});

// Get streak leaderboard
app.get('/api/streaks/leaderboard', authenticateFirebaseToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const snapshot = await db.collection('users')
      .orderBy('streak', 'desc')
      .limit(limit)
      .get();
    
    const leaderboard = snapshot.docs.map(doc => ({
      userId: doc.id,
      name: doc.data().name,
      username: doc.data().username,
      avatar: doc.data().avatar,
      streak: doc.data().streak || 0,
      longestStreak: doc.data().longestStreak || 0
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching streak leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Send streak reminder notifications (scheduled job endpoint)
app.post('/api/streaks/send-reminders', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Find users who were active yesterday but not today (risk of losing streak)
    const snapshot = await db.collection('users')
      .where('lastActiveDate', '==', yesterday)
      .where('streak', '>', 0)
      .get();
    
    let remindersSent = 0;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Check if notification already sent today
      const existingNotif = await db.collection('notifications')
        .where('userId', '==', doc.id)
        .where('type', '==', 'streak_reminder')
        .where('createdAt', '>=', new Date(today))
        .get();
      
      if (existingNotif.empty) {
        await db.collection('notifications').add({
          userId: doc.id,
          type: 'streak_reminder',
          text: `🔥 Don't lose your ${userData.streak}-day streak! Solve a problem today to keep it going.`,
          avatar: userData.avatar,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          actionUrl: '/challenges'
        });
        
        // Emit via socket if user is online
        const userSocket = activeUsers.get(doc.id);
        if (userSocket) {
          io.to(doc.id).emit('notification', {
            type: 'streak_reminder',
            text: `🔥 Don't lose your ${userData.streak}-day streak! Solve a problem today to keep it going.`,
            avatar: userData.avatar
          });
        }
        
        remindersSent++;
      }
    }
    
    res.json({ success: true, remindersSent });
  } catch (error) {
    console.error('Error sending streak reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

// Send streak milestone celebration notifications
app.post('/api/streaks/send-milestone-celebrations', async (req, res) => {
  try {
    const milestones = [7, 14, 30, 50, 100];
    let celebrationsSent = 0;
    
    for (const milestone of milestones) {
      // Find users who just reached this milestone
      const snapshot = await db.collection('users')
        .where('streak', '==', milestone)
        .get();
      
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        
        // Check if notification already sent for this milestone
        const existingNotif = await db.collection('notifications')
          .where('userId', '==', doc.id)
          .where('type', '==', 'streak_milestone')
          .where('metadata.milestone', '==', milestone)
          .get();
        
        if (existingNotif.empty) {
          await db.collection('notifications').add({
            userId: doc.id,
            type: 'streak_milestone',
            text: `🎉 Amazing! You've reached a ${milestone}-day streak! Keep up the incredible work!`,
            avatar: userData.avatar,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            actionUrl: '/profile',
            metadata: { milestone }
          });
          
          // Emit via socket if user is online
          const userSocket = activeUsers.get(doc.id);
          if (userSocket) {
            io.to(doc.id).emit('notification', {
              type: 'streak_milestone',
              text: `🎉 Amazing! You've reached a ${milestone}-day streak! Keep up the incredible work!`,
              avatar: userData.avatar,
              metadata: { milestone }
            });
          }
          
          celebrationsSent++;
        }
      }
    }
    
    res.json({ success: true, celebrationsSent });
  } catch (error) {
    console.error('Error sending milestone celebrations:', error);
    res.status(500).json({ error: 'Failed to send celebrations' });
  }
});

// Send streak warning notifications (when streak is at risk)
app.post('/api/streaks/send-warnings', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    
    // Find users who haven't been active in 2 days (streak at risk)
    const snapshot = await db.collection('users')
      .where('lastActiveDate', '==', twoDaysAgo)
      .where('streak', '>', 0)
      .get();
    
    let warningsSent = 0;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Check if notification already sent today
      const existingNotif = await db.collection('notifications')
        .where('userId', '==', doc.id)
        .where('type', '==', 'streak_warning')
        .where('createdAt', '>=', new Date(today))
        .get();
      
      if (existingNotif.empty) {
        const hasFreeze = (userData.streakFreezes || 0) > 0;
        
        await db.collection('notifications').add({
          userId: doc.id,
          type: 'streak_warning',
          text: hasFreeze 
            ? `⚠️ Your ${userData.streak}-day streak is at risk! Use a streak freeze or solve a problem today.`
            : `⚠️ Your ${userData.streak}-day streak is at risk! Solve a problem today to save it.`,
          avatar: userData.avatar,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          actionUrl: '/challenges'
        });
        
        // Emit via socket if user is online
        const userSocket = activeUsers.get(doc.id);
        if (userSocket) {
          io.to(doc.id).emit('notification', {
            type: 'streak_warning',
            text: hasFreeze 
              ? `⚠️ Your ${userData.streak}-day streak is at risk! Use a streak freeze or solve a problem today.`
              : `⚠️ Your ${userData.streak}-day streak is at risk! Solve a problem today to save it.`,
            avatar: userData.avatar
          });
        }
        
        warningsSent++;
      }
    }
    
    res.json({ success: true, warningsSent });
  } catch (error) {
    console.error('Error sending streak warnings:', error);
    res.status(500).json({ error: 'Failed to send warnings' });
  }
});

// ==================== BADGE SYSTEM ENDPOINTS ====================

// Badge definitions (matching frontend constants)
const BADGE_DEFINITIONS = [
  // Solving Badges
  { id: 'first_solve', name: 'First Steps', description: 'Solve your first problem', icon: '🎯', category: 'solving', rarity: 'common', maxProgress: 1 },
  { id: 'five_solves', name: 'Problem Solver', description: 'Solve 5 problems', icon: '🔧', category: 'solving', rarity: 'common', maxProgress: 5 },
  { id: 'ten_solves', name: 'Dedicated Solver', description: 'Solve 10 problems', icon: '⚙️', category: 'solving', rarity: 'common', maxProgress: 10 },
  { id: 'fifty_solves', name: 'Expert Solver', description: 'Solve 50 problems', icon: '🏆', category: 'solving', rarity: 'rare', maxProgress: 50 },
  { id: 'hundred_solves', name: 'Master Solver', description: 'Solve 100 problems', icon: '👑', category: 'solving', rarity: 'epic', maxProgress: 100 },
  // Helping Badges
  { id: 'first_help', name: 'Helpful Hand', description: 'Provide your first helpful solution', icon: '🤝', category: 'helping', rarity: 'common', maxProgress: 1 },
  { id: 'ten_helps', name: 'Community Helper', description: 'Provide 10 helpful solutions', icon: '💪', category: 'helping', rarity: 'common', maxProgress: 10 },
  { id: 'fifty_helps', name: 'Mentor', description: 'Provide 50 helpful solutions', icon: '🎓', category: 'helping', rarity: 'rare', maxProgress: 50 },
  { id: 'hundred_helps', name: 'Grand Mentor', description: 'Provide 100 helpful solutions', icon: '🌟', category: 'helping', rarity: 'epic', maxProgress: 100 },
  // Streak Badges
  { id: 'seven_day_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streaks', rarity: 'common', maxProgress: 7 },
  { id: 'fourteen_day_streak', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '💥', category: 'streaks', rarity: 'rare', maxProgress: 14 },
  { id: 'thirty_day_streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⚡', category: 'streaks', rarity: 'rare', maxProgress: 30 },
  { id: 'fifty_day_streak', name: 'Half Century', description: 'Maintain a 50-day streak', icon: '🌈', category: 'streaks', rarity: 'epic', maxProgress: 50 },
  { id: 'hundred_day_streak', name: 'Century Champion', description: 'Maintain a 100-day streak', icon: '🏅', category: 'streaks', rarity: 'legendary', maxProgress: 100 },
  // Social Badges
  { id: 'first_post', name: 'Voice Heard', description: 'Create your first post', icon: '📢', category: 'social', rarity: 'common', maxProgress: 1 },
  { id: 'ten_posts', name: 'Active Contributor', description: 'Create 10 posts', icon: '✍️', category: 'social', rarity: 'common', maxProgress: 10 },
  { id: 'fifty_posts', name: 'Prolific Writer', description: 'Create 50 posts', icon: '📝', category: 'social', rarity: 'rare', maxProgress: 50 },
  { id: 'first_comment', name: 'Conversation Starter', description: 'Add your first comment', icon: '💬', category: 'social', rarity: 'common', maxProgress: 1 },
  { id: 'fifty_comments', name: 'Social Butterfly', description: 'Add 50 comments', icon: '🦋', category: 'social', rarity: 'rare', maxProgress: 50 },
  // Special Badges
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join in the first month of launch', icon: '🚀', category: 'special', rarity: 'rare', maxProgress: 1 },
  { id: 'top_contributor', name: 'Top Contributor', description: 'Reach top 10 on monthly leaderboard', icon: '🏆', category: 'special', rarity: 'epic', maxProgress: 1 },
  { id: 'community_hero', name: 'Community Hero', description: 'Help 100 different users', icon: '🦸', category: 'special', rarity: 'legendary', maxProgress: 100 }
];

// Get all badge definitions
app.get('/api/badges/definitions', (req, res) => {
  res.json(BADGE_DEFINITIONS);
});

// Get user's badges
app.get('/api/users/:userId/badges', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const userBadges = userData.badges || [];
    const badgeProgress = userData.badgeProgress || [];
    
    res.json({
      badges: userBadges,
      progress: badgeProgress
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Check and award badges
app.post('/api/users/:userId/badges/check', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Can only check your own badges' });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const currentBadges = userData.badges || [];
    const currentProgress = userData.badgeProgress || [];
    
    // Get user stats
    const postsSnapshot = await db.collection('posts').where('userId', '==', userId).get();
    const postsCount = postsSnapshot.size;
    
    const commentsSnapshot = await db.collection('comments').where('userId', '==', userId).get();
    const commentsCount = commentsSnapshot.size;
    
    const solutionsSnapshot = await db.collection('solutions').where('userId', '==', userId).get();
    const helpfulSolutions = solutionsSnapshot.docs.filter(doc => (doc.data().helpful || 0) > 0).length;
    
    const streak = userData.streak || 0;
    
    // Calculate badge progress
    const newBadges = [];
    const updatedProgress = [];
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      let currentProgressValue = 0;
      let shouldAward = false;
      
      // Calculate progress based on badge category
      switch (badgeDef.category) {
        case 'solving':
          currentProgressValue = postsCount;
          break;
        case 'helping':
          currentProgressValue = helpfulSolutions;
          break;
        case 'streaks':
          currentProgressValue = streak;
          break;
        case 'social':
          if (badgeDef.id.includes('post')) {
            currentProgressValue = postsCount;
          } else if (badgeDef.id.includes('comment')) {
            currentProgressValue = commentsCount;
          }
          break;
        default:
          currentProgressValue = 0;
      }
      
      // Check if badge should be awarded
      if (currentProgressValue >= badgeDef.maxProgress) {
        const alreadyHasBadge = currentBadges.some((b: any) => b.id === badgeDef.id);
        if (!alreadyHasBadge) {
          newBadges.push({
            ...badgeDef,
            earnedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          shouldAward = true;
        }
      }
      
      // Update progress
      updatedProgress.push({
        badgeId: badgeDef.id,
        currentProgress: currentProgressValue,
        maxProgress: badgeDef.maxProgress,
        unlocked: currentProgressValue >= badgeDef.maxProgress
      });
    }
    
    // Update user document if new badges earned
    if (newBadges.length > 0) {
      await db.collection('users').doc(userId).update({
        badges: admin.firestore.FieldValue.arrayUnion(...newBadges),
        badgeProgress: updatedProgress
      });
      
      // Send notifications for new badges
      for (const badge of newBadges) {
        await db.collection('notifications').add({
          userId,
          type: 'badge_earned',
          text: `🎉 You earned the "${badge.name}" badge! ${badge.description}`,
          avatar: userData.avatar,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          actionUrl: '/profile',
          metadata: { badgeId: badge.id }
        });
        
        // Emit via socket if user is online
        const userSocket = activeUsers.get(userId);
        if (userSocket) {
          io.to(userId).emit('notification', {
            type: 'badge_earned',
            text: `🎉 You earned the "${badge.name}" badge! ${badge.description}`,
            avatar: userData.avatar,
            metadata: { badgeId: badge.id }
          });
        }
      }
    } else {
      // Just update progress
      await db.collection('users').doc(userId).update({
        badgeProgress: updatedProgress
      });
    }
    
    res.json({
      newBadges,
      updatedProgress,
      totalBadges: currentBadges.length + newBadges.length
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// ==================== EXPERTISE SYSTEM ENDPOINTS ====================

// Expertise domains (matching frontend constants)
const EXPERTISE_DOMAINS = [
  { id: 'technology', name: 'Technology', icon: '💻', color: '#3B82F6', subdomains: ['Programming', 'Web Development', 'Mobile Apps', 'DevOps', 'AI/ML', 'Cybersecurity'] },
  { id: 'science', name: 'Science', icon: '🔬', color: '#10B981', subdomains: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Earth Sciences'] },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', color: '#F59E0B', subdomains: ['Mechanical', 'Electrical', 'Civil', 'Chemical', 'Aerospace', 'Software'] },
  { id: 'business', name: 'Business', icon: '💼', color: '#8B5CF6', subdomains: ['Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Economics', 'Strategy'] },
  { id: 'arts', name: 'Arts & Design', icon: '🎨', color: '#EC4899', subdomains: ['Graphic Design', 'UI/UX', 'Photography', 'Writing', 'Music', 'Film'] },
  { id: 'health', name: 'Health & Medicine', icon: '🏥', color: '#EF4444', subdomains: ['Medicine', 'Psychology', 'Nutrition', 'Fitness', 'Public Health', 'Mental Health'] },
  { id: 'education', name: 'Education', icon: '📚', color: '#6366F1', subdomains: ['Teaching', 'Curriculum', 'E-Learning', 'Research', 'Academic Writing', 'Training'] },
  { id: 'law', name: 'Law & Legal', icon: '⚖️', color: '#78716C', subdomains: ['Corporate Law', 'Criminal Law', 'Intellectual Property', 'Contract Law', 'International Law', 'Compliance'] }
];

// Get all expertise domains
app.get('/api/expertise/domains', (req, res) => {
  res.json(EXPERTISE_DOMAINS);
});

// Calculate expertise score for a user in a specific domain
const calculateExpertiseScore = async (userId, domainId) => {
  try {
    const domain = EXPERTISE_DOMAINS.find(d => d.id === domainId);
    if (!domain) return null;

    // Get user's posts in this domain (based on tags/category)
    const postsSnapshot = await db.collection('posts')
      .where('userId', '==', userId)
      .get();
    
    let domainPosts = 0;
    let domainSolutions = 0;
    let helpfulVotes = 0;

    postsSnapshot.forEach(doc => {
      const postData = doc.data();
      const postDomain = postData.domain || postData.category || 'technology';
      
      if (postDomain === domainId || domain.subdomains.includes(postDomain)) {
        domainPosts++;
        helpfulVotes += postData.upvotes || 0;
      }
    });

    // Get user's solutions in this domain
    const solutionsSnapshot = await db.collection('solutions')
      .where('userId', '==', userId)
      .get();
    
    solutionsSnapshot.forEach(doc => {
      const solutionData = doc.data();
      const solutionDomain = solutionData.domain || solutionData.category || 'technology';
      
      if (solutionDomain === domainId || domain.subdomains.includes(solutionDomain)) {
        domainSolutions++;
        helpfulVotes += solutionData.helpful || 0;
      }
    });

    // Calculate score: 10 points per post, 20 points per solution, 5 points per helpful vote
    const score = (domainPosts * 10) + (domainSolutions * 20) + (helpfulVotes * 5);

    return {
      domainId,
      domainName: domain.name,
      score,
      problemsSolved: domainPosts,
      solutionsProvided: domainSolutions,
      helpfulVotes,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error calculating expertise score:', error);
    return null;
  }
};

// Get user's expertise scores
app.get('/api/users/:userId/expertise', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const expertiseScores = userData.expertiseScores || [];
    const overallExpertise = userData.overallExpertise || 0;
    
    res.json({
      expertiseScores,
      overallExpertise
    });
  } catch (error) {
    console.error('Error fetching user expertise:', error);
    res.status(500).json({ error: 'Failed to fetch expertise' });
  }
});

// Update user's expertise scores
app.post('/api/users/:userId/expertise/update', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Can only update your own expertise' });
    }
    
    const expertiseScores = [];
    let totalScore = 0;
    
    // Calculate expertise for each domain
    for (const domain of EXPERTISE_DOMAINS) {
      const score = await calculateExpertiseScore(userId, domain.id);
      if (score && score.score > 0) {
        expertiseScores.push(score);
        totalScore += score.score;
      }
    }
    
    // Calculate overall expertise (average of domain scores)
    const overallExpertise = expertiseScores.length > 0 ? Math.round(totalScore / expertiseScores.length) : 0;
    
    // Update user document
    await db.collection('users').doc(userId).update({
      expertiseScores,
      overallExpertise
    });
    
    res.json({
      expertiseScores,
      overallExpertise,
      message: 'Expertise scores updated successfully'
    });
  } catch (error) {
    console.error('Error updating expertise:', error);
    res.status(500).json({ error: 'Failed to update expertise' });
  }
});

// Get experts by domain
app.get('/api/expertise/:domainId/experts', authenticateFirebaseToken, async (req, res) => {
  try {
    const { domainId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const domain = EXPERTISE_DOMAINS.find(d => d.id === domainId);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Get all users with expertise in this domain
    const usersSnapshot = await db.collection('users')
      .where('expertiseScores.domainId', '==', domainId)
      .get();
    
    const experts = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const domainScore = userData.expertiseScores?.find((s: any) => s.domainId === domainId);
      
      if (domainScore && domainScore.score > 0) {
        experts.push({
          userId: doc.id,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          score: domainScore.score,
          problemsSolved: domainScore.problemsSolved,
          solutionsProvided: domainScore.solutionsProvided,
          helpfulVotes: domainScore.helpfulVotes
        });
      }
    });
    
    // Sort by score and limit
    experts.sort((a, b) => b.score - a.score);
    const topExperts = experts.slice(0, limit);
    
    res.json({
      domain: domain.name,
      experts: topExperts
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

// ==================== LEADERBOARD API ENDPOINTS ====================

// Get global leaderboard
app.get('/api/leaderboard/global', authenticateFirebaseToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const timeFrame = req.query.timeFrame || 'all'; // 'all', 'weekly', 'monthly'
    
    let startDate;
    if (timeFrame === 'weekly') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFrame === 'monthly') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const usersSnapshot = await db.collection('users').get();
    const leaderboard = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      let score = userData.reputation || 0;
      
      // If time frame is specified, calculate score based on recent activity
      if (startDate) {
        score = 0;
        // This would need to track activity timestamps in a more sophisticated system
        // For now, we'll use the overall reputation as a fallback
        score = userData.reputation || 0;
      }
      
      leaderboard.push({
        userId: doc.id,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        score,
        streak: userData.streak || 0,
        badges: (userData.badges || []).length
      });
    });
    
    // Sort by score and limit
    leaderboard.sort((a, b) => b.score - a.score);
    const topUsers = leaderboard.slice(0, limit);
    
    res.json({
      timeFrame,
      leaderboard: topUsers
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get domain-specific leaderboard
app.get('/api/leaderboard/domain/:domainId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { domainId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const usersSnapshot = await db.collection('users').get();
    const leaderboard = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const domainScore = userData.expertiseScores?.find((s: any) => s.domainId === domainId);
      
      if (domainScore && domainScore.score > 0) {
        leaderboard.push({
          userId: doc.id,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          score: domainScore.score,
          problemsSolved: domainScore.problemsSolved,
          solutionsProvided: domainScore.solutionsProvided,
          helpfulVotes: domainScore.helpfulVotes
        });
      }
    });
    
    // Sort by score and limit
    leaderboard.sort((a, b) => b.score - a.score);
    const topExperts = leaderboard.slice(0, limit);
    
    res.json({
      domainId,
      leaderboard: topExperts
    });
  } catch (error) {
    console.error('Error fetching domain leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get streak leaderboard
app.get('/api/leaderboard/streaks', authenticateFirebaseToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const usersSnapshot = await db.collection('users')
      .where('streak', '>', 0)
      .orderBy('streak', 'desc')
      .limit(limit)
      .get();
    
    const leaderboard = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        userId: doc.id,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        streak: userData.streak,
        longestStreak: userData.longestStreak || 0
      };
    });
    
    res.json({
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching streak leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch streak leaderboard' });
  }
});

// Get badge leaderboard
app.get('/api/leaderboard/badges', authenticateFirebaseToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const usersSnapshot = await db.collection('users').get();
    const leaderboard = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const badgeCount = (userData.badges || []).length;
      
      if (badgeCount > 0) {
        leaderboard.push({
          userId: doc.id,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          badgeCount,
          badges: userData.badges || []
        });
      }
    });
    
    // Sort by badge count and limit
    leaderboard.sort((a, b) => b.badgeCount - a.badgeCount);
    const topCollectors = leaderboard.slice(0, limit);
    
    res.json({
      leaderboard: topCollectors
    });
  } catch (error) {
    console.error('Error fetching badge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch badge leaderboard' });
  }
});

// ==================== ANALYTICS API ENDPOINTS ====================

// Get real-time analytics overview
app.get('/api/analytics/overview', async (req, res) => {
  try {
    // Get streak metrics
    const streakSnapshot = await db.collection('users').get();
    let totalStreaks = 0;
    let activeStreaks = 0;
    let longestStreak = 0;
    
    streakSnapshot.forEach(doc => {
      const streak = doc.data().streak || 0;
      const longest = doc.data().longestStreak || 0;
      totalStreaks += streak;
      if (streak > 0) activeStreaks++;
      if (longest > longestStreak) longestStreak = longest;
    });
    
    res.json({
      activeUsers: analyticsData.activeUsers,
      totalUsers: analyticsData.totalUsers,
      totalSessions: analyticsData.totalSessions,
      peakActiveUsers: analyticsData.peakActiveUsers,
      peakTime: analyticsData.peakTime,
      messagesSent: analyticsData.messagesSent,
      notificationsSent: analyticsData.notificationsSent,
      streakMetrics: {
        totalStreakDays: totalStreaks,
        activeStreaks,
        longestStreak,
        averageStreak: activeStreaks > 0 ? Math.round(totalStreaks / activeStreaks) : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get active users list with session details
app.get('/api/analytics/active-users', (req, res) => {
  const activeUsersList = Array.from(activeUsers.values()).map(session => ({
    userId: session.userId,
    deviceInfo: session.deviceInfo,
    geographicInfo: session.geographicInfo,
    joinTime: session.joinTime,
    lastActive: session.lastActive,
    pagesVisited: session.pagesVisited.length,
    messagesSent: session.messagesSent
  }));
  res.json(activeUsersList);
});

// Get hourly stats
app.get('/api/analytics/hourly', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const now = new Date();
  const hourlyData = [];
  
  for (let i = hours - 1; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = `${hour.getFullYear()}-${String(hour.getMonth() + 1).padStart(2, '0')}-${String(hour.getDate()).padStart(2, '0')}-${String(hour.getHours()).padStart(2, '0')}`;
    const stats = analyticsData.hourlyStats.get(hourKey) || {
      users: 0,
      sessions: 0,
      messages: 0,
      notifications: 0,
      pageViews: 0,
      peakUsers: 0
    };
    hourlyData.push({
      hour: hourKey,
      ...stats
    });
  }
  
  res.json(hourlyData);
});

// Get daily stats
app.get('/api/analytics/daily', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const now = new Date();
  const dailyData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const stats = analyticsData.dailyStats.get(dateKey) || {
      users: 0,
      sessions: 0,
      messages: 0,
      notifications: 0,
      pageViews: 0,
      peakUsers: 0,
      peakTime: null
    };
    dailyData.push({
      date: dateKey,
      ...stats
    });
  }
  
  res.json(dailyData);
});

// Get geographic distribution
app.get('/api/analytics/geographic', (req, res) => {
  const geographicData = Array.from(analyticsData.geographicData.entries()).map(([country, count]) => ({
    country,
    count
  }));
  res.json(geographicData);
});

// Get device distribution
app.get('/api/analytics/devices', (req, res) => {
  const deviceData = Array.from(analyticsData.deviceData.entries()).map(([device, count]) => ({
    device,
    count
  }));
  res.json(deviceData);
});

// Get page views
app.get('/api/analytics/page-views', (req, res) => {
  const pageViewsData = Array.from(analyticsData.pageViews.entries()).map(([page, count]) => ({
    page,
    count
  })).sort((a, b) => b.count - a.count);
  res.json(pageViewsData);
});

// Get user activity details
app.get('/api/analytics/user-activity/:userId', (req, res) => {
  const { userId } = req.params;
  const activity = analyticsData.userActivity.get(userId);
  const session = userSessions.get(userId);
  
  if (!activity && !session) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    userId,
    activity: activity || null,
    currentSession: session || null
  });
});

// Get realtime events feed
app.get('/api/analytics/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(analyticsData.realtimeEvents.slice(0, limit));
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// Verify Firebase ID token and issue JWT
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create JWT token
    const jwtToken = jwt.sign(
      { uid: decodedToken.uid, email: decodedToken.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      uid: decodedToken.uid, 
      email: decodedToken.email, 
      token: jwtToken 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

// Get user profile
app.get('/api/users/:userId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:userId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.email;
    delete updates.uid;
    
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== POSTS MANAGEMENT ENDPOINTS ====================

// Get all posts (with optional filters)
app.get('/api/posts', authenticateFirebaseToken, async (req, res) => {
  try {
    const { limit = 20, category, userId } = req.query;
    let query = db.collection('posts').orderBy('timestamp', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
app.get('/api/posts/:postId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ id: postDoc.id, ...postDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
app.post('/api/posts', authenticateFirebaseToken, async (req, res) => {
  try {
    const postData = req.body;
    const postRef = await db.collection('posts').add({
      ...postData,
      timestamp: postData.timestamp || admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ id: postRef.id, ...postData, message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
app.put('/api/posts/:postId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const updates = req.body;
    
    await db.collection('posts').doc(postId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:postId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    await db.collection('posts').doc(postId).delete();
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on post
app.post('/api/posts/:postId/vote', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, voteType } = req.body; // voteType: 'up' or 'down' OR numeric delta
    
    const normalizedVoteType = typeof voteType === 'number'
      ? voteType > 0 ? 'up' : voteType < 0 ? 'down' : null
      : typeof voteType === 'string'
        ? voteType
        : null;

    if (!normalizedVoteType || !['up', 'down'].includes(normalizedVoteType)) {
      return res.status(400).json({ error: 'voteType must be "up" or "down"' });
    }

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postData = postDoc.data();
    
    // Handle both old votes object format and new simple votes number format
    if (typeof postData.votes === 'object') {
      const votes = postData.votes || {};
      const currentVote = votes[userId];
      
      // Remove existing vote if same type, otherwise set new vote
      if (currentVote === normalizedVoteType) {
        delete votes[userId];
      } else {
        votes[userId] = normalizedVoteType;
      }
      
      await postRef.update({
        votes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ success: true, votes });
    } else {
      // Simple number format - increment/decrement
      const currentVotes = postData.votes || 0;
      const delta = normalizedVoteType === 'up' ? 1 : -1;
      
      await postRef.update({
        votes: currentVotes + delta,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ success: true, votes: currentVotes + delta });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMMENTS ENDPOINTS ====================

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const snapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to post
app.post('/api/posts/:postId/comments', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;
    
    const commentRef = await db.collection('comments').add({
      postId,
      userId,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ id: commentRef.id, postId, userId, text, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:commentId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    await db.collection('comments').doc(commentId).delete();
    
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOLUTIONS ENDPOINTS ====================

// Add solution to post
app.post('/api/posts/:postId/solutions', authenticateFirebaseToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, description, code } = req.body;
    
    const solutionRef = await db.collection('solutions').add({
      postId,
      userId,
      description,
      code,
      votes: {},
      isHelpful: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ id: solutionRef.id, message: 'Solution added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on solution
app.post('/api/solutions/:solutionId/vote', authenticateFirebaseToken, async (req, res) => {
  try {
    const { solutionId } = req.params;
    const { userId, voteType } = req.body;
    
    const solutionRef = db.collection('solutions').doc(solutionId);
    const solutionDoc = await solutionRef.get();
    
    if (!solutionDoc.exists) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    const solutionData = solutionDoc.data();
    const votes = solutionData.votes || {};
    const currentVote = votes[userId];
    
    if (currentVote === voteType) {
      delete votes[userId];
    } else {
      votes[userId] = voteType;
    }
    
    await solutionRef.update({
      votes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark solution as helpful
app.put('/api/solutions/:solutionId/helpful', authenticateFirebaseToken, async (req, res) => {
  try {
    const { solutionId } = req.params;
    const { isHelpful } = req.body;
    
    await db.collection('solutions').doc(solutionId).update({
      isHelpful,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Solution marked as helpful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTIVITY LOGGING ENDPOINTS ====================

// Log user activity
app.post('/api/activities', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId, action, details } = req.body;
    
    await db.collection('activities').add({
      userId,
      action,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activities
app.get('/api/users/:userId/activities', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GROUPS MANAGEMENT ENDPOINTS ====================

// Get all groups
app.get('/api/groups', authenticateFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection('groups').get();
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
app.post('/api/groups', authenticateFirebaseToken, async (req, res) => {
  try {
    const { name, description, creatorId, category } = req.body;
    
    const groupRef = await db.collection('groups').add({
      name,
      description,
      creatorId,
      category,
      members: [creatorId],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ id: groupRef.id, message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
app.post('/api/groups/:groupId/join', authenticateFirebaseToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    const groupRef = db.collection('groups').doc(groupId);
    await groupRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userId)
    });
    
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GLOBAL SEARCH ENDPOINT ====================

app.get('/api/search', authenticateFirebaseToken, async (req, res) => {
  try {
    const { q, type } = req.query;
    const query = q.toLowerCase();
    const results = { users: [], posts: [], groups: [] };
    
    if (!type || type === 'users') {
      const usersSnapshot = await db.collection('users')
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(10)
        .get();
      results.users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'posts') {
      const postsSnapshot = await db.collection('posts')
        .where('title', '>=', query)
        .where('title', '<=', query + '\uf8ff')
        .limit(10)
        .get();
      results.posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (!type || type === 'groups') {
      const groupsSnapshot = await db.collection('groups')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(10)
        .get();
      results.groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SAVED ITEMS ENDPOINTS ====================

// Get saved items for user
app.get('/api/users/:userId/saved', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('savedItems')
      .where('userId', '==', userId)
      .get();
    
    const savedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(savedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save item
app.post('/api/users/:userId/saved', authenticateFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, itemType } = req.body;
    
    await db.collection('savedItems').add({
      userId,
      itemId,
      itemType,
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Item saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove saved item
app.delete('/api/users/:userId/saved/:savedId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { savedId } = req.params;
    await db.collection('savedItems').doc(savedId).delete();
    
    res.json({ success: true, message: 'Item removed from saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FEEDBACK ENDPOINT ====================

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message, type } = req.body;
    
    // Send email notification
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.ADMIN_EMAILS || process.env.GMAIL_EMAIL,
      subject: `NexusMind Feedback - ${type || 'General'}`,
      text: `
Name: ${name}
Email: ${email}
Type: ${type || 'General'}

Message:
${message}
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FILE UPLOAD ENDPOINT ====================

app.post('/api/upload', authenticateFirebaseToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOCKET.IO EVENTS ====================

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // User joins (sets their userId and marks online)
  socket.on('join', (userData) => {
    const userId = userData.userId || userData;
    const deviceInfo = userData.deviceInfo || { type: 'unknown', browser: 'unknown' };
    const geographicInfo = userData.geographicInfo || { country: 'unknown', city: 'unknown' };
    
    socket.userId = userId;
    socket.join(userId);
    
    // Track detailed session data
    const sessionData = {
      socketId: socket.id,
      userId,
      deviceInfo,
      geographicInfo,
      joinTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'online',
      pagesVisited: [],
      messagesSent: 0,
      notificationsReceived: 0
    };
    
    activeUsers.set(userId, sessionData);
    userSessions.set(userId, sessionData);
    
    // Update analytics
    analyticsData.activeUsers = activeUsers.size;
    analyticsData.totalSessions++;
    updatePeakUsers(analyticsData.activeUsers);
    
    // Update user activity tracking
    if (!analyticsData.userActivity.has(userId)) {
      analyticsData.userActivity.set(userId, {
        lastActive: new Date().toISOString(),
        sessionCount: 0,
        messagesSent: 0,
        totalSessionTime: 0
      });
      analyticsData.totalUsers++;
    }
    const userActivity = analyticsData.userActivity.get(userId);
    userActivity.sessionCount++;
    userActivity.lastActive = new Date().toISOString();
    
    // Update geographic data
    const country = geographicInfo.country || 'unknown';
    analyticsData.geographicData.set(country, (analyticsData.geographicData.get(country) || 0) + 1);
    
    // Update device data
    const device = deviceInfo.type || 'unknown';
    analyticsData.deviceData.set(device, (analyticsData.deviceData.get(device) || 0) + 1);
    
    // Update hourly stats
    const hourKey = initializeHourlyStats();
    const hourStats = analyticsData.hourlyStats.get(hourKey);
    hourStats.users++;
    hourStats.sessions++;
    
    // Update daily stats
    const dateKey = initializeDailyStats();
    const dateStats = analyticsData.dailyStats.get(dateKey);
    dateStats.users++;
    dateStats.sessions++;
    
    console.log(`[Socket] User ${userId} joined. Active users: ${activeUsers.size}`);
    addRealtimeEvent('user_join', { userId, deviceInfo, geographicInfo });
    
    // Broadcast user online status
    io.emit('user_online', { userId, status: 'online', sessionData });
    
    // Broadcast updated analytics
    io.emit('analytics_update', {
      activeUsers: analyticsData.activeUsers,
      totalSessions: analyticsData.totalSessions,
      peakActiveUsers: analyticsData.peakActiveUsers
    });
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`[Socket] ${socket.userId} joined conversation: ${conversationId}`);
    
    // Initialize conversation if not exists
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, {
        id: conversationId,
        participants: [],
        messages: [],
        createdAt: new Date().toISOString()
      });
    }
    
    // Notify others in conversation
    io.to(conversationId).emit('user_joined_conversation', {
      conversationId,
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Send a message in conversation
  socket.on('send_message', ({ conversationId, message }) => {
    const timestamp = new Date().toISOString();
    const messageData = {
      id: `msg_${Date.now()}`,
      conversationId,
      userId: socket.userId,
      text: message.text || message,
      timestamp
    };
    
    // Update analytics
    analyticsData.messagesSent++;
    
    // Update user session message count
    if (userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.messagesSent++;
      session.lastActive = new Date().toISOString();
    }
    
    // Update user activity
    if (analyticsData.userActivity.has(socket.userId)) {
      const userActivity = analyticsData.userActivity.get(socket.userId);
      userActivity.messagesSent++;
      userActivity.lastActive = new Date().toISOString();
    }
    
    // Update hourly stats
    const hourKey = initializeHourlyStats();
    const hourStats = analyticsData.hourlyStats.get(hourKey);
    hourStats.messages++;
    
    // Update daily stats
    const dateKey = initializeDailyStats();
    const dateStats = analyticsData.dailyStats.get(dateKey);
    dateStats.messages++;
    
    // Broadcast message to conversation
    io.to(conversationId).emit('message_received', messageData);
    console.log(`[Socket] Message in ${conversationId} from ${socket.userId}`);
    addRealtimeEvent('message_sent', { userId: socket.userId, conversationId });
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    io.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  });

  // Send notification to specific user
  socket.on('send_notification', ({ userId, notification }) => {
    io.to(userId).emit('notification', {
      id: `notif_${Date.now()}`,
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    // Update analytics
    analyticsData.notificationsSent++;
    
    // Update user session notification count
    if (userSessions.has(userId)) {
      const session = userSessions.get(userId);
      session.notificationsReceived++;
      session.lastActive = new Date().toISOString();
    }
    
    // Update hourly stats
    const hourKey = initializeHourlyStats();
    const hourStats = analyticsData.hourlyStats.get(hourKey);
    hourStats.notifications++;
    
    // Update daily stats
    const dateKey = initializeDailyStats();
    const dateStats = analyticsData.dailyStats.get(dateKey);
    dateStats.notifications++;
    
    console.log(`[Socket] Notification sent to ${userId}`);
    addRealtimeEvent('notification_sent', { userId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Calculate session duration
      const session = userSessions.get(socket.userId);
      if (session) {
        const sessionDuration = Date.now() - new Date(session.joinTime).getTime();
        
        // Update user activity with session time
        if (analyticsData.userActivity.has(socket.userId)) {
          const userActivity = analyticsData.userActivity.get(socket.userId);
          userActivity.totalSessionTime += sessionDuration;
        }
        
        userSessions.delete(socket.userId);
      }
      
      activeUsers.delete(socket.userId);
      analyticsData.activeUsers = activeUsers.size;
      
      console.log(`[Socket] User disconnected: ${socket.userId}. Active users: ${activeUsers.size}`);
      addRealtimeEvent('user_disconnect', { userId: socket.userId });
      
      io.emit('user_offline', { userId: socket.userId, status: 'offline' });
      
      // Broadcast updated analytics
      io.emit('analytics_update', {
        activeUsers: analyticsData.activeUsers,
        totalSessions: analyticsData.totalSessions
      });
    }
  });

  // Page view tracking
  socket.on('page_view', (pageData) => {
    const { page, userId } = pageData;
    
    // Update page views
    analyticsData.pageViews.set(page, (analyticsData.pageViews.get(page) || 0) + 1);
    
    // Update user session pages visited
    if (userSessions.has(userId || socket.userId)) {
      const session = userSessions.get(userId || socket.userId);
      session.pagesVisited.push({
        page,
        timestamp: new Date().toISOString()
      });
      session.lastActive = new Date().toISOString();
    }
    
    // Update hourly stats
    const hourKey = initializeHourlyStats();
    const hourStats = analyticsData.hourlyStats.get(hourKey);
    hourStats.pageViews++;
    
    // Update daily stats
    const dateKey = initializeDailyStats();
    const dateStats = analyticsData.dailyStats.get(dateKey);
    dateStats.pageViews++;
    
    addRealtimeEvent('page_view', { userId: userId || socket.userId, page });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`[Socket] Error from ${socket.userId}:`, error);
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ==================== START SERVER ====================

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║    NexusMind Backend Server Started    ║
╚═══════════════════════════════════════╝
🚀 Server running on http://localhost:${PORT}
🔌 WebSocket ready
📡 CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}
🔐 JWT Authentication enabled
📧 Email notifications enabled
📁 File upload enabled
  `);
});

process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});
