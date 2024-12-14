import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let serviceAccount;

try {
    // Parse service account JSON from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure the JSON format is correct in .env file.", error);
}

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`, // Bucket Storage
    });
    console.log("Firebase admin initialized successfully with storage bucket.");
} else if (!serviceAccount) {
    console.error("Firebase service account JSON is not provided or invalid.");
}

export const bucket = admin.storage().bucket(); // Ekspor bucket untuk digunakan

// Periksa apakah bucket berhasil diekspor
if (!bucket) {
    console.error("Failed to initialize Firebase Storage bucket. Check Firebase configuration.");
}

export default admin;