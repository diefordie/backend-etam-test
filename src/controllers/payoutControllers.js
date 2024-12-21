import sendPayout from '../services/payoutServices.js';

const createPayout = async (req, res) => {
    try {
        const {...bodyData } = req.body; // Ambil authorId dan data lainnya dari body

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

export default createPayout;