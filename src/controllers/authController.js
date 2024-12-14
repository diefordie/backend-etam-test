import { createUser } from '../services/auth/registrasi.js';
import loginUser from '../services/auth/login.js';
import { logoutUser } from '../services/auth/logout.js';
import adminFirebase from '../../firebase/firebaseAdmin.js';
import prisma from '../../prisma/prismaClient.js';

export const registrasi = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Memanggil service untuk membuat user
        const { user, token } = await createUser({ name, email, password, role });

        // Response sukses
        return res.status(201).json({
            message: 'User berhasil dibuat. Silakan verifikasi email Anda.',
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

        // Response error
        const statusCode = getErrorStatusCode(error.message);
        return res.status(statusCode).json({ message: error.message });
    }
};

// Fungsi helper untuk menentukan kode status error
const getErrorStatusCode = (errorMessage) => {
    switch (errorMessage) {
        case 'EMAIL_ALREADY_REGISTERED':
        case 'EMAIL_ALREADY_REGISTERED_IN_FIREBASE':
        case 'EMAIL_ALREADY_REGISTERED_IN_FIRESTORE':
            return 409; // Conflict
        case 'FIREBASE_ERROR':
        case 'DATABASE_ERROR':
            return 500; // Internal Server Error
        default:
            return 400; // Bad Request
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Panggil service login
        const userData = await loginUser({ email, password });

        // Kirim respons sukses dengan data user dan token
        return res.status(200).json({
            message: 'Login successful',
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

        // Tangani error spesifik
        const errorResponses = {
            EMAIL_AND_PASSWORD_REQUIRED: { status: 400, message: 'Email and password are required' },
            USER_NOT_FOUND: { status: 404, message: 'User not found in database' },
            INVALID_PASSWORD_FORMAT: { status: 500, message: 'Invalid password format' },
            INVALID_PASSWORD: { status: 400, message: 'Invalid password' },
            AUTHOR_NOT_APPROVED: { status: 403, message: 'Author account not approved' },
            ADMIN_NOT_ALLOWED: { status: 403, message: 'Admin login is not allowed' },
            USER_NOT_FOUND_IN_FIREBASE: { status: 404, message: 'User not found in Firebase' },
            EMAIL_NOT_VERIFIED: { status: 400, message: 'Email not verified. Please check your inbox and verify your email.' },
            USER_NOT_FOUND_IN_FIRESTORE: { status: 404, message: 'User not found in Firestore' },
        };

        // Berikan respons sesuai jenis error
        const response = errorResponses[error.message] || {
            status: 500,
            message: 'An error occurred during login',
        };

        return res.status(response.status).json({ message: response.message });
    }
};

export const logout = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak diberikan atau format tidak valid.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const result = await logoutUser(token);
        return res.status(200).json({ message: 'Logout berhasil. Sampai jumpa!' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat logout. Silakan coba lagi.' });
    }
};

