// import { createUser, loginUser } from '../services/userServices.js';
import { createUser } from '../services/auth/registrasi.js';
import { loginUser } from '../services/auth/login.js';
import { logoutUser } from '../services/auth/logout.js';

export const registrasi = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Validasi data input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Semua field wajib diisi.' });
        }

        // Panggil service untuk membuat user baru
        const { user, token } = await createUser({ name, email, password, role });

        // Kembalikan respons sukses dengan data user dan token
        return res.status(201).json({
            message: 'Registrasi berhasil. Selamat datang!',
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
        console.error('Error registering user:', error);

        // Email sudah terdaftar
        if (error.message === 'EMAIL_ALREADY_REGISTERED' || error.message.includes('EMAIL_ALREADY_REGISTERED_IN_FIREBASE')) {
            return res.status(409).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
        }

        // Kesalahan lain, misalnya masalah koneksi atau validasi di Firebase
        return res.status(500).json({ error: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { id, name, email: userEmail, role, isApproved, token } = await loginUser({ email, password });

        // Jika login berhasil dan sudah disetujui
        return res.status(200).json({
            message: 'Login berhasil. Selamat datang kembali!',
            id,
            name,
            email: userEmail,
            role,
            isApproved,
            token,
        });
    } catch (error) {
        console.error('Error logging in:', error);

        // Tangani kesalahan spesifik
        if (error.message === 'AUTHOR_NOT_APPROVED') {
            return res.status(403).json({
                error: 'Akses sebagai Author ditolak. Anda tidak memiliki hak akses, pastikan anda telah mengirimkan persyaratan yang dibutuhkan, dan tunggu sampai admin memverifikasi.'
            });
        } else if (error.message === 'INVALID_PASSWORD') {
            return res.status(401).json({ error: 'Email atau password tidak valid. Silakan coba lagi.' });
        } else if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        } else if (error.message === 'ADMIN_NOT_ALLOWED') {
            return res.status(403).json({ error: 'Admin tidak diperbolehkan untuk login dari sini.' });
        }

        // Tangani kesalahan lain
        return res.status(500).json({ error: 'Terjadi kesalahan saat login. Silakan coba lagi.' });
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

        // Jika logout berhasil
        return res.status(200).json({ message: 'Logout berhasil. Sampai jumpa!' });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat logout. Silakan coba lagi.' });
    }
};