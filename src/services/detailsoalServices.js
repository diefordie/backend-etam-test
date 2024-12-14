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

  return {
    title: test.title,
    duration: test.worktime,
    numQuestions: test.multiplechoice.length,
  };
};

const TestService = {
  getTestDetails,
};

export default TestService;