# Firebase Firestore Data Model

## Collections Structure

### 1. users
```javascript
{
  id: string,                    // Document ID (user ID from Firebase Auth)
  name: string,
  username: string,
  email: string,
  avatar: string,
  bio: string,
  reputation: number,
  followers: number,
  following: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  settings: {
    notifications: {
      email: boolean,
      push: boolean,
      mentions: boolean,
      messages: boolean,
      replies: boolean,
      likes: boolean,
      follows: boolean,
      solutions: boolean,
      votes: boolean,
      system: boolean
    },
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private',
      showEmail: boolean,
      allowMessages: boolean
    }
  },
  savedItems: array,             // Array of saved item objects
  education: string,
  location: string,
  work: string,
  expertise: array,
  coverPhoto: string
}
```

### 2. posts
```javascript
{
  id: string,                    // Document ID
  userId: string,                // Reference to users collection
  userName: string,
  userAvatar: string,
  title: string,
  content: string,
  category: string,
  imageUrl: string,
  videoUrl: string,
  gifUrl: string,
  emoji: string,
  location: string,
  locationCoordinates: {
    latitude: number,
    longitude: number
  },
  taggedUsers: array,
  privacy: 'public' | 'friends' | 'private',
  scheduledTime: timestamp,
  timestamp: timestamp,
  votes: number,
  isSolved: boolean,
  solutions: array,             // Embedded array of solutions
  comments: array               // Embedded array of comments
}
```

### 3. notifications
```javascript
{
  id: string,                    // Document ID
  userId: string,                // Reference to users collection
  type: 'vote' | 'reply' | 'solution' | 'follow' | 'mention' | 'system',
  text: string,
  avatar: string,
  actionUrl: string,
  read: boolean,
  createdAt: timestamp,
  time: string                  // Formatted time string
}
```

### 4. activities
```javascript
{
  id: string,                    // Document ID
  userId: string,                // Reference to users collection
  action: string,               // 'created_post', 'deleted_post', 'added_solution', etc.
  metadata: object,             // Additional data about the action
  timestamp: timestamp
}
```

### 5. groups
```javascript
{
  id: string,                    // Document ID
  name: string,
  description: string,
  category: string,
  avatar: string,
  coverPhoto: string,
  creatorId: string,            // Reference to users collection
  members: array,               // Array of member IDs
  memberCount: number,
  posts: array,                 // Array of post IDs
  timestamp: timestamp
}
```

### 6. conversations
```javascript
{
  id: string,                    // Document ID
  participants: array,          // Array of user IDs
  messages: array,              // Embedded array of messages
  lastMessage: string,
  time: string,
  timestamp: timestamp
}
```

### 7. videos
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userAvatar: string,
  title: string,
  description: string,
  thumbnail: string,
  videoUrl: string,
  views: number,
  likes: number,
  duration: string,
  timestamp: timestamp,
  category: string,
  tags: array
}
```

### 8. products
```javascript
{
  id: string,
  sellerId: string,
  sellerName: string,
  sellerAvatar: string,
  title: string,
  description: string,
  price: number,
  category: string,
  images: array,
  condition: 'new' | 'used' | 'refurbished',
  stock: number,
  rating: number,
  reviews: number,
  timestamp: timestamp,
  location: string
}
```

### 9. inspirations
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  imageUrl: string,
  challengeOvercome: string,
  timestamp: timestamp,
  likes: number
}
```

### 10. collaborations
```javascript
{
  id: string,
  creatorId: string,
  creatorName: string,
  creatorAvatar: string,
  title: string,
  description: string,
  category: string,
  type: 'project' | 'partnership' | 'mentorship' | 'investment',
  requiredSkills: array,
  status: 'open' | 'in_progress' | 'completed' | 'closed',
  applicants: array,
  selectedPartner: object,
  timestamp: timestamp,
  deadline: timestamp,
  budget: number
}
```

### 11. livestreams
```javascript
{
  id: string,
  streamerId: string,
  streamerName: string,
  streamerAvatar: string,
  title: string,
  description: string,
  thumbnail: string,
  streamUrl: string,
  streamKey: string,
  category: string,
  tags: array,
  viewers: number,
  likes: number,
  status: 'offline' | 'live' | 'scheduled',
  scheduledTime: timestamp,
  startedAt: timestamp,
  endedAt: timestamp,
  duration: number,
  isRecording: boolean,
  allowChat: boolean,
  isPrivate: boolean,
  maxViewers: number,
  timestamp: timestamp,
  chatMessages: array
}
```

### 12. meetings
```javascript
{
  id: string,
  hostId: string,
  hostName: string,
  hostAvatar: string,
  title: string,
  description: string,
  scheduledTime: timestamp,
  duration: number,
  participants: array,
  maxParticipants: number,
  status: 'scheduled' | 'live' | 'ended',
  meetingUrl: string,
  timestamp: timestamp
}
```

## Required Firestore Indexes

Create these indexes in Firebase Console for optimal query performance:

### posts collection
- Composite index: (userId, timestamp) DESC
- Composite index: (category, timestamp) DESC
- Composite index: (timestamp) DESC
- Single field index: votes (descending)

### notifications collection
- Composite index: (userId, createdAt) DESC
- Composite index: (userId, read) for filtering unread

### activities collection
- Composite index: (userId, timestamp) DESC
- Composite index: (timestamp) DESC

### groups collection
- Composite index: (category, timestamp) DESC
- Composite index: (timestamp) DESC

### videos collection
- Composite index: (userId, timestamp) DESC
- Composite index: (category, timestamp) DESC
- Composite index: (timestamp) DESC

### products collection
- Composite index: (sellerId, timestamp) DESC
- Composite index: (category, timestamp) DESC
- Composite index: (timestamp) DESC

### inspirations collection
- Composite index: (userId, timestamp) DESC
- Composite index: (timestamp) DESC

### collaborations collection
- Composite index: (category, timestamp) DESC
- Composite index: (status, timestamp) DESC
- Composite index: (timestamp) DESC

### livestreams collection
- Composite index: (streamerId, timestamp) DESC
- Composite index: (category, timestamp) DESC
- Composite index: (status, timestamp) DESC
- Composite index: (timestamp) DESC

### meetings collection
- Composite index: (hostId, scheduledTime) DESC
- Composite index: (status, scheduledTime) DESC
- Composite index: (scheduledTime) DESC

### conversations collection
- Composite index: (participants array-contains, timestamp) DESC
- Composite index: (timestamp) DESC

### users collection
- Single field index: username (for autocomplete search)
- Composite index: (createdAt) DESC

## Firestore Security Rules

Basic security rules structure (customize based on your needs):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts are publicly readable, only writable by author
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Similar rules for other collections...
  }
}
```

## Setup Instructions

1. **Create Firebase Project**: Go to Firebase Console and create a new project
2. **Enable Firestore Database**: Create a Firestore database in production mode
3. **Set Up Authentication**: Enable Email/Password authentication
4. **Create Indexes**: Use the Firebase Console or deploy indexes using the Firebase CLI
5. **Configure Security Rules**: Set appropriate security rules for your collections
6. **Update Environment Variables**: Add your Firebase config to `.env` file

## Data Migration

If migrating from localStorage or another backend:

1. Export existing data from localStorage
2. Transform data to match Firestore schema
3. Use Firebase Admin SDK or client SDK to bulk import
4. Verify data integrity after migration
5. Update application to use Firestore APIs
