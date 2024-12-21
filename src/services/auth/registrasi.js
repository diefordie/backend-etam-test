import prisma from '../../../prisma/prismaClient.js';
import adminFirebase from '../../../firebase/firebaseAdmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { hashPassword } from '../auth/utils/hash.js';
import { sendVerificationEmail } from '../auth/utils/sendLink.js';

dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Fungsi utama untuk membuat user
export const createUser = async ({ name, email, password, role }) => {
    const firestore = adminFirebase.firestore();

    // Validasi apakah email sudah ada di Prisma
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email ini telah terdaftar, gunakan email lain!');
    }

    // Validasi apakah email sudah ada di Firebase Auth
    try {
        await adminFirebase.auth().getUserByEmail(email);
        throw new Error('EMAIL_ALREADY_REGISTERED_IN_FIREBASE');
    } catch (firebaseError) {
        if (firebaseError.code !== 'auth/user-not-found') {
            console.error('Firebase Error:', firebaseError);
            throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
        }
    }

    // Validasi apakah email sudah ada di Firestore
    const userDoc = await firestore.collection('users').where('email', '==', email).get();
    if (!userDoc.empty) {
        throw new Error('EMAIL_ALREADY_REGISTERED_IN_FIRESTORE');
    }

    // Generate password hash
    const hashedPassword = await hashPassword(password); // Fungsi hashPassword sudah menangani salt

    // Buat user di Firebase
    let userRecord;
    try {
        userRecord = await adminFirebase.auth().createUser({
            email,
            password, // Firebase memerlukan plain password untuk membuat user
        });

        // Kirim email verifikasi
        await sendVerificationEmail(email, name);

        // Simpan ke Firestore
        await firestore.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            password: hashedPassword, // Simpan hash dalam Firestore
            createdAt: new Date().toISOString(),
        });

    } catch (firebaseError) {
        console.error('Firebase Error:', firebaseError);
        throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
    }

    // Tentukan status persetujuan berdasarkan role
    const isApproved = role.toUpperCase() === 'AUTHOR' ? false : true;

    try {
        // Simpan ke database Prisma
        const user = await prisma.user.create({
            data: {
                id: userRecord.uid,
                name,
                email,
                password: hashedPassword, // Simpan hash dalam Prisma
                role,
                isApproved,
            },
        });

        // Jika role adalah AUTHOR, simpan data tambahan
        if (role.toUpperCase() === 'AUTHOR') {
            await prisma.author.create({
                data: { userId: user.id, name },
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        return { user, token };

    } catch (prismaError) {
        console.error('Prisma Error:', prismaError);
        throw new Error('DATABASE_ERROR: ' + prismaError.message);
    }
};
