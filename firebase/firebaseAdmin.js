import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ambil data JSON dari env dan parse
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
