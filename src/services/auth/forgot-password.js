import adminFirebase from '../../../firebase/firebaseAdmin.js';
import prisma from '../../../prisma/prismaClient.js'; 

import { sendResetPasswordEmail } from '../auth/utils/sendLink.js';

export const forgotPasswordService = async (email) => {
    try {
        // Cek di database (menggunakan Prisma)
        const userInDB = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!userInDB) {
            throw new Error('USER_NOT_FOUND_IN_DB');
        }

        // Cek di Firebase Auth
        try {
            await adminFirebase.auth().getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                throw new Error('USER_NOT_FOUND_IN_AUTH');
            }
            throw error;
        }

        // Cek di Firestore
        const db = adminFirebase.firestore();
        const userQuery = await db.collection('users').where('email', '==', email).get();

        if (userQuery.empty) {
            throw new Error('USER_NOT_FOUND_IN_FIRESTORE');
        }

        // Kirim email reset password
        await sendResetPasswordEmail(email);

        return { message: 'Password reset email sent successfully' };
    } catch (error) {
        console.error('Error in forgotPasswordService:', error);
        if (error.message === 'USER_NOT_FOUND_IN_DB') {
            throw new Error('Email not found in database');
        } else if (error.message === 'USER_NOT_FOUND_IN_AUTH') {
            throw new Error('Email not found in Firebase Auth');
        } else if (error.message === 'USER_NOT_FOUND_IN_FIRESTORE') {
            throw new Error('Email not found in Firestore');
        }
        throw new Error('FORGOT_PASSWORD_ERROR');
    }
};