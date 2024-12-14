import bcrypt from 'bcrypt';
import prisma from '../../../prisma/prismaClient.js';
import adminFirebase from '../../../firebase/firebaseAdmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const loginUser = async ({ email, password }) => {
    try {
        // Cek pengguna di PostgreSQL
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        // Validasi passworda
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('INVALID_PASSWORD');
        }

        // Cek jika pengguna adalah Author dan jika mereka disetujui
        if (user.role === 'AUTHOR' && !user.isApproved) {
            throw new Error('AUTHOR_NOT_APPROVED'); // Error khusus untuk author yang tidak disetujui
        }

        // Cek jika pengguna adalah Admin
        if (user.role === 'ADMIN') {
            throw new Error('ADMIN_NOT_ALLOWED'); // Error khusus untuk pembatasan login admin
        }

        // Cek keberadaan pengguna di Firebase
        let firebaseUser;
        try {
            firebaseUser = await adminFirebase.auth().getUser(user.id); // Menggunakan UID dari PostgreSQL
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                throw new Error('USER_NOT_FOUND_IN_FIREBASE'); // Pengguna tidak ditemukan di Firebase
            } else {
                throw new Error('FIREBASE_ERROR: ' + error.message);
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            token,
        };
    } catch (error) {
        console.error('Error logging in:', error);
        throw new Error(error.message); // Pertahankan pesan kesalahan asli
    }
};