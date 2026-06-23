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

// Get active conversations
app.get('/api/conversations', (req, res) => {
  const convoList = Array.from(conversations.values());
  res.json(convoList);
});

// ==================== ANALYTICS API ENDPOINTS ====================

// Get real-time analytics overview
app.get('/api/analytics/overview', (req, res) => {
  res.json({
    activeUsers: analyticsData.activeUsers,
    totalUsers: analyticsData.totalUsers,
    totalSessions: analyticsData.totalSessions,
    peakActiveUsers: analyticsData.peakActiveUsers,
    peakTime: analyticsData.peakTime,
    messagesSent: analyticsData.messagesSent,
    notificationsSent: analyticsData.notificationsSent,
    timestamp: new Date().toISOString()
  });
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
// NOTE: User data operations handled by Firebase directly on frontend
// Backend only handles authentication verification

// ==================== POSTS MANAGEMENT ENDPOINTS ====================
// NOTE: Posts data operations handled by Firebase directly on frontend
// Backend focuses on server-side features only

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
