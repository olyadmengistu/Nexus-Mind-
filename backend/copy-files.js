import fs from 'fs';
import path from 'path';

const sourcePath = path.join('..', 'firebase-service-account.json.json');
const destPath = path.join(process.cwd(), 'firebase-service-account.json');

if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, destPath);
  console.log('Copied firebase-service-account.json.json to backend directory');
} else {
  console.log('firebase-service-account.json.json not found in root directory');
}
