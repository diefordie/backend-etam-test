import { createUser } from '../services/auth/registrasi.js';
import loginUser from '../services/auth/login.js';
import { logoutUser } from '../services/auth/logout.js';
import { forgotPasswordService } from '../services/auth/forgot-password.js';
import { resetPassword } from '../services/auth/resetPassword.js';
import adminFirebase from '../../firebase/firebaseAdmin.js';
import prisma from '../../prisma/prismaClient.js';

export const registrasi = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const { user, token } = await createUser({ name, email, password, role });

        // Response sukses
        return res.status(201).json({
            message: 'Akun berhasil dibuat! Jangan lupa cek email untuk verifikasi ya.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
            },
            token,
        });
    } catch (error) {
        console.error('Error registering user:', error.message);

        const statusCode = getErrorStatusCode(error.message);
        const friendlyMessage = getFriendlyErrorMessage(error.message);

        return res.status(statusCode).json({ message: friendlyMessage });
    }
};

const getErrorStatusCode = (errorMessage) => {
    switch (errorMessage) {
        case 'EMAIL_ALREADY_REGISTERED':
        case 'EMAIL_ALREADY_REGISTERED_IN_FIREBASE':
        case 'EMAIL_ALREADY_REGISTERED_IN_FIRESTORE':
            return 409;
        case 'FIREBASE_ERROR':
        case 'DATABASE_ERROR':
            return 500; 
        default:
            return 400; 
    }
};

const getFriendlyErrorMessage = (errorMessage) => {
    const messages = {
        EMAIL_ALREADY_REGISTERED: 'Email ini sudah terdaftar. Coba gunakan email lain',
        EMAIL_ALREADY_REGISTERED_IN_FIREBASE: 'Email ini sudah terdaftar. Coba gunakan email lain',
        EMAIL_ALREADY_REGISTERED_IN_FIRESTORE: 'Email ini sudah terdaftar. Coba gunakan email lain',
        FIREBASE_ERROR: 'Ups! Ada masalah di server kami. Silakan coba lagi nanti.',
        DATABASE_ERROR: 'Ups! Ada masalah di server kami. Silakan coba lagi nanti.',
        default: 'Silakan cek kembali data Anda.',
    };
    return messages[errorMessage] || messages.default;
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validasi input kosong
    const errors = [];
    if (!email) {
        errors.push({
            type: "field",
            value: "",
            msg: "Email tidak boleh kosong",
            path: "email",
            location: "body",
        });
    }
    if (!password) {
        errors.push({
            type: "field",
            value: "",
            msg: "Password tidak boleh kosong",
            path: "password",
            location: "body",
        });
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const userData = await loginUser({ email, password });

        return res.status(200).json({
            message: 'Login berhasil! Selamat datang kembali!',
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                isApproved: userData.isApproved,
            },
            token: userData.token,
        });
    } catch (error) {
        console.error('Login Error:', error.message);

        const errorResponses = {
            USER_NOT_FOUND: { status: 404, message: 'Akun tidak ditemukan. Pastikan Anda sudah mendaftar.' },
            INVALID_PASSWORD: { status: 401, message: 'Password salah. Cek kembali password Anda.' },
            EMAIL_NOT_VERIFIED: { status: 400, message: 'Email Anda belum diverifikasi. Silakan periksa inbox email Anda.' },
        };

        const response = errorResponses[error.message] || {
            status: 500,
            message: 'Terjadi kesalahan internal pada server. Silakan coba lagi.',
        };

        return res.status(response.status).json({ message: response.message });
    }
};

export const logout = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak diberikan atau formatnya salah. Cek lagi, ya!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const result = await logoutUser(token);
        return res.status(200).json({ message: 'Logout berhasil. Sampai jumpa lagi!' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Ada masalah saat logout. Coba lagi, ya.' });
    }
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in forgotPassword controller:', error);
        if (error.message === 'Email not found in database' ||
            error.message === 'Email not found in Firebase Auth' ||
            error.message === 'Email not found in Firestore') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'FORGOT_PASSWORD_ERROR') {
            res.status(400).json({ message: 'Failed to send password reset email' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};




export const resetPasswordController = async (req, res) => {
    const { oobCode, newPassword } = req.body;

    if (!oobCode || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const result = await resetPassword(oobCode, newPassword);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in resetPasswordController:', error);
        if (error.message === 'INVALID_OOB_CODE') {
            res.status(400).json({ message: 'Invalid or expired reset link' });
        } else if (error.message === 'WEAK_PASSWORD') {
            res.status(400).json({ message: 'Password is too weak' });
        } else {
            res.status(500).json({ message: 'Failed to reset password' });
        }
    }
};