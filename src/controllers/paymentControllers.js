import PaymentService from '../services/paymentServices.js';

class PaymentController {
    processPayment = async (req, res) => {
        try {
            const { testId } = req.body;
    
            // Validasi jika `testId` tidak ada
            if (!testId) {
                return res.status(400).json({
                    error: 'testId is required',
                });
            }
    
            // Ambil token dari header Authorization
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    error: 'Authorization token is missing',
                });
            }
    
            // Panggil service dengan `testId` dan `token`
            const result = await PaymentService.createPaymentToken(testId, token);
    
            console.log('Payment token created:', {
                testId,
                token: result.token,
            });
    
            // Kirimkan token ke frontend
            res.status(200).json({ token: result.token });
        } catch (error) {
            console.error('Payment process error:', {
                error: error.message,
                stack: error.stack,
                testId: req.body.testId,
            });
            res.status(500).json({ error: error.message });
        }
    };

    handleWebhook = async (req, res) => {
        try {
            const notificationData = req.body;

            if (!notificationData || !notificationData.transaction_status) {
                console.error('Invalid notification data:', notificationData);
                return res.status(400).json({
                    error: 'Invalid notification data'
                });
            }

            const status = await PaymentService.processNotification(notificationData);

            console.log('Payment notification processed:', {
                orderId: notificationData.order_id,
                status: status
            });

            return res.status(200).json({
                status: 'success',
                message: 'Notification processed successfully'
            });
        } catch (error) {
            console.error('Webhook processing error:', {
                error: error.message,
                stack: error.stack,
                body: req.body
            });

            return res.status(200).json({
                status: 'error',
                message: error.message
            });
        }
    };
}

export default new PaymentController();