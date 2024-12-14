import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getTestDetails = async (testId) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { multiplechoice: true },
  });

  if (!test) {
    throw new Error('Test not found');
  }

  // Kelompokkan pertanyaan berdasarkan pageName dan hitung jumlah soal per pageName
  const groupedQuestions = test.multiplechoice.reduce((acc, question) => {
    if (!acc[question.pageName]) {
      acc[question.pageName] = {
        questions: [],
        count: 0, // Inisialisasi jumlah soal untuk pageName ini
      };
    }
    acc[question.pageName].questions.push(question);
    acc[question.pageName].count += 1; // Tambah jumlah soal untuk pageName ini
    return acc;
  }, {});

  return {
    title: test.title,
    description: test.testDescription,
    price: test.price,
    duration: test.worktime,
    groupedQuestions,
  };
};

const TestService = {
  getTestDetails,
};

export default TestService;
