import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createTestService = async (newTest) => {
  try {
      return await prisma.test.create({
          data: {
              authorId: newTest.authorId,
              type: newTest.type,
              category: newTest.category,
              title: newTest.title,
              testDescription: newTest.testDescription,
          },
      });
  } catch (error) {
      console.error("Error saat membuat tes:", error);
      throw new Error('Gagal membuat tes');
  }
};

const publishTestService = async (testId, updateData) => {
  try {
      const updatedTest = await prisma.test.update({
          where: { id: testId },
          data: {
              ...updateData,
              isPublished: true, 
          },
      });
      return updatedTest;
  } catch (error) {
      if (error.code === 'P2025') {
          console.error('Gagal mempublish tes: Rekaman tidak ditemukan dengan ID', testId);
      } else {
          console.error('Kesalahan tidak terduga:', error);
      }
      throw error; 
  }
};

const getTestService = async (testId) => {     
  return await prisma.test.findUnique({
      where: { id: testId },
      include: {
          author: true,
          multiplechoice: {
              select: {
                  id: true,
                  pageName: true,
                  question: true,
                  number: true,
                  questionPhoto: true,
                  weight: true,
                  discussion: true,
                  option: {
                      select: {
                          id: true,
                          optionDescription: true,
                          isCorrect: true,
                          optionPhoto: true, 
                          points: true, 
                      }
                  },
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
        createdAt: true,
        user: {
          select: { name: true },
        },
        test: {
          select: {
            id: true,
            title: true,
            multiplechoice: {
              select: {
                question: true,
                pageName: true,  // Tambahkan ini untuk mendapatkan nama halaman
              },
            },
          },
        },
        detail_result: {
          select: {
            option: {
              select: {
                isCorrect: true,
                points: true,  // Tambahkan ini untuk mendapatkan poin
                multiplechoice: {
                  select: {
                    pageName: true,
                    weight: true,  // Tambahkan ini untuk mendapatkan bobot
                    isWeighted: true,  // Tambahkan ini untuk mengetahui apakah soal berbobot atau tidak
                  },
                },
              },
            },
            status: true,
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

    // Hitung pageScores
    const pageScores = {};
    latestTestResult.detail_result.forEach((detail) => {
      const pageName = detail.option.multiplechoice.pageName;
      if (detail.status === "final") {
        if (!pageScores[pageName]) {
          pageScores[pageName] = 0;
        }
        if (!detail.option.multiplechoice.isWeighted && detail.option.multiplechoice.weight) {
          // Jika soal berbobot
          pageScores[pageName] += detail.option.isCorrect ? detail.option.multiplechoice.weight : 0;
        } else if (detail.option.points !== null) {
          // Jika soal menggunakan sistem poin (seperti TKP)
          pageScores[pageName] += detail.option.points;
        }
      }
    });

    return {
      score: latestTestResult.score,
      userName: latestTestResult.user.name,
      testId: latestTestResult.test.id,
      testTitle: latestTestResult.test.title,
      correctAnswers,
      wrongAnswers,
      pageScores,
      createdAt: latestTestResult.createdAt,
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


export { createTestService, publishTestService, getTestService, getTestResult }; // Menggunakan named export
