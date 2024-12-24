import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const sendPayout = async (bodyData, token) => {
    try {
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

        const amount = bodyData.amount;

        if (amount < 50000) {
            throw new Error('Amount harus lebih besar dari 50.000');
        }

        if (amount > author.profit) {
            throw new Error(`Saldo Anda tidak cukup. Saldo saat ini: ${author.profit}`);
        }

        const beneficiaryName = author.name;
        const beneficiaryEmail = author.user.email;
        const beneficiaryBank = bodyData.beneficiary_bank;
        const beneficiaryAccount = bodyData.beneficiary_account;
        const notes = bodyData.notes;

        const payoutData = {
            payouts: [
                {
                    beneficiary_name: beneficiaryName,
                    beneficiary_account: beneficiaryAccount,
                    beneficiary_bank: beneficiaryBank,
                    beneficiary_email: beneficiaryEmail,
                    amount: amount,
                    notes: notes,
                },
            ],
        };

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

        await prisma.author.update({
            where: { id: author.id },
            data: {
                profit: author.profit - amount,
            },
        });

        const referenceNo = response.data.payouts[0].reference_no;
        const amounts = parseInt(amount, 10)

        await prisma.withdrawal.create({
            data: {
                authorId: author.id,
                amount: amounts,
                bankCode: beneficiaryBank,
                accountNumber: beneficiaryAccount,
                accountName: beneficiaryName,
                reference: referenceNo,
                notes: notes,
            },
        });

        return response.data;
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

      console.log("hasil: ", transactions);
  
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transaction history');
    }
  };