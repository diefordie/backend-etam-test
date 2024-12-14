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
        // 2. Cari result terakhir dengan status draft berdasarkan testId dan userId
        result = await prismaClient.result.findFirst({
            where: { testId, userId, detail_result: { some: { status: 'draft' } } },
            orderBy: { attemptNumber: 'desc' },
        });

        // 3. Jika tidak ada result draft, buat result baru
        if (!result) {
            const lastAttempt = await prismaClient.result.findFirst({
                where: { testId, userId },
                orderBy: { attemptNumber: 'desc' },
            });
            const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

            result = await prismaClient.result.create({
                data: {
                    testId,
                    userId,
                    attemptNumber,
                    score: 0,
                },
            });
        }
    } catch (error) {
        console.error('Error creating or fetching result:', error.message);
        throw new Error(`Gagal membuat atau mengambil result: ${error.message}`);
    }

    // 4. Simpan atau perbarui detail jawaban
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
                // Perbarui jika sudah ada jawaban untuk optionId ini
                await prismaClient.detail_result.update({
                    where: { id: existingDetail.id },
                    data: {
                        userAnswer: answer.selectedOption,
                        status: 'draft',
                    },
                });
            } else {
                // Buat baru jika belum ada jawaban untuk optionId ini
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
export const submitFinalAnswers = async (resultId, token) => {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Error saat memverifikasi token:', error);
        throw new Error('Token tidak valid atau sudah kadaluarsa');
    }

    const userId = decodedToken.id;

    try {
        console.log(`Processing submit for resultId: ${resultId}, userId: ${userId}`);

        // 1. Ambil entri result berdasarkan resultId
        const existingResult = await prismaClient.result.findUnique({
            where: { id: resultId },
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
            console.warn(`Tidak ada result ditemukan untuk resultId: ${resultId}, userId: ${userId}`);
            throw new Error('Tidak ada result yang ditemukan.');
        }

        if (!existingResult.detail_result.length) {
            console.warn(`Tidak ada jawaban draft ditemukan untuk resultId: ${resultId}, userId: ${userId}`);
            throw new Error('Tidak ada jawaban draft yang ditemukan untuk result ini.');
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

        // 6. Tambahkan entri ke tabel History
        await prismaClient.history.create({
            data: {
                testId: existingResult.testId,
                userId,
            },
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