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
            id: true, // id test
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
      testId: latestTestResult.test.id, // id test
      testTitle: latestTestResult.test.title,
      correctAnswers, // jumlah jawaban benar
      wrongAnswers,   // jumlah jawaban salah
    };
  } catch (error) {
    console.error('Error fetching test result:', error);
    throw new Error('Failed to fetch test result');
  }
};

export const getAuthorTestsService = async (userId) => {
  try {
    // Find the author associated with this userId
    const author = await prisma.author.findFirst({
      where: { userId: userId }
    });

    if (!author) {
      throw new Error('Author not found for this user');
    }

    // Fetch tests for this author
    const tests = await prisma.test.findMany({
      where: { authorId: author.id },
      select: {
        id: true,
        title: true,
        category: true,
        similarity: true,
        isPublished: true,
        price: true,
        _count: {
          select: { history: true }
        },
        author: {
          select: {
            name: true,
            authorPhoto: true,
          }
        }
      }
    });

    // Format the data as required
    return tests.map(test => ({
      id: test.id,
      judul: test.title,
      kategori: test.category,
      prediksi_kemiripan: `Prediksi kemiripan ${test.similarity}%`,
      history: test._count.history, // This is now a number
      author: test.author.name,
      isPublished: test.isPublished,
      price: test.price,
      authorProfile: test.author.authorPhoto
    }));

  } catch (error) {
    console.error('Error in getAuthorTestsService:', error);
    throw error;
  }
};

export const getTestDetailById = async (testId) => {
  try {
      const test = await prisma.test.findUnique({
          where: {
              id: testId,
          },
      });

      return test; 
  } catch (error) {
      console.error("Error fetching test detail from database:", error);
      throw new Error('Database error'); 
  }
};


export { createTestService, getTestService, getTestResult }; // Menggunakan named export
