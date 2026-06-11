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
  savedItems: array              // Array of saved post IDs
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
  members: array,               // Array of member objects
  memberCount: number,
  posts: array,                 // Array of post IDs
  timestamp: timestamp
}
```

### 6. conversations
```javascript
{
  id: string,                    // Document ID
  participants: array,          // Array of user objects
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
  title: string,
  description: string,
  thumbnailUrl: string,
  videoUrl: string,
  userId: string,
  userName: string,
  userAvatar: string,
  views: number,
  timestamp: timestamp
}
```

### 8. products
```javascript
{
  id: string,
  title: string,
  description: string,
  price: number,
  imageUrl: string,
  userId: string,
  userName: string,
  userAvatar: string,
  category: string,
  timestamp: timestamp
}
```

## Indexes

Create these indexes in Firebase Console for optimal query performance:

### posts collection
- Composite index: (userId, timestamp) DESC
- Composite index: (category, timestamp) DESC
- Composite index: (timestamp) DESC
- Composite index: (votes) DESC

### notifications collection
- Composite index: (userId, createdAt) DESC

### activities collection
- Composite index: (userId, timestamp) DESC

### groups collection
- Composite index: (category, timestamp) DESC
