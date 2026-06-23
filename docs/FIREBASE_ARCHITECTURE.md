# NexusMind Firebase Firestore Architecture

## Overview
NexusMind now uses Firebase Firestore as the primary database, eliminating MongoDB and Express backend dependencies.

## Architecture

### Frontend (Vite + React + Firebase)
- **Authentication**: Firebase Auth (client-side)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Real-time**: Firebase Realtime Database (for future real-time features)
- **API**: Direct Firebase SDK calls via `lib/firebaseApi.ts`

### File Structure
```
NEXUSMIND/
├── firebase.ts                 # Firebase configuration and initialization
├── lib/
│   ├── api.ts                 # API exports (now uses Firebase)
│   └── firebaseApi.ts         # Firebase Firestore API functions
├── components/                # React components
├── pages/                     # React pages
├── types.ts                   # TypeScript types
└── constants.ts               # App constants
```

## Firebase Collections

### users
- User profiles and settings
- Saved items
- Activity logs

### posts
- Problem-solving posts
- Solutions and comments
- Votes and reactions

### notifications
- User notifications
- Read/unread status

### groups
- Collaboration groups
- Members and discussions

### activities
- User activity tracking
- Analytics data

### conversations
- Direct messages
- Group conversations

### videos
- Video content
- Metadata

### products
- Marketplace items
- Product details

## API Functions

### User API (`lib/firebaseApi.ts`)
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, data)` - Update user profile
- `getAllUsers(query)` - Search users
- `getSavedItems(userId)` - Get saved items
- `saveItem(userId, item)` - Save item
- `removeSavedItem(userId, itemId)` - Remove saved item
- `getActivityLog(userId)` - Get user activity

### Posts API
- `getAllPosts(params)` - Get all posts with filters
- `getPost(postId)` - Get single post
- `createPost(data)` - Create new post
- `updatePost(postId, data)` - Update post
- `deletePost(postId)` - Delete post
- `votePost(postId, delta, userId, userAvatar)` - Vote on post
- `addSolution(postId, data)` - Add solution to post
- `voteSolution(postId, solutionId, delta)` - Vote on solution
- `markSolutionHelpful(postId, solutionId)` - Mark solution as helpful
- `addComment(postId, data)` - Add comment to post

### Notifications API
- `getNotifications(userId)` - Get user notifications
- `markAsRead(notificationId)` - Mark notification as read
- `markAllAsRead(userId)` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete notification

### Groups API
- `getAllGroups(params)` - Get all groups with filters
- `getGroup(groupId)` - Get single group
- `createGroup(data)` - Create new group
- `joinGroup(groupId, userId)` - Join group

### Search API
- `globalSearch(query, type)` - Search across collections

## Environment Variables

Update your `.env` file with Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Running the Application

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Configure Firebase:**
   - Copy Firebase config from Firebase Console
   - Add to `.env` file

3. **Start development server:**
   ```powershell
   npm run dev
   ```

4. **Build for production:**
   ```powershell
   npm run build
   ```

## Security Notes

- Firebase rules should be configured in Firebase Console
- API keys are public (client-side only)
- Use Firebase Security Rules to protect data
- Enable Firebase Authentication for user management

## Migration from MongoDB

If you were previously using MongoDB:
1. Export data from MongoDB
2. Import to Firebase Firestore using Firebase CLI or custom script
3. Update all API calls to use `lib/firebaseApi.ts`
4. Remove MongoDB dependencies from `package.json`

## Future Enhancements

- Firebase Cloud Functions for server-side logic
- Firebase Realtime Database for real-time messaging
- Firebase Cloud Storage for file uploads
- Firebase Analytics for user analytics
- Firebase Crashlytics for error tracking
