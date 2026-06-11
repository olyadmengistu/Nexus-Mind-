# Firebase Firestore Setup Guide

This guide will help you set up Firebase Firestore for production deployment of NexusMind.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "nexusmind-production")
4. Accept the terms and click "Create project"
5. Wait for project creation to complete

## Step 2: Enable Firestore Database

1. In Firebase Console, select your project
2. Click "Build" → "Firestore Database" in the left sidebar
3. Click "Create database"
4. Select a location (choose closest to your users)
5. Select "Start in production mode" (recommended for security)
6. Click "Create"

## Step 3: Get Service Account Key

1. In Firebase Console, click the gear icon (Settings) → "Project settings"
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Select "Node.js" and click "Generate"
5. **IMPORTANT**: Download the JSON file and rename it to `firebase-service-account.json`
6. Place this file in your project root directory (same level as package.json)
7. **NEVER commit this file to Git** - it's already in .gitignore

## Step 4: Update .env File

Add Firebase configuration to your `.env` file:

```env
# Backend configuration
PORT=3001
CLIENT_URL=http://localhost:5173

# Email Configuration
GMAIL_EMAIL=mengistudisassa@gmail.com
GMAIL_APP_PASSWORD=oq lckawryntnbmrv
EMAIL_ADDRESS=mengistudisassa@gmail.com
ADMIN_EMAILS=mengistudisassa@gmail.com

# Firebase Configuration (if not using service account file)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

**Note**: If you have `firebase-service-account.json` file, you don't need these environment variables. The system will use the file automatically.

## Step 5: Create Firestore Indexes

For optimal query performance, create these indexes in Firebase Console:

1. Go to Firestore Database → Indexes
2. Click "Add index"
3. Create the following composite indexes:

### Posts Collection
- **Index 1**: Fields: `userId` (Ascending), `timestamp` (Descending)
- **Index 2**: Fields: `category` (Ascending), `timestamp` (Descending)
- **Index 3**: Fields: `timestamp` (Descending)
- **Index 4**: Fields: `votes` (Descending)

### Notifications Collection
- **Index 5**: Fields: `userId` (Ascending), `createdAt` (Descending)
- **Index 6**: Fields: `userId` (Ascending), `read` (Ascending)

### Activities Collection
- **Index 7**: Fields: `userId` (Ascending), `timestamp` (Descending)

### Groups Collection
- **Index 8**: Fields: `category` (Ascending), `timestamp` (Descending)

## Step 6: Set Firestore Security Rules

Go to Firestore Database → Rules and set these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    // Groups collection
    match /groups/{groupId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Videos collection
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Note**: For development, you can use test mode rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if true;
  }
}
```

## Step 7: Install Dependencies

Run the following command to install the new dependencies:

```bash
npm install
```

This will install:
- firebase-admin (for backend Firestore access)
- socket.io (already added)
- socket.io-client (already added)
- bcryptjs (already added)
- jsonwebtoken (already added)
- multer (already added)

## Step 8: Test the Backend

Start the backend server:

```bash
npm run server
```

You should see:
```
NexusMind API server running on port 3001
WebSocket server ready for real-time messaging
Email service configured for: mengistudisassa@gmail.com
```

If you see Firebase connection errors, check:
1. `firebase-service-account.json` file exists in project root
2. The file has correct permissions
3. Firestore is enabled in Firebase Console

## Step 9: Test the Full Application

Start both frontend and backend:

```bash
npm run dev:all
```

Test the following features:
1. User registration and login
2. Create a post
3. Add a solution to a post
4. Add a comment
5. Send a message
6. Check notifications
7. View activity log
8. Search functionality

## Step 10: Verify Data in Firestore

1. Go to Firebase Console → Firestore Database
2. You should see collections: users, posts, notifications, activities, groups, conversations
3. Verify data is being stored correctly

## Troubleshooting

### Error: "firebase-service-account.json not found"
- Ensure the file is in the project root directory
- Check that the filename is exactly `firebase-service-account.json`
- Verify the file is not in a subdirectory

### Error: "Permission denied"
- Check Firestore Security Rules
- Ensure rules allow read/write operations
- For development, use test mode rules

### Error: "Missing or insufficient permissions"
- Verify service account has Firestore Admin role
- Regenerate service account key if needed

### Error: "Index not found"
- Create the required composite indexes in Firebase Console
- Wait for indexes to build (can take a few minutes)

## Production Deployment

When deploying to production:

1. **Never commit `firebase-service-account.json`** to Git
2. Use environment variables or secret management for service account credentials
3. Set appropriate Firestore Security Rules
4. Enable Firestore data persistence
5. Set up Firebase Analytics for monitoring
6. Configure Firebase Authentication properly
7. Set up Firebase Cloud Functions if needed for server-side logic

## Next Steps

After successful Firestore integration:

1. Remove localStorage fallbacks from frontend (optional)
2. Implement proper error handling for Firestore operations
3. Add loading states for Firestore queries
4. Implement offline support with Firestore offline persistence
5. Set up Firebase Authentication with proper security rules
6. Add Firebase Cloud Functions for complex operations
7. Implement Firebase Analytics for user tracking
