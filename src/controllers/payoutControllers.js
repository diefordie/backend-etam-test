import { sendPayoutToMidtrans } from '../services/payoutServices.js';

/**
 * Controller to handle payout creation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const createPayout = async (req, res) => {
  try {
    const payload = req.body;

    // Validate input data (you can extend this as needed)
    if (!payload.payouts || !Array.isArray(payload.payouts)) {
      return res.status(400).json({ message: 'Invalid payout data' });
    }

    // Call the service to send the payout request to Midtrans
    const midtransResponse = await sendPayoutToMidtrans(payload);

    res.status(200).json({
      message: 'Payout sent successfully',
      data: midtransResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payout', error: error.message });
  }
};
