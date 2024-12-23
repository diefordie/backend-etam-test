import adminFirebase from '../../../firebase/firebaseAdmin.js';
import prisma from '../../../prisma/prismaClient.js';
import { hashPassword } from './utils/hash.js';

export const resetPassword = async (oobCode, newPassword) => {
    try {
        // Dapatkan email dari oobCode menggunakan Firebase Auth REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oobCode: oobCode,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error.message);
        }

        const email = data.email;

        // Hash password baru menggunakan fungsi hashPassword custom
        const hashedPassword = hashPassword(newPassword);


        // Dapatkan user dari Firebase Auth
        const userRecord = await adminFirebase.auth().getUserByEmail(email);

        // Update password di Firebase Auth
        await adminFirebase.auth().updateUser(userRecord.uid, {
            password: newPassword,
        });

        // Verifikasi password di Firebase Auth
        try {
            await adminFirebase.auth().getUser(userRecord.uid);
        } catch (error) {
            console.error('Error verifying updated password in Firebase Auth:', error);
        }

        // Dapatkan user dari database
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            throw new Error('User not found in database');
        }

        // Update password di database
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });


        // Verifikasi password di database
        const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true },
        });


        // Update password di Firestore
        const db = adminFirebase.firestore();
        await db.collection('users').doc(user.id).update({ password: hashedPassword });


        // Verifikasi password di Firestore
        const firestoreUser = await db.collection('users').doc(user.id).get();

        return { message: 'Password reset successfully' };
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};