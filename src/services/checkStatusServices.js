import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTransactionStatus = async (userId, testId) => {
  try {
    // Mencari transaksi berdasarkan userId dan testId
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        testId: testId,
      },
    });

    if (!transaction) {
      // Jika tidak ada transaksi ditemukan
      return { status: 'NOT_FOUND' };
    }

    return { status: transaction.paymentStatus, transaction };
  } catch (error) {
    console.error(error);
    throw new Error('Kesalahan saat memproses transaksi.');
  }
};
