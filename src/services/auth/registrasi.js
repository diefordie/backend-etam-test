import bcrypt from 'bcrypt';
import prisma from '../../../prisma/prismaClient.js';
import adminFirebase from '../../../firebase/firebaseAdmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Registrasi
export const createUser = async ({ name, email, password, role }) => {
    // Cek apakah email sudah terdaftar di PostgreSQL
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    // Cek apakah email sudah terdaftar di Firebase
    try {
        await adminFirebase.auth().getUserByEmail(email);
        throw new Error('EMAIL_ALREADY_REGISTERED_IN_FIREBASE');
    } catch (firebaseError) {
        if (firebaseError.code !== 'auth/user-not-found') {
            console.error('Firebase Error:', firebaseError);
            throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let userRecord;
    try {
        // Buat pengguna baru di Firebase Authentication
        userRecord = await adminFirebase.auth().createUser({
            email,
            password,
        });
    } catch (firebaseError) {
        console.error('Firebase Error:', firebaseError);
        throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
    }

    // Tentukan status persetujuan
    const isApproved = role.toUpperCase() === 'AUTHOR' ? false : true;

    let user;
    try {
        // Simpan data pengguna di PostgreSQL (tabel user)
        user = await prisma.user.create({
            data: {
                id: userRecord.uid,
                name,
                email,
                password: hashedPassword,
                role,
                isApproved,
            },
        });

        // Jika role adalah 'AUTHOR', simpan data ke tabel author
        if (role.toUpperCase() === 'AUTHOR') {
            await prisma.author.create({
                data: {
                    userId: user.id,  // Hubungkan dengan ID dari tabel user
                    name,
                },
            });
        }

        // Buat token JWT
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1h', // Anda dapat menyesuaikan waktu kedaluwarsa
        });

        return { user, token }; // Kembalikan data pengguna dan token

    } catch (prismaError) {
        console.error('Prisma Error:', prismaError);
        throw new Error('DATABASE_ERROR: ' + prismaError.message);
    }
};