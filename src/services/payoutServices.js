import axios from 'axios';

/**
 * Service to send a payout request to Midtrans
 * @param {Object} payload - Payout data to send
 * @returns {Promise<Object>} - Midtrans API response
 */
export const sendPayoutToMidtrans = async (payload) => {
    try {
      const BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1/payouts';
      const MIDTRANS_SERVER_KEY = 'IRIS-570e43c8-d69f-4e48-9fcb-527c5850b7a2';
  
      // Example payload structure
      const data = {
        payouts: payload.payouts.map((payout) => ({
          beneficiary_name: payout.beneficiary_name, 
          beneficiary_account: payout.beneficiary_account,  
          beneficiary_bank: payout.beneficiary_bank,  
          beneficiary_email: payout.beneficiary_email, 
          amount: payout.amount, 
          notes: payout.notes,  
        })),
      };
  
      // Configure the request headers
      const headers = {
        'Content-Type': 'application/json', // untuk jenis data yang dikirim
        'Authorization': `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`, // untuk otorisasi
        'Accept': 'application/json' // menambahkan header Accept untuk tipe respons JSON
      };
  
      console.log('Sending request to:', BASE_URL);
      console.log('Payload:', JSON.stringify(data, null, 2));
      console.log('Headers:', headers);
  
      // Send POST request to Midtrans
      const response = await axios.post(BASE_URL, data, { headers });
  
      console.log('Response from Midtrans:', response.data);
  
      return response.data;
    } catch (error) {
      // Handle errors from the Midtrans API
      console.error('Error sending payout to Midtrans:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to send payout to Midtrans');
    }
  };
  