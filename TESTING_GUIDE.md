# NexusMind Backend Testing Guide

## Quick Test with Node.js

Run the automated test script:
```bash
node test-backend.js
```

Set your API URL:
```bash
# For local development
set API_URL=http://localhost:3000/api

# For deployed backend
set API_URL=https://your-app.vercel.app/api
```

## Manual Testing with Postman/cURL

### 1. Test Authentication

#### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Save the `access_token` from the response for authenticated requests.

#### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Test Posts

#### Get All Posts
```bash
curl http://localhost:3000/api/posts?page=1&limit=10
```

#### Create Post (Authenticated)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "category": "general",
    "title": "Test Post",
    "content": "This is a test post content",
    "emoji": "🧪"
  }'
```

#### Get Single Post
```bash
curl http://localhost:3000/api/posts/POST_ID
```

#### Update Post (Authenticated)
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "category": "general",
    "title": "Updated Title",
    "content": "Updated content",
    "isSolved": false
  }'
```

#### Vote on Post (Authenticated)
```bash
curl -X PATCH http://localhost:3000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"vote": 5}'
```

#### Delete Post (Authenticated)
```bash
curl -X DELETE http://localhost:3000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Test Solutions

#### Create Solution (Authenticated)
```bash
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "postId": "POST_ID",
    "text": "This is a solution"
  }'
```

#### Update Solution (Authenticated)
```bash
curl -X PATCH http://localhost:3000/api/solutions/SOLUTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "upvotes": 3,
    "helpful": 2
  }'
```

#### Delete Solution (Authenticated)
```bash
curl -X DELETE http://localhost:3000/api/solutions/SOLUTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## What to Test

### ✅ Basic Functionality (Current Backend)
- [ ] User signup with email/password
- [ ] User login with email/password
- [ ] User logout
- [ ] Create posts
- [ ] Read posts (list and single)
- [ ] Update posts
- [ ] Delete posts
- [ ] Vote on posts
- [ ] Create solutions
- [ ] Vote on solutions
- [ ] Delete solutions

### ❌ Advanced Features (Need Enhanced Backend)
The current backend is basic. For a complete platform, you need:

#### Real-time Features
- [ ] Live notifications system
- [ ] Real-time messaging (WebSocket)
- [ ] Live video streaming
- [ ] Real-time collaboration

#### Media Handling
- [ ] Image upload (profile photos, post images)
- [ ] Video upload
- [ ] File attachments
- [ ] Media compression/optimization
- [ ] CDN integration

#### Advanced Social Features
- [ ] Follow/unfollow users
- [ ] User search with filters
- [ ] Advanced notifications (push, email)
- [ ] Activity feed
- [ ] Stories with expiration
- [ ] Comments/threads
- [ ] Reactions (likes, emojis)

#### Feedback System
- [ ] Rating system
- [ ] Reviews
- [ ] Feedback forms
- [ ] Report/flag content
- [ ] Moderation tools

#### Analytics & Insights
- [ ] User analytics
- [ ] Content performance
- [ ] Engagement metrics
- [ ] A/B testing
- [ ] Heatmaps

#### Security & Compliance
- [ ] Rate limiting
- [ ] Input validation
- [ ] XSS/CSRF protection
- [ ] GDPR compliance
- [ ] Data encryption at rest
- [ ] Audit logs

#### Performance
- [ ] Caching (Redis)
- [ ] Database optimization
- [ ] CDN for static assets
- [ ] Image optimization
- [ ] Lazy loading

## Troubleshooting

### Backend Not Responding
1. Check if Vercel dev is running: `vercel dev`
2. Check if deployed: Visit your Vercel dashboard
3. Check environment variables are set

### Authentication Errors
1. Verify Supabase credentials in .env.local
2. Check Supabase Auth is enabled
3. Verify JWT token is valid

### Database Errors
1. Run schema.sql in Supabase SQL Editor
2. Check RLS policies are correct
3. Verify table names match schema

### CORS Errors
1. Add your domain to Supabase Dashboard > Authentication > URL Configuration
2. Check API URL is correct

## Next Steps if Testing Fails

If the basic backend tests fail, we need to build a **production-ready backend** with:

1. **Enhanced Database Schema** - More tables for advanced features
2. **Real-time Infrastructure** - WebSocket server, Redis pub/sub
3. **Media Storage** - Supabase Storage or AWS S3
4. **Notification System** - Push notifications, email service
5. **Video Streaming** - Mux, AWS IVS, or similar
6. **Search Engine** - Elasticsearch or Algolia
7. **Analytics** - Custom analytics or third-party
8. **Security Layer** - Rate limiting, validation, encryption

This would require:
- Migrating to a more robust framework (Next.js API routes or Express.js)
- Adding real-time capabilities (Socket.io)
- Implementing media handling services
- Setting up notification infrastructure
- Adding monitoring and logging
- Implementing comprehensive testing
