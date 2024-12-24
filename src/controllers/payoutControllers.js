import { getTransactionHistoryService, sendPayout } from '../services/payoutServices.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPayout = async (req, res) => {
  try {
      const {
          beneficiary_name,
          beneficiary_email,
          beneficiary_bank,
          beneficiary_account,
          amount,
          notes
      } = req.body;

      // Validasi input
      if (!beneficiary_name || !beneficiary_email || !beneficiary_bank || !beneficiary_account || !amount) {
          return res.status(400).json({
              error: 'Semua field harus diisi',
          });
      }

      // Validasi amount
      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount) || parsedAmount < 50000) {
          return res.status(400).json({
              error: 'Jumlah penarikan harus berupa angka dan minimal 50.000',
          });
      }

      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          return res.status(401).json({
              error: 'Authorization token is missing',
          });
      }

      // Panggil service untuk mengirim payout
      const result = await sendPayout({
          beneficiary_name,
          beneficiary_email,
          beneficiary_bank,
          beneficiary_account,
          amount: parsedAmount,
          notes
      }, token);

      return res.status(200).json({
          message: 'Payout berhasil dikirim',
          data: result,
      });
  } catch (error) {
      console.error('Payout error:', error);
      return res.status(500).json({
          error: error.message || 'Terjadi kesalahan saat memproses payout',
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