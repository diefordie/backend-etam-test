import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Fungsi untuk menyimpan jawaban sementara sebagai draft
export const saveDraftAnswer = async (testId, token, answers) => {
    // 1. Verifikasi token JWT
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        throw new Error('Token tidak valid atau sudah kadaluarsa');
    }

    const userId = decodedToken.id;

    let result;
    try {
        // 2. Cari result berdasarkan testId dan userId yang aktif
        result = await prismaClient.result.findFirst({
            where: { testId, userId },
            orderBy: { attemptNumber: 'desc' }, // Urutkan berdasarkan attempt terbaru
        });

        if (!result) {
            // Jika tidak ada result sebelumnya, buat result baru dengan attempt pertama
            result = await prismaClient.result.create({
                data: {
                    testId,
                    userId,
                    attemptNumber: 1, // Attempt pertama
                    score: 0, // Skor awal diinisialisasi ke 0
                },
            });
        }
    } catch (error) {
        console.error('Error fetching or creating result:', error.message);
        throw new Error(`Gagal membuat atau mengambil result: ${error.message}`);
    }

    // 3. Simpan atau perbarui detail jawaban
    try {
        for (const answer of answers) {
            const existingDetail = await prismaClient.detail_result.findUnique({
                where: {
                    optionId_resultId: {
                        optionId: answer.optionId,
                        resultId: result.id,
                    },
                },
            });

            if (existingDetail) {
                // Jika sudah ada jawaban untuk optionId ini, perbarui
                await prismaClient.detail_result.update({
                    where: { id: existingDetail.id },
                    data: {
                        userAnswer: answer.selectedOption,
                        status: 'draft', // Pastikan status tetap draft
                    },
                });
            } else {
                // Jika belum ada, buat jawaban baru
                await prismaClient.detail_result.create({
                    data: {
                        optionId: answer.optionId,
                        resultId: result.id,
                        userAnswer: answer.selectedOption,
                        status: 'draft',
                    },
                });
            }
        }
    } catch (error) {
        console.error('Error saving draft answers:', error.message);
        throw new Error(`Gagal menyimpan draft jawaban: ${error.message}`);
    }

    return result.id; // Kembalikan resultId dari entri yang ditemukan atau dibuat
};


// Fungsi untuk memperbarui jawaban draft
export const updateDraftAnswer = async (resultId, oldOptionId, newOptionId, newAnswer) => {
    try {
        console.log('Updating draft answer:', { resultId, oldOptionId, newOptionId, newAnswer });

        // 1. Ambil jawaban draft berdasarkan resultId dan oldOptionId
        const existingDetail = await prismaClient.detail_result.findFirst({
            where: {
                resultId: resultId,
                optionId: oldOptionId,
            },
        });

        if (!existingDetail) {
            console.warn(`Draft answer not found for resultId: ${resultId}, oldOptionId: ${oldOptionId}`);
            throw new Error('Draft jawaban tidak ditemukan.');
        }

        // 2. Perbarui jawaban draft dengan optionId dan jawaban baru
        const updatedDetail = await prismaClient.detail_result.update({
            where: { id: existingDetail.id },
            data: {
                option: {
                    connect: { id: newOptionId }, // Hubungkan dengan opsi baru
                },
                userAnswer: newAnswer, // Update jawaban user
                status: 'draft', // Tetap berstatus draft
            },
        });

        console.log('Updated detail:', updatedDetail);

        return updatedDetail.id; // Kembalikan ID jawaban yang diperbarui
    } catch (error) {
        console.error(`Failed to update draft answer: ${error.message}`);
        throw new Error(`Gagal memperbarui draft jawaban: ${error.message}`);
    }
};




// Fungsi untuk mengirim jawaban final
export const submitFinalAnswers = async (testId, token) => {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Error saat memverifikasi token:', error);
        throw new Error('Token tidak valid atau sudah kadaluarsa');
    }

    const userId = decodedToken.id;

    try {
        console.log(`Processing submit for testId: ${testId}, userId: ${userId}`);

        // 1. Ambil entri result terbaru dengan kombinasi userId dan testId yang cocok
        const existingResult = await prismaClient.result.findFirst({
            where: { userId, testId },
            orderBy: { attemptNumber: 'desc' },
            include: {
                detail_result: {
                    where: { status: 'draft' },
                    include: {
                        option: {
                            include: { multiplechoice: { include: { option: true } } },
                        },
                    },
                },
            },
        });

        // 2. Validasi apakah result ditemukan dan memiliki jawaban draft
        if (!existingResult) {
            console.warn(`Tidak ada result ditemukan untuk testId: ${testId}, userId: ${userId}`);
            throw new Error('Tidak ada result yang ditemukan untuk tes ini.');
        }

        if (!existingResult.detail_result.length) {
            console.warn(`Tidak ada jawaban draft ditemukan untuk testId: ${testId}, userId: ${userId}`);
            throw new Error('Tidak ada jawaban draft yang ditemukan untuk tes ini.');
        }

        let totalScore = 0;

        // 3. Proses setiap jawaban untuk menghitung skor
        const processedAnswers = existingResult.detail_result.map((draft) => {
            if (!draft.option || !draft.option.multiplechoice) {
                console.error('Option atau MultipleChoice tidak ditemukan:', draft);
                throw new Error('Option atau MultipleChoice tidak ditemukan untuk jawaban ini.');
            }

            const { multiplechoice } = draft.option;
            const correctOption = multiplechoice.option.find((opt) => opt.isCorrect);

            const isCorrect = correctOption && correctOption.id === draft.optionId;
            if (isCorrect) totalScore += multiplechoice.weight;

            return {
                optionId: draft.optionId,
                userAnswer: draft.userAnswer,
                status: 'final',
                isCorrect,
            };
        });

        // 4. Ubah status semua jawaban draft menjadi final
        await prismaClient.detail_result.updateMany({
            where: {
                resultId: existingResult.id,
                status: 'draft',
            },
            data: { status: 'final' },
        });

        // 5. Update skor pada entri result terkait
        const updatedResult = await prismaClient.result.update({
            where: { id: existingResult.id },
            data: { score: totalScore },
        });

        return updatedResult;
    } catch (error) {
        console.error('Gagal memproses submit jawaban final:', error);
        throw new Error(`Gagal mengirim jawaban final: ${error.message}`);
    }
};

export const getAnswersByResultId = async (resultId) => {
    try {
        const answers = await prismaClient.detail_result.findMany({
            where: { resultId },
            include: {
                option: true,  // Including the related option details
            },
        });

        return answers;
    } catch (error) {
        console.error('Error fetching answers by result ID:', error.message);
        throw new Error(`Gagal mendapatkan jawaban untuk resultId ${resultId}: ${error.message}`);
    }
};
