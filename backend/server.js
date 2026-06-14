import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB, db } from './db.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Connect to Firestore
connectDB();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = req.body;

    // Validate required fields
    if (!feedback.subject || !feedback.message || !feedback.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: process.env.ADMIN_EMAILS,
      subject: `[NexusMind Feedback] ${feedback.category.toUpperCase()}: ${feedback.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback Received</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">NexusMind Feedback System</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Category:</strong>
              <span style="background: #e3f2fd; color: #1976d2; padding: 5px 12px; border-radius: 15px; font-size: 14px; font-weight: 600;">
                ${feedback.category.toUpperCase()}
              </span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Subject:</strong>
              <p style="color: #555; margin: 0; font-size: 16px;">${feedback.subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Rating:</strong>
              <div style="color: #ffc107; font-size: 24px;">
                ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">From:</strong>
              <p style="color: #555; margin: 0;">${feedback.userName} (${feedback.email})</p>
              <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">User ID: ${feedback.userId}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Message:</strong>
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; color: #555; line-height: 1.6;">
                ${feedback.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Submitted:</strong>
              <p style="color: #999; margin: 0; font-size: 14px;">${new Date(feedback.timestamp).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                <strong>Feedback ID:</strong> ${feedback.id}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This feedback was submitted through the NexusMind Feedback System</p>
          </div>
        </div>
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: feedback.email,
      subject: 'Thank you for your feedback - NexusMind',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your feedback has been received</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Dear ${feedback.userName},
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for taking the time to share your feedback with us. We truly appreciate your input and will review it carefully.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: 600;">Feedback Summary:</p>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Category:</strong> ${feedback.category}</li>
                <li><strong>Subject:</strong> ${feedback.subject}</li>
                <li><strong>Rating:</strong> ${feedback.rating}/5</li>
                <li><strong>Submitted:</strong> ${new Date(feedback.timestamp).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need to provide additional information, please don't hesitate to contact us at support@nexusmind.com
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Best regards,<br>
              The NexusMind Team
            </p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="color: #1976d2; margin: 0; font-size: 14px;">
                <strong>Feedback ID:</strong> ${feedback.id}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 NexusMind. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log(`Feedback received from ${feedback.userName}: ${feedback.subject}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

// ==================== USER MANAGEMENT ====================

// Get user profile
// Create or upsert user profile (called after Firebase Auth signup)
app.post('/api/users', async (req, res) => {
  try {
    const { id, ...userData } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User id is required' });
    }

    const userRef = db.collection('users').doc(id);
    const existing = await userRef.get();

    const profile = {
      ...userData,
      reputation: userData.reputation ?? 0,
      savedItems: userData.savedItems ?? [],
      createdAt: existing.exists ? existing.data().createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await userRef.set(profile, { merge: true });
    const userDoc = await userRef.get();
    res.status(existing.exists ? 200 : 201).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: Date.now()
    });
    const userDoc = await db.collection('users').doc(userId).get();
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get all users (for search)
app.get('/api/users', async (req, res) => {
  try {
    const { query } = req.query;
    let usersQuery = db.collection('users').limit(50);
    
    if (query) {
      const q = query.toLowerCase();
      const allUsersSnapshot = await db.collection('users').get();
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredUsers = allUsers.filter(u => 
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q)
      );
      res.json(filteredUsers);
    } else {
      const allUsersSnapshot = await usersQuery.get();
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(allUsers);
    }
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ==================== POSTS MANAGEMENT ====================

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { userId, category, sortBy } = req.query;
    let query = db.collection('posts').limit(100);
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const postsSnapshot = await query.get();
    let allPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (sortBy === 'newest') {
      allPosts.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'oldest') {
      allPosts.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === 'most_votes') {
      allPosts.sort((a, b) => b.votes - a.votes);
    }
    
    res.json(allPosts);
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get single post
app.get('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ id: postDoc.id, ...postDoc.data() });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Create post
app.post('/api/posts', async (req, res) => {
  try {
    const postData = {
      timestamp: Date.now(),
      votes: 0,
      solutions: [],
      comments: [],
      isSolved: false,
      ...req.body
    };
    
    const postRef = await db.collection('posts').add(postData);
    const postDoc = await postRef.get();
    const post = { id: postDoc.id, ...postDoc.data() };
    
    // Log activity
    await logActivity(post.userId, 'created_post', { postId: post.id });
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
app.put('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const updates = req.body;
    await db.collection('posts').doc(postId).update(updates);
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ id: postDoc.id, ...postDoc.data() });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = { id: postDoc.id, ...postDoc.data() };
    await db.collection('posts').doc(postId).delete();
    
    // Log activity
    await logActivity(post.userId, 'deleted_post', { postId });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Vote on post
app.post('/api/posts/:postId/vote', async (req, res) => {
  try {
    const { postId } = req.params;
    const { delta, userId } = req.body;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = { id: postDoc.id, ...postDoc.data() };
    post.votes += delta;
    await db.collection('posts').doc(postId).update({ votes: post.votes });
    
    // Create notification for post author
    if (delta > 0 && post.userId !== userId) {
      await createNotification(post.userId, 'vote', {
        text: `Someone upvoted your post "${post.title}"`,
        avatar: req.body.userAvatar,
        actionUrl: `/solutions/${postId}`
      });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

// ==================== SOLUTIONS ====================

// Add solution to post
app.post('/api/posts/:postId/solutions', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = { id: postDoc.id, ...postDoc.data() };
    const solution = {
      id: `sol_${Date.now()}`,
      timestamp: Date.now(),
      upvotes: 0,
      helpful: 0,
      replies: [],
      ...req.body
    };
    
    const solutions = post.solutions || [];
    solutions.push(solution);
    await db.collection('posts').doc(postId).update({ solutions });
    
    // Create notification for post author
    if (post.userId !== req.body.userId) {
      await createNotification(post.userId, 'solution', {
        text: `${req.body.userName} posted a solution to your problem`,
        avatar: req.body.userAvatar,
        actionUrl: `/solutions/${postId}`
      });
    }
    
    // Log activity
    await logActivity(req.body.userId, 'added_solution', { postId, solutionId: solution.id });
    
    res.status(201).json(solution);
  } catch (error) {
    console.error('Error adding solution:', error);
    res.status(500).json({ error: 'Failed to add solution' });
  }
});

// Vote on solution
app.post('/api/posts/:postId/solutions/:solutionId/vote', async (req, res) => {
  try {
    const { postId, solutionId } = req.params;
    const { delta } = req.body;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = { id: postDoc.id, ...postDoc.data() };
    const solutions = post.solutions || [];
    const solution = solutions.find(s => s.id === solutionId);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    solution.upvotes += delta;
    await db.collection('posts').doc(postId).update({ solutions });
    
    res.json(solution);
  } catch (error) {
    console.error('Error voting on solution:', error);
    res.status(500).json({ error: 'Failed to vote on solution' });
  }
});

// Mark solution as helpful
app.post('/api/posts/:postId/solutions/:solutionId/helpful', async (req, res) => {
  try {
    const { postId, solutionId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = { id: postDoc.id, ...postDoc.data() };
    const solutions = post.solutions || [];
    const solution = solutions.find(s => s.id === solutionId);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    solution.helpful += 1;
    await db.collection('posts').doc(postId).update({ solutions });
    
    res.json(solution);
  } catch (error) {
    console.error('Error marking solution as helpful:', error);
    res.status(500).json({ error: 'Failed to mark solution as helpful' });
  }
});

// ==================== COMMENTS ====================

// Add comment to post
app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = { id: postDoc.id, ...postDoc.data() };
    const comment = {
      id: `comment_${Date.now()}`,
      timestamp: Date.now(),
      ...req.body
    };
    
    const comments = post.comments || [];
    comments.push(comment);
    await db.collection('posts').doc(postId).update({ comments });
    
    // Create notification for post author
    if (post.userId !== req.body.userId) {
      await createNotification(post.userId, 'reply', {
        text: `${req.body.userName} commented on your post`,
        avatar: req.body.userAvatar,
        actionUrl: `/solutions/${postId}`
      });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ==================== NOTIFICATIONS ====================

// Get user notifications
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const userNotifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(userNotifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await db.collection('notifications').doc(notificationId).update({ read: true });
    const notificationDoc = await db.collection('notifications').doc(notificationId).get();
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ id: notificationDoc.id, ...notificationDoc.data() });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/api/users/:userId/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
app.delete('/api/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notificationDoc = await db.collection('notifications').doc(notificationId).get();
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await db.collection('notifications').doc(notificationId).delete();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ==================== ACTIVITY LOGGING ====================

// Get user activity log
app.get('/api/users/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const activitiesSnapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    const userActivities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(userActivities);
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// ==================== GROUPS ====================

// Get all groups
app.get('/api/groups', async (req, res) => {
  try {
    const { query, category } = req.query;
    let groupsQuery = db.collection('groups').limit(50);
    
    if (category) {
      groupsQuery = groupsQuery.where('category', '==', category);
    }
    
    const groupsSnapshot = await groupsQuery.get();
    let allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (query) {
      const q = query.toLowerCase();
      allGroups = allGroups.filter(g => 
        g.name?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
      );
    }
    
    res.json(allGroups);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get single group
app.get('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ id: groupDoc.id, ...groupDoc.data() });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Create group
app.post('/api/groups', async (req, res) => {
  try {
    const groupData = {
      timestamp: Date.now(),
      members: [],
      posts: [],
      memberCount: 0,
      ...req.body
    };
    
    const groupRef = await db.collection('groups').add(groupData);
    const groupDoc = await groupRef.get();
    const group = { id: groupDoc.id, ...groupDoc.data() };
    
    // Log activity
    await logActivity(req.body.creatorId, 'created_group', { groupId: group.id });
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Join group
app.post('/api/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const groupDoc = await db.collection('groups').doc(groupId).get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const group = { id: groupDoc.id, ...groupDoc.data() };
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = { id: userDoc.id, ...userDoc.data() };
    const memberData = { id: user.id, name: user.name, username: user.username, avatar: user.avatar };
    
    const members = group.members || [];
    if (!members.find(m => m.id === userId)) {
      members.push(memberData);
      group.memberCount = members.length;
      await db.collection('groups').doc(groupId).update({ members, memberCount: group.memberCount });
      
      // Log activity
      await logActivity(userId, 'joined_group', { groupId });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// ==================== SEARCH ====================

// Global search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    const query = q?.toLowerCase() || '';
    
    const [usersSnapshot, postsSnapshot, groupsSnapshot] = await Promise.all([
      db.collection('users').limit(50).get(),
      db.collection('posts').limit(50).get(),
      db.collection('groups').limit(50).get()
    ]);
    
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const results = {
      users: allUsers.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.bio?.toLowerCase().includes(query)
      ),
      posts: allPosts.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.content?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      ),
      groups: allGroups.filter(g => 
        g.name?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
      ),
      videos: [],
      products: []
    };
    
    if (type && type !== 'all') {
      res.json({ [type]: results[type] });
    } else {
      res.json(results);
    }
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// ==================== SAVED ITEMS ====================

// Get user saved items
app.get('/api/users/:userId/saved', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = { id: userDoc.id, ...userDoc.data() };
    res.json(user.savedItems || []);
  } catch (error) {
    console.error('Error getting saved items:', error);
    res.status(500).json({ error: 'Failed to get saved items' });
  }
});

// Save item
app.post('/api/users/:userId/saved', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = { id: userDoc.id, ...userDoc.data() };
    const savedItem = {
      id: `saved_${Date.now()}`,
      timestamp: Date.now(),
      ...req.body
    };
    
    const savedItems = user.savedItems || [];
    savedItems.push(savedItem);
    await db.collection('users').doc(userId).update({ savedItems });
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// Remove saved item
app.delete('/api/users/:userId/saved/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = { id: userDoc.id, ...userDoc.data() };
    const savedItems = user.savedItems || [];
    const itemIndex = savedItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Saved item not found' });
    }
    
    savedItems.splice(itemIndex, 1);
    await db.collection('users').doc(userId).update({ savedItems });
    
    res.json({ message: 'Item removed from saved' });
  } catch (error) {
    console.error('Error removing saved item:', error);
    res.status(500).json({ error: 'Failed to remove saved item' });
  }
});

// ==================== HELPER FUNCTIONS ====================

async function createNotification(userId, type, data) {
  const notification = {
    userId,
    type,
    createdAt: Date.now(),
    read: false,
    time: formatTime(Date.now()),
    ...data
  };
  
  const notificationRef = await db.collection('notifications').add(notification);
  const notificationDoc = await notificationRef.get();
  const notificationData = { id: notificationDoc.id, ...notificationDoc.data() };
  
  // Emit via WebSocket if user is connected
  io.to(userId).emit('notification', notificationData);
}

async function logActivity(userId, action, metadata) {
  const activity = {
    userId,
    action,
    timestamp: Date.now(),
    metadata
  };
  await db.collection('activities').add(activity);
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ==================== WEBSOCKET (Real-time Messaging) ====================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user's personal room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join conversation room
  socket.on('join_conversation', async (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
    
    // Load conversation from Firestore if exists
    try {
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      if (conversationDoc.exists) {
        socket.emit('conversation_loaded', { id: conversationDoc.id, ...conversationDoc.data() });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  });
  
  // Send message
  socket.on('send_message', async (data) => {
    const { conversationId, message } = data;
    
    try {
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      
      if (conversationDoc.exists) {
        const conversation = { id: conversationDoc.id, ...conversationDoc.data() };
        const newMessage = {
          id: `msg_${Date.now()}`,
          timestamp: Date.now(),
          ...message
        };
        
        const messages = conversation.messages || [];
        messages.push(newMessage);
        await db.collection('conversations').doc(conversationId).update({
          messages,
          lastMessage: message.text,
          time: formatTime(Date.now())
        });
        
        // Broadcast to conversation room
        io.to(conversationId).emit('new_message', newMessage);
        
        // Notify other participants
        const participants = conversation.participants || [];
        participants.forEach(p => {
          if (p.id !== message.senderId) {
            createNotification(p.id, 'reply', {
              text: `New message from ${message.senderName}`,
              avatar: message.senderAvatar,
              actionUrl: '/messages'
            });
          }
        });
      } else {
        // Create new conversation if it doesn't exist
        const newConversation = {
          participants: message.participants || [],
          messages: [{
            id: `msg_${Date.now()}`,
            timestamp: Date.now(),
            ...message
          }],
          lastMessage: message.text,
          time: formatTime(Date.now()),
          timestamp: Date.now()
        };
        
        await db.collection('conversations').doc(conversationId).set(newConversation);
        io.to(conversationId).emit('new_message', newConversation.messages[0]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(conversationId).emit('user_typing', { userId, isTyping });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NexusMind API server is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

httpServer.listen(PORT, () => {
  console.log(`NexusMind API server running on port ${PORT}`);
  console.log(`WebSocket server ready for real-time messaging`);
  console.log(`Email service configured for: ${process.env.GMAIL_EMAIL}`);
});
