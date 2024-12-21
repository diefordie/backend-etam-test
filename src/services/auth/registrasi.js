import prisma from '../../../prisma/prismaClient.js';
import adminFirebase from '../../../firebase/firebaseAdmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { hashPassword } from '../auth/utils/hash.js';
import { sendVerificationEmail } from '../auth/utils/sendLink.js';

dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const createUser = async ({ name, email, password, role }) => {
    const firestore = adminFirebase.firestore();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    try {
        await adminFirebase.auth().getUserByEmail(email);
        throw new Error('EMAIL_ALREADY_REGISTERED_IN_FIREBASE');
    } catch (firebaseError) {
        if (firebaseError.code !== 'auth/user-not-found') {
            console.error('Firebase Error:', firebaseError);
            throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
        }
    }

    const userDoc = await firestore.collection('users').where('email', '==', email).get();
    if (!userDoc.empty) {
        throw new Error('EMAIL_ALREADY_REGISTERED_IN_FIRESTORE');
    }

    const hashedPassword = await hashPassword(password);
    let userRecord;
    try {
        userRecord = await adminFirebase.auth().createUser({
            email,
            password, 
        });

        await sendVerificationEmail(email, name);

        await firestore.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        });

    } catch (firebaseError) {
        console.error('Firebase Error:', firebaseError);
        throw new Error('FIREBASE_ERROR: ' + firebaseError.message);
    }

    const isApproved = role.toUpperCase() === 'AUTHOR' ? false : true;

    try {
        const user = await prisma.user.create({
            data: {
                id: userRecord.uid,
                name,
                email,
                password: hashedPassword, 
                role,
                isApproved,
            },
        });

        if (role.toUpperCase() === 'AUTHOR') {
            await prisma.author.create({
                data: { userId: user.id, name },
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        return { user, token };

    } catch (prismaError) {
        console.error('Prisma Error:', prismaError);
        throw new Error('DATABASE_ERROR: ' + prismaError.message);
    }
};
