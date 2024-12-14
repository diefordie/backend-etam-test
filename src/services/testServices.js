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

export const getTestService = async (testId) => {     
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


export const getTestResult = async (resultId) => {
  try {
    // Dapatkan hasil tes berdasarkan resultId
    const latestTestResult = await prisma.result.findUnique({
      where: { id: resultId },
      select: {
        score: true,
        createdAt: true, // Tambahkan ini untuk mengambil createdAt
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
              },
            },
          },
        },
        detail_result: {
          select: {
            option: {
              select: {
                isCorrect: true,
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

    return {
      score: latestTestResult.score,
      userName: latestTestResult.user.name,
      testId: latestTestResult.test.id,
      testTitle: latestTestResult.test.title,
      correctAnswers,
      wrongAnswers,
      createdAt: latestTestResult.createdAt, // Tambahkan ini ke output
    };
  } catch (error) {
    console.error('Error fetching test result:', error);
    throw new Error('Failed to fetch test result');
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

const getAllTestsService = async () => {
    return await prisma.test.findMany({
        select: {
            title: true,
            similarity: true
        }
    });
};

const getTestsByCategory = async (category) => {
    return await prisma.test.findMany({
        where: { category },
    });
};

const getTestDetailsService = async (testId) => {
  try {
    const testDetails = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        testDescription: true,
        authorId: true,
        isPublished: true,
        price: true,     
        similarity: true  
      },
    });

    if (!testDetails) {
      throw new Error('Test not found');
    }

    return testDetails;
  } catch (error) {
    console.error('Error in getTestDetailsService:', error);
    throw error;
  }
};

export const getAuthorTestsService = async (userId) => {
  try {
    console.log("Received userId:", userId);  // Memastikan userId yang dikirim valid
    
    const author = await prisma.author.findFirst({
      where: { userId: userId }
    });

    // Log data author untuk melihat hasil query
    console.log('Author Data:', author);

    if (!author) {
      console.log('No author found for this user');
      throw new Error('Author not found for this user');
    }

    // Fetch tests for this author
    const test = await prisma.test.findMany({
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

    console.log('Test Data:', test);  // Log hasil query test

    // Format the data as required
    return test.map(test => ({
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


export { 
    createTestService,
    publishTestService,
    getAllTestsService,
    getTestsByCategory,
    getTestDetailsService
};