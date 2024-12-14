import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function untuk konversi detik ke jam, menit, dan detik
function convertSecondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return { hours, minutes, seconds: remainingSeconds };
}

export async function getWorktimeByTestId(testId) {
  try {
    // Ambil data worktime dari database berdasarkan testId
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { worktime: true },
    });

    // Validasi jika data worktime tidak ada atau bernilai tidak valid
    if (!test || test.worktime === null || test.worktime <= 0) {
      throw new Error('Invalid or missing worktime data');
    }

    // Konversi worktime dari menit ke detik
    const worktimeInSeconds = test.worktime * 60;

    // Ambil waktu saat ini dalam detik
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    // Waktu akhir dihitung dari waktu saat ini + worktime dalam detik
    const endTimeInSeconds = currentTimeInSeconds + worktimeInSeconds;

    // Hitung waktu tersisa dalam detik
    const remainingTimeInSeconds = endTimeInSeconds - currentTimeInSeconds;

    // Jika waktu habis, kembalikan nilai 0
    if (remainingTimeInSeconds <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }; 
    }

    // Gunakan helper function untuk konversi detik ke waktu
    return convertSecondsToTime(remainingTimeInSeconds);

  } catch (error) {
    // Menangani error dan memberikan pesan yang lebih jelas
    throw new Error(`Error fetching worktime for testId ${testId}: ${error.message}`);
  }
}
  