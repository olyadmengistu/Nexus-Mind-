import fs from 'fs';
import path from 'path';

const envPath = path.resolve('..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    process.env[key] = rest.join('=').trim();
  });
}

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;
const BACKEND_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function getAuthToken(email, password) {
  const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  let response = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await response.json();
  if (response.ok) return data.idToken;
  if (data.error && data.error.message === 'EMAIL_EXISTS') {
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    response = await fetch(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const signInData = await response.json();
    if (!response.ok) throw new Error(`Failed sign in: ${response.status} ${JSON.stringify(signInData)}`);
    return signInData.idToken;
  }
  throw new Error(`Failed sign up: ${response.status} ${JSON.stringify(data)}`);
}

async function run() {
  const idToken = await getAuthToken('smoke-upload-user@nexusmind.local', 'SmokeUpload123!');
  console.log('idToken length', idToken.length);

  const filePath = path.resolve('..', 'package.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test file not found: ${filePath}`);
  }
  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('file', new Blob([fileBuffer]), 'package.json');

  const response = await fetch(`${BACKEND_BASE}/api/upload`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const text = await response.text();
  console.log('upload response status', response.status);
  console.log('upload response body', text);
  if (!response.ok) {
    throw new Error(`Upload failed: ${text}`);
  }
}

run().catch((err) => {
  console.error('Upload smoke test failed:', err);
  process.exit(1);
});
