import { bucket } from './firebaseAdmin.js';

// Fungsi untuk mengunggah buffer file ke Firebase Storage
export const uploadFileToStorage = async (fileBuffer, destination) => {
  try {
    // Dapatkan referensi file di bucket
    const file = bucket.file(destination);

    // Unggah file dari buffer ke Firebase Storage
    await file.save(fileBuffer, {
      public: true,
      metadata: {
        contentType: 'image/jpeg', // Pastikan contentType sesuai dengan tipe file yang diunggah
      },
    });

    console.log(`File uploaded to ${destination}`);

    // Kembalikan URL publik untuk file yang diunggah
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};