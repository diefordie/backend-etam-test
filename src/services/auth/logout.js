import prisma from '../../../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const logoutUser = async (token) => {
    // Verifikasi token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('INVALID_TOKEN'); // Token tidak valid
    }

    const userId = decodedToken.id; // Ambil user ID dari token yang didekode

    // Cek apakah token sudah dicabut sebelumnya
    const existingRevokedToken = await prisma.revokedToken.findUnique({
        where: { token }
    });

    // Jika token sudah dicabut, tidak perlu menambahkannya lagi
    if (existingRevokedToken) {
        return { message: 'Token was already revoked. You are already logged out.' }; 
    }

    // Simpan token yang dicabut di basis data
    try {
        await prisma.revokedToken.create({
            data: {
                token,
                userId,
            },
        });
    } catch (error) {
        console.error('Error revoking token:', error);
        throw new Error('DATABASE_ERROR: ' + error.message);
    }

    return { message: 'User logged out successfully' };
};

// Fungsi untuk membersihkan token yang kedaluwarsa
export const cleanupRevokedTokens = async () => {
    const expiryDuration = 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() - expiryDuration);

    try {
        await prisma.revokedToken.deleteMany({
            where: {
                createdAt: {
                    lt: expiryDate,
                },
            },
        });

        console.log('Old revoked tokens cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up revoked tokens:', error);
    }
};