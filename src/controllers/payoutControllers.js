import { getTransactionHistoryService, sendPayout } from '../services/payoutServices.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPayout = async (req, res) => {
    try {
        const {...bodyData } = req.body;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Authorization token is missing',
            });
        }

        // Panggil service untuk mengirim payout
        const result = await sendPayout(bodyData, token);

        return res.status(200).json({
            message: 'Payout berhasil dikirim',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const getTransactionHistory = async (req, res) => {
    try {
      const userId = req.user.id; 

      const author = await prisma.author.findFirst({
        where: { userId: userId },
        select: {
          id: true,
        },
      });

      const authorId = author.id;
      console.log('Author ID:', authorId);
  
      const transactions = await getTransactionHistoryService(authorId);
  
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  };