import MidtransClient from 'midtrans-client';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

class PaymentService {
        constructor() {
            try {
                if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
                    throw new Error('Midtrans keys are not defined in environment variables');
                }
    
                this.snap = new MidtransClient.Snap({
                    isProduction: false,
                    serverKey: process.env.MIDTRANS_SERVER_KEY,
                    clientKey: process.env.MIDTRANS_CLIENT_KEY,
                });
    
                this.core = new MidtransClient.CoreApi({
                    isProduction: false,
                    serverKey: process.env.MIDTRANS_SERVER_KEY,
                    clientKey: process.env.MIDTRANS_CLIENT_KEY
                });
            } catch (error) {
                console.error('Payment service initialization failed:', error.message);
                throw new Error(`Payment service initialization failed: ${error.message}`);
            }
        }
        async createPaymentToken(testId, token) {
            try {
                // Decode token to get userId
                console.log('Token:', token);
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decodedToken.id;
                console.log('User ID:', userId);    
    
                const test = await prisma.test.findFirst({
                    where: { id: testId }
                });
    
                if (!test) {
                    throw new Error(`Test not found with ID: ${testId}`);
                }
    
                const orderId = `${testId.slice(-6)}-${userId.slice(-6)}-${Date.now().toString().slice(-6)}`;
                const parameter = {
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: test.price,
                    },
                    callbacks: {
                        finish: 'https://d149-2001-448a-6002-6c58-dc6e-d11c-1964-d04a.ngrok-free.app/user/thanks',
                      },
                    enabled_payments: [
                        "mandiri_clicpay", "bca_clicpay", "bni_va", "bca_va",
                    ],
                };
    
                const transaction = await prisma.transaction.create({
                    data: {
                        testId,
                        userId: userId, 
                        paymentMethod: 'midtrans',
                        total: test.price,
                        paymentStatus: 'PENDING',
                        paymentId: orderId
                    }
                });
    
                const snapResponse = await this.snap.createTransaction(parameter);
                console.log('Snap response:', snapResponse);
                return snapResponse;
            } catch (error) {
                throw new Error(`Failed to create payment token: ${error.message}`);
            }
        }

        async processNotification(notification) {
            try {
                if (!notification || typeof notification !== 'object') {
                    throw new Error(`Invalid notification payload: ${JSON.stringify(notification)}`);
                }
        
                const statusResponse = await this.core.transaction.notification(notification);
        
                const {
                    transaction_status: transactionStatus,
                    fraud_status: fraudStatus,
                    order_id: orderId,
                    transaction_id: transactionId,
                    payment_type: paymentType,
                    status_message: statusMessage,
                    gross_amount: grossAmount,
                    va_numbers: vaNumbers
                } = statusResponse;

                console.log('Transaction status:', transactionStatus);
                console.log('VA Numbers:', vaNumbers);
        
                if (!orderId) {
                    throw new Error('Missing order_id in notification');
                }
        
                const transaction = await prisma.transaction.findFirst({
                    where: { paymentId: orderId },
                    include: {
                        test: {
                            include: {
                                author: true // Sertakan informasi author
                            }
                        }
                    }
                });
        
                if (!transaction) {
                    throw new Error(`Transaction not found for order ID: ${orderId}`);
                }
        
                let paymentStatus = this.determinePaymentStatus(transactionStatus, fraudStatus);
                paymentStatus = paymentStatus.toUpperCase();

                const vaNumber = vaNumbers && vaNumbers[0]?.va_number;
        
                // Update transaksi
                const updatedTransaction = await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { paymentStatus, vaNumber}
                });
        
                // Tambahkan logika pembagian keuntungan HANYA jika pembayaran berhasil
                if (paymentStatus === 'PAID') {
                    // Hitung pembagian keuntungan
                    const totalPrice = transaction.total;
                    const authorProfit = Math.floor(totalPrice * 0.7); // 70% untuk author
                    const platformProfit = totalPrice - authorProfit; // 30% untuk platform
        
                    // Update profit author
                    await prisma.author.update({
                        where: { id: transaction.test.authorId },
                        data: { 
                            profit: { increment: authorProfit }
                        }
                    });
        
                    // Opsional: Catat detail pembagian keuntungan
                    await prisma.profitDistribution.create({
                        data: {
                            transactionId: transaction.id,
                            authorId: transaction.test.authorId,
                            totalAmount: totalPrice,
                            authorProfit: authorProfit,
                            platformProfit: platformProfit
                        }
                    });
                }
        
                return paymentStatus;
            } catch (error) {
                throw error;
            }
        }

    determinePaymentStatus(transactionStatus, fraudStatus) {
        const statusMap = {
            capture: {
                challenge: 'PENDING',
                accept: 'PAID'
            },
            settlement: 'PAID',
            cancel: 'FAILED',
            deny: 'FAILED',
            expire: 'EXPIRED',
            pending: 'PENDING'
        };

        let status;
        if (transactionStatus === 'capture') {
            status = statusMap.capture[fraudStatus] || 'PENDING';
        } else {
            status = statusMap[transactionStatus];
        }

        if (!status) {
            throw new Error(`Unknown transaction status: ${transactionStatus}`);
        }

        return status;
    }
}

export default new PaymentService();