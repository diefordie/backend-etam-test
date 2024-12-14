import { loginAdminServices } from '../services/adminServices.js'; // Pastikan jalur sudah benar

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Memanggil loginAdminServices dengan email dan password dari body request
        const adminData = await loginAdminServices({ email, password });

        // Jika login berhasil, kirimkan response sukses beserta data admin
        res.status(200).json({
            message: 'Login successful',
            admin: adminData,
        });
    } catch (error) {
        // Menangani error ketika admin tidak ditemukan atau password salah
        if (error.message === 'ADMIN_NOT_FOUND') {
            res.status(404).json({ message: 'Admin tidak ditemukan' });
        } else if (error.message === 'INVALID_PASSWORD') {
            res.status(401).json({ message: 'Password salah' });
        } else {
            res.status(500).json({ message: 'Terjadi kesalahan saat login' });
        }
    }
};
