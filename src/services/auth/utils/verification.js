import prisma from '../../../../prisma/prismaClient.js';

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        // Periksa token di database
        const userVerification = await prisma.userVerification.findFirst({
            where: { verificationToken: token },
        });

        if (!userVerification) {
            return res.status(400).json({ message: 'Token tidak valid.' });
        }

        // Periksa apakah token telah kedaluwarsa
        if (userVerification.tokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Token telah kedaluwarsa.' });
        }

        // Perbarui status isEmailVerified
        await prisma.user.update({
            where: { id: userVerification.userId },
            data: { isEmailVerified: true },
        });

        // Hapus data verifikasi setelah email diverifikasi
        await prisma.userVerification.delete({
            where: { id: userVerification.id },
        });

        return res.status(200).json({ message: 'Email berhasil diverifikasi.' });
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memverifikasi email.' });
    }
};
