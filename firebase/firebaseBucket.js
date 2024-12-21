import { bucket } from './firebaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config();

const STORAGE_URL = process.env.FIREBASE_STORAGE;

export const uploadFileToStorage = async (fileBuffer, destination) => {
  try {
    const file = bucket.file(destination);
    await file.save(fileBuffer, {
      public: true,
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    console.log(`File uploaded to ${destination}`);
    return `${STORAGE_URL}${bucket.name}/${destination}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};