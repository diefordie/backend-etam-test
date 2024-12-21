import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getUserById, 
  updateUserName, 
  updateUserEmail, 
  updateUserPassword, 
  updateUserPhoto,
  deletePhotoFromStorageAndPrisma
} from '../services/editProfileUser.js';
import { uploadFileToStorage } from '../../firebase/firebaseBucket.js';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Load environment variables
dotenv.config();

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase app with your config
initializeApp(firebaseConfig);

// Mendapatkan data profil pengguna
export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Memperbarui Nama Pengguna
export const updateName = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  try {
    const updatedUser = await updateUserName(userId, name);
    return res.status(200).json({ message: 'Name updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user name:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Memperbarui Email Pengguna
export const updateEmail = async (req, res) => {
  const userId = req.user.id;
  const { email } = req.body;

  try {
    const updatedUser = await updateUserEmail(userId, email);
    return res.status(200).json({ message: 'Email updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user email:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user.id; // Mendapatkan userId dari token atau session
  const { currentPassword, newPassword } = req.body;

  // Validasi input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current password and new password are required.' });
  }

  try {
    // Panggil service untuk memperbarui password
    const result = await updateUserPassword(userId, currentPassword, newPassword);

    // Mengirimkan response sukses
    return res.status(200).json(result); // `result` berisi pesan dari service
  } catch (error) {
    console.error('Error updating password:', error);

    // Mengirimkan response error yang lebih jelas
    return res.status(400).json({
      message: error.message || 'Failed to update password.',
      // Anda bisa menambahkan status atau kode kesalahan lain jika diperlukan
      error: error.stack || 'No stack trace available.',
    });
  }
};

// Mengunggah Foto Profil Pengguna
export const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    console.log("User ID:", userId); // Log untuk memeriksa userId
    console.log("File received:", file); // Log untuk memastikan file diterima

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Tentukan path file di Firebase Storage
    const destination = `profiles/${Date.now()}_${file.originalname}`;
    
    // Upload file ke Firebase Storage
    const url = await uploadFileToStorage(file.buffer, destination);
    console.log("URL generated from Firebase:", url); // Log untuk melihat URL dari Firebase

    // Simpan URL ke database
    const updatedUser = await updateUserPhoto(userId, url);
    console.log("Updated user data:", updatedUser); // Log hasil dari Prisma untuk memastikan update berhasil

    // Kembalikan respons ke client
    return res.status(200).json({
      message: 'File uploaded successfully',
      url: updatedUser.userPhoto,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const deletePhoto = async (req, res) => {
  const userId = req.user.id;  // Ambil userId dari token atau session yang sudah diverifikasi

  try {
    const result = await deletePhotoFromStorageAndPrisma(userId);  // Panggil service untuk menghapus foto
    return res.status(200).json(result);  // Kirim respons sukses
  } catch (error) {
    
   
console.error('Error deleting photo:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete photo.' });
  }
};