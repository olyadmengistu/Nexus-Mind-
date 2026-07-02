import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const root = path.resolve('..');
const serviceAccountPath = path.join(root, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

db.collection('groups').get()
  .then((snapshot) => {
    console.log('groups count', snapshot.size);
    process.exit(0);
  })
  .catch((error) => {
    console.error('firestore error', error);
    process.exit(1);
  });
