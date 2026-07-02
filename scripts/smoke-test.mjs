import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';

const root = path.resolve(process.cwd());
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    process.env[key] = rest.join('=').trim();
  });
}

const serviceAccountPath = path.join(root, 'firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account file not found at ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;
const BACKEND_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function signInWithCustomToken(uid) {
  const customToken = await admin.auth().createCustomToken(uid);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  if (!response.ok) {
    throw new Error(`Failed to sign in with custom token: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data.idToken;
}

async function apiRequest(path, options = {}) {
  const url = `${BACKEND_BASE}${path}`;
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    throw new Error(`API ${path} failed ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function authRequest(path, token, options = {}) {
  const init = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  };
  if (options.body && typeof options.body !== 'string') {
    init.body = JSON.stringify(options.body);
  }
  return apiRequest(path, init);
}

async function run() {
  console.log('Using backend base:', BACKEND_BASE);
  console.log('Signing in with Firebase custom token...');
  const idToken = await signInWithCustomToken('nexusmind-test-user');
  console.log('Received ID token length:', idToken.length);

  const health = await apiRequest('/api/health');
  console.log('Health:', health);

  const verify = await apiRequest('/api/auth/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  console.log('Verify token:', verify);

  const analytics = await authRequest('/api/analytics/overview', idToken);
  console.log('Analytics overview:', analytics);

  const groups = await authRequest('/api/groups', idToken);
  console.log('Groups list count:', Array.isArray(groups) ? groups.length : groups);

  const newPost = {
    title: 'Smoke Test Post',
    content: 'This post was created by automated smoke tests.',
    authorId: 'nexusmind-test-user',
    category: 'testing',
    tags: ['smoke', 'test'],
  };
  const createdPost = await authRequest('/api/posts', idToken, {
    method: 'POST',
    body: newPost,
  });
  console.log('Created post:', createdPost);

  const allPosts = await authRequest('/api/posts?limit=5', idToken);
  console.log('Fetched posts count:', Array.isArray(allPosts) ? allPosts.length : 0);

  const postId = createdPost.id;
  const singlePost = await authRequest(`/api/posts/${postId}`, idToken);
  console.log('Retrieved created post:', singlePost && singlePost.id === postId ? 'OK' : singlePost);

  const voteResult = await authRequest(`/api/posts/${postId}/vote`, idToken, {
    method: 'POST',
    body: { userId: 'nexusmind-test-user', voteType: 'up' },
  });
  console.log('Vote result:', voteResult);

  const commentResult = await authRequest(`/api/posts/${postId}/comments`, idToken, {
    method: 'POST',
    body: { userId: 'nexusmind-test-user', text: 'Smoke test comment.' },
  });
  console.log('Add comment:', commentResult);

  const comments = await authRequest(`/api/posts/${postId}/comments`, idToken);
  console.log('Comments count:', Array.isArray(comments) ? comments.length : 0);

  const search = await authRequest('/api/search?q=smoke&type=posts', idToken);
  console.log('Search posts count:', search.posts ? search.posts.length : 0);

  const feedback = await apiRequest('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Tester', email: 'smoke@example.com', message: 'Automated feedback test', type: 'smoke' }),
  });
  console.log('Feedback submitted:', feedback);

  console.log('Smoke test completed successfully.');
}

run().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});
