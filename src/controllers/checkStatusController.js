import { getTransactionStatus } from '../services/checkStatusServices.js';

export const checkTransactionStatus = async (req, res) => {
  const userId = req.user.id; // Mendapatkan user ID dari middleware autentikasi
  const { testId } = req.query; // Mendapatkan test ID dari query parameter

  try {
    const { status, transaction } = await getTransactionStatus(userId, testId);

    // Kembalikan status transaksi ke frontend
    return res.status(200).json({
      status,
      transaction, // jika perlu, tambahkan informasi transaksi lain
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Kesalahan internal server.' });
  }
};
