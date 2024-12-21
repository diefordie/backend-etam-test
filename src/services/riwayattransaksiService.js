import prisma from '../../prisma/prismaClient.js';

export const getTransactionByUserId = async (userId) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId }, 
            include: {
                test: {
                    include: {
                        author: {
                            include: {
                                user: { 
                                    select: {
                                        name: true,
                                        userPhoto: true, 
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                paymentTime: 'desc', 
            },
        });

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                userPhoto: true, 
            }
        });
        
        console.log('Fetched Transactions:', transactions); 

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
                console.log('Transaction VA Numbers:', transaction.vaNumbers);


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

                const customStatus = getCustomStatus(transaction.paymentStatus, history);

                return {
                    ...transaction,
                    customStatus,
                    historyCount,
                    userData,
                    vaNumber: transaction.paymentStatus === 'PENDING' ? transaction.vaNumber: null,
                };
            })
        );

        return transformedTransactions;
    } catch (error) {
        console.error('Error fetching transaction history for user ID', userId, ':', error);
        throw new Error('Failed to retrieve transaction history. Please try again later.');
    }
};
