import { getTransaksiService } from '../services/transaksiServices.js'; 

export const getTransaksi = async (req, res) => {
    try {
        const transaksi = await getTransaksiService();
        res.status(200).json(transaksi);
    } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ message: error.message });
    }
}