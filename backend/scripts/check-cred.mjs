import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const root = path.resolve('..');
const serviceAccountPath = path.join(root, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const credential = admin.credential.cert(serviceAccount);

credential.getAccessToken()
  .then((token) => {
    console.log('access token', token);
    process.exit(0);
  })
  .catch((error) => {
    console.error('credential error', error);
    process.exit(1);
  });
