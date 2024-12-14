import { getWorktimeByTestId } from '../services/timerServices.js';

export async function getWorktime(req, res) {
  const { testId } = req.params; // Mengambil testId dari parameter request

  try {
    const worktime = await getWorktimeByTestId(testId); // Memanggil service untuk mendapatkan waktu kerja
    res.status(200).json(worktime); // Mengembalikan waktu kerja dalam format JSON
  } catch (error) {
    res.status(400).json({ error: error.message }); // Mengembalikan pesan error jika terjadi kesalahan
  }
}
