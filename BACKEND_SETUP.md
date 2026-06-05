# NexusMind Backend Setup Guide

This guide will help you set up the serverless backend for NexusMind using Supabase and Vercel.

## Architecture Overview

- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Database**: Supabase PostgreSQL (scalable, serverless)
- **API**: Vercel Serverless Functions
- **Frontend**: React + Vite (existing)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization and set project name (e.g., "nexusmind")
4. Set database password (save it securely)
5. Select region closest to your users
6. Click "Create new project" and wait for setup (~2 minutes)

## Step 2: Get Supabase Credentials

1. Go to Project Settings > API
2. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema
5. Verify tables were created in Table Editor

## Step 4: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - `https://[your-project].supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret

8. In Supabase Dashboard:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

## Step 5: Set Environment Variables

### Local Development
Create `.env.local` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000/api
```

### Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Go to Settings > Environment Variables
4. Add:
   - `SUPABASE_URL` (your Supabase project URL)
   - `SUPABASE_ANON_KEY` (your Supabase anon key)
   - `VITE_API_URL` (your deployed API URL, e.g., `https://your-app.vercel.app/api`)

## Step 6: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install -D @vercel/node
```

## Step 7: Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure build settings (auto-detected from vercel.json)
6. Add environment variables
7. Click "Deploy"

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google OAuth
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post (requires auth)
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post (requires auth)
- `DELETE /api/posts/[id]` - Delete post (requires auth)
- `PATCH /api/posts/[id]` - Vote on post (requires auth)

### Solutions
- `POST /api/solutions` - Create solution (requires auth)
- `PATCH /api/solutions/[id]` - Vote on solution (requires auth)
- `DELETE /api/solutions/[id]` - Delete solution (requires auth)

## Testing the Backend

### Test Authentication
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Posts (requires auth token)
```bash
# Get posts
curl http://localhost:3000/api/posts

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"category":"general","title":"Test Post","content":"This is a test post"}'
```

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **JWT Authentication**: Supabase handles token validation
- **Protected Routes**: API endpoints verify auth tokens
- **CORS**: Configured for your domain in production

## Scaling Considerations

- **Database**: Supabase PostgreSQL scales automatically
- **API**: Vercel serverless functions scale automatically
- **Storage**: Supabase Storage for file uploads
- **Pricing**: Free tier handles up to 500MB database, 1GB bandwidth

## Next Steps

1. Update frontend to use new API endpoints
2. Replace Firebase auth with Supabase auth
3. Replace localStorage with Supabase database calls
4. Test end-to-end authentication flow
5. Deploy and monitor in production

## Troubleshooting

### CORS Errors
Add your frontend domain to Supabase Dashboard > Authentication > URL Configuration

### Auth Errors
Verify JWT token is being sent in `Authorization: Bearer <token>` header

### Database Connection
Check Supabase project is not paused (free tier pauses after inactivity)

### Vercel Deployment
Ensure `vercel.json` is in root directory and dependencies are installed
