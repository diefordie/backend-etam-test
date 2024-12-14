import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createTestService = async (newTest) => {
    return await prisma.test.create({
        data: {
            authorId: newTest.authorId, 
            category: newTest.category,
            title: newTest.title,
            testDescription: newTest.testDescription,
            price: newTest.price,
            similarity: newTest.similarity,
            worktime: newTest.worktime,
            review: newTest.review,
        },
    });
};

const getTestService = async (testId) => {     
    return await prisma.test.findUnique({
            where: { id: testId },
            include: {
                author: true,
                multiplechoice: {
                    include: {
                        option: true,
                    },
                },
            },
        });
}

const getTestResult = async (resultId) => {
  try {
    // Dapatkan hasil tes berdasarkan resultId
    const latestTestResult = await prisma.result.findUnique({
      where: { id: resultId },
      select: {
        score: true,
        user: {
          select: { name: true },
        },
        test: {
          select: {
            title: true,
            multiplechoice: {
              select: {
                question: true,
              },
            },
          },
        },
        detail_result: {
          select: {
            option: {
              select: {
                isCorrect: true, // untuk mengecek apakah jawaban benar
              },
            },
            status: true, // untuk mengecek apakah statusnya final
          },
        },
      },
    });

    if (!latestTestResult) {
      throw new Error('Test result not found');
    }

    // Hitung jumlah jawaban benar dan salah
    const correctAnswers = latestTestResult.detail_result.filter(
      (detail) => detail.status === "final" && detail.option.isCorrect === true
    ).length;

    const wrongAnswers = latestTestResult.detail_result.filter(
      (detail) => detail.status === "final" && detail.option.isCorrect === false
    ).length;

    return {
      score: latestTestResult.score,
      userName: latestTestResult.user.name,
      testTitle: latestTestResult.test.title,
      correctAnswers, // jumlah jawaban benar
      wrongAnswers,   // jumlah jawaban salah
    };
  } catch (error) {
    console.error('Error fetching test result:', error);
    throw new Error('Failed to fetch test result');
  }
};



export { createTestService, getTestService, getTestResult }; // Menggunakan named export

