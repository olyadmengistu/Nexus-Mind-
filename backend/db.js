import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let db;

export async function connectDB() {
  try {
    // Try to use service account file first
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account file');
    } else {
      // Fallback to environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID || 'nexusmind-e8130';
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
      console.log('Firebase Admin initialized with default credentials');
    }
    
    db = admin.firestore();
    console.log('Firestore connected successfully');
  } catch (error) {
    console.error('Firebase connection error:', error);
    process.exit(1);
  }
}

export { db };
export default admin;
