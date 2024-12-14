import prisma from '../../prisma/prismaClient.js'; // Pastikan ini benar
import bcrypt from 'bcrypt';

export const loginAdminServices = async ({ email, password }) => {
    const admin = await prisma.user.findUnique({ where: { email } });

    if (!admin || admin.role !== 'ADMIN') {
        throw new Error('ADMIN_NOT_FOUND');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
    }

    return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
    };
};
