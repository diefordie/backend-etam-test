import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTransaksiService = async (testId) => {
    return await prisma.transaction.findMany({
        where: {
            testId: testId, // Menyaring berdasarkan testId (jika perlu)
        },
        include: {
            test: {
                select: {
                    title: true, // Mengambil judul test
                },
            },
        },
    });
};

export const createTransaksiService = async (newTransaksi) => {
    return await prisma.transaction.create({
        data: {
            testId: newTransaksi.testId,
            userId: newTransaksi.userId,
            status: newTransaksi.status,
            paymentMethod: newTransaksi.paymentMethod,
            paymentProof: newTransaksi.paymentProof,
        },
    });
};