import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const validateBankAccount = async (bankCode, accountNumber) => {
    try {
      const response = await axios.get(
        `https://app.sandbox.midtrans.com/iris/api/v1/account_validation?bank=${bankCode}&account=${accountNumber}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.IRIS_API_KEY}:`).toString('base64')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
  
      return {
        isValid: true,
        data: response.data
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.response?.data?.message || 'Failed to validate bank account'
      };
    }
  };
  
  export const sendPayout = async (bodyData, token) => {
    try {
      // Decode token and get user data
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const usersId = decodedToken.id;
      const author = await prisma.author.findFirst({
        where: { userId: usersId },
        include: {
          user: true,
        },
      });
  
      if (!author || !author.user) {
        throw new Error('Author atau User tidak ditemukan');
      }
  
      // Validate amount
      const amount = bodyData.amount;
      if (amount < 50000) {
        throw new Error('Amount harus lebih besar dari 50.000');
      }
      if (amount > author.profit) {
        throw new Error(`Saldo Anda tidak cukup. Saldo saat ini: ${author.profit}`);
      }
  
      // Validate bank account
      const bankValidation = await validateBankAccount(
        bodyData.beneficiary_bank,
        bodyData.beneficiary_account
      );
  
      if (!bankValidation.isValid) {
        throw new Error(`Validasi rekening bank gagal: ${bankValidation.error}`);
      }
  
      const payoutData = {
        payouts: [
          {
            beneficiary_name: author.name,
            beneficiary_account: bodyData.beneficiary_account,
            beneficiary_bank: bodyData.beneficiary_bank,
            beneficiary_email: author.user.email,
            amount: amount,
            notes: bodyData.notes,
          },
        ],
      };

      console.log("data payout: ", payoutData);
  
      // Send payout request
      const response = await axios.post(
        'https://app.sandbox.midtrans.com/iris/api/v1/payouts',
        payoutData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.IRIS_API_KEY}:`).toString('base64')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
  
      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (prisma) => {
        // Update author profit
        await prisma.author.update({
          where: { id: author.id },
          data: {
            profit: author.profit - amount,
          },
        });
  
        // Create withdrawal record
        const withdrawal = await prisma.withdrawal.create({
          data: {
            authorId: author.id,
            amount: parseInt(amount, 10),
            bankCode: bodyData.beneficiary_bank,
            accountNumber: bodyData.beneficiary_account,
            accountName: author.name,
            reference: response.data.payouts[0].reference_no,
            notes: bodyData.notes,
            status: 'queued'
          },
        });
  
        return {
          payout: response.data,
          withdrawal: withdrawal
        };
      });
  
      return {
        success: true,
        data: result.payout,
        message: 'Payout berhasil diproses'
      };
  
    } catch (error) {
      throw new Error(
        `Midtrans Payout Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

export const getTransactionHistoryService = async (authorId) => {
    try {
      const transactions = await prisma.withdrawal.findMany({
        where: {
          authorId: authorId,
        },
        select: {
          createdAt: true,
          amount: true,
          reference: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transaction history');
    }
  };

export const getPayoutStatus = async (referenceNumber) => {
  const headers = {
    'Authorization': `Basic ${Buffer.from(`${process.env.IRIS_API_KEY}:`).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const response = await axios.get(
      `https://app.sandbox.midtrans.com/iris/api/v1/payouts/${referenceNumber}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch payout status: ${error.message}`);
  }
};

export const handleFailedWithdrawal = async (referenceNumber) => {
  try {
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { reference: referenceNumber },
      include: { author: true }
    });

    if (!withdrawal || withdrawal.status === 'failed') {
      return {
        updated: false,
        message: 'No action needed: withdrawal not found or already failed'
      };
    }

    if (withdrawal.status === 'queued') {
      const updatedData = await prisma.$transaction(async (prisma) => {
        const updatedWithdrawal = await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: 'failed' }
        });

        const updatedAuthor = await prisma.author.update({
          where: { id: withdrawal.authorId },
          data: {
            profit: {
              increment: withdrawal.amount
            }
          }
        });

        return {
          withdrawal: updatedWithdrawal,
          author: updatedAuthor,
          profitReturned: true
        };
      });

      return {
        updated: true,
        data: updatedData,
        message: 'Status updated and profit returned'
      };
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: 'failed' }
    });

    return {
      updated: true,
      data: { withdrawal: updatedWithdrawal, profitReturned: false },
      message: 'Status updated, no profit return needed'
    };
  } catch (error) {
    console.error('Error handling failed withdrawal:', error);
    throw error;
  }
};