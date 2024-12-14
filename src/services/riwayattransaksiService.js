import prisma from '../../prisma/prismaClient.js';


export const getTransactionByUserId = async (userId) => {
    try {
        // Fetch transactions for the user
        const transactions = await prisma.transaction.findMany({
            where: { userId },  // Cari transaksi berdasarkan userId
            include: {
                test: { // Mengambil informasi terkait test
                    include: {
                        author: { // Mengambil informasi penulis dari test
                            include: {
                                user: { // Mengambil data user yang terkait dengan author
                                    select: {
                                        name: true,
                                        userPhoto: true, // Mengambil userPhoto dari model User
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                paymentTime: 'desc', // Mengurutkan transaksi berdasarkan waktu pembayaran
            },
        });

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                userPhoto: true, // Foto dari user yang login
            }
        });
        

        console.log('Fetched Transactions:', transactions); // Check fetched data

        // Transform transactions with detailed status handling
        const transformedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                console.log('Transaction PaymentStatus:', transaction.paymentStatus, typeof transaction.paymentStatus);

                const [historyCount, history] = await Promise.all([
                    prisma.history.count({
                        where: {
                            testId: transaction.testId,
                        },
                    }),
                    prisma.history.findFirst({
                        where: {
                            userId: transaction.userId,
                            testId: transaction.testId,
                        },
                    }),
                ]);

                console.log('History Count:', historyCount);
                console.log('History:', history);

                // Helper to define custom status for frontend display
                const getCustomStatus = (status, hasHistory) => {
                    switch (status) {
                        case 'PENDING':
                            return 'Belum Bayar';
                        case 'PAID':
                            return hasHistory ? 'Selesai (Sudah Dikerjakan)' : 'Berhasil (Belum Dikerjakan)';
                        case 'FAILED':
                        case 'EXPIRED':
                            return 'Tidak Berhasil (Gagal atau Expired)';
                        default:
                            return 'Status Tidak Dikenali';
                    }
                };

                // Set custom status based on payment status and history
                const customStatus = getCustomStatus(transaction.paymentStatus, history);

                // Return transformed transaction with additional info
                return {
                    ...transaction,
                    customStatus,
                    historyCount,
                    userData,
                };
            })
        );

        return transformedTransactions;
    } catch (error) {
        console.error('Error fetching transaction history for user ID', userId, ':', error);
        throw new Error('Failed to retrieve transaction history. Please try again later.');
    }
};
