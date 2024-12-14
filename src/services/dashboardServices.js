import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper function to get test details with access count and author details
const getTestDetailsWithAccessCountAndAuthor = async (testIds) => {
  const tests = await prisma.test.findMany({
    where: {
      id: { in: testIds },
    },
    include: {
      history: true, // Include history to get access counts
      author: {
        select: {
          name: true,
          authorPhoto: true,
        },
      },
    },
  });

  // Mapping to include access count and format author details
  const testsWithDetails = tests.map(test => ({
    ...test,
    accessCount: test.history.length, // Number of times this test has been accessed
    author: {
      name: test.author.name,
      foto: test.author.authorPhoto,
    },
  }));

  return testsWithDetails;
};

// Get 5 most popular tests based on history
export const getPopularTests = async () => {
  const popularTests = await prisma.history.groupBy({
    by: ['testId'],
    _count: {
      testId: true,
    },
    orderBy: {
      _count: {
        testId: 'desc',
      },
    },
    take: 5,
  });

  const testIds = popularTests.map((test) => test.testId);
  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Get 5 free tests (price 0)
export const getFreeTests = async () => {
  return await prisma.test.findMany({
    where: { price: 0 },
    include: {
      history: true,
      author: {
        select: {
          name: true,
          authorPhoto: true,
        },
      },
    },
    take: 5,
  });
};

// Search tests by title
export const searchTestsByTitle = async (title) => {
  const tests = await prisma.test.findMany({
    where: {
      title: { contains: title, mode: 'insensitive' },
    },
    include: {
      history: true, // Include history to get access counts
      author: {
        select: {
          name: true,
          authorPhoto: true,
        },
      },
    },
  });

  // Mapping to include access count and format author details
  const testsWithDetails = tests.map(test => ({
    ...test,
    accessCount: test.history.length, // Number of times this test has been accessed
    author: {
      name: test.author.name,
      foto: test.author.authorPhoto,
    },
  }));

  return testsWithDetails;
};

// Get tests by category
export const getTestsByCategory = async (category) => {
  return await prisma.test.findMany({
    where: { category },
    include: {
      history: true,
      author: {
        select: {
          name: true,
          authorPhoto: true,
        },
      },
    },
  });
};

// Get 5 most popular tests within a category
export const getPopularTestsByCategory = async (category) => {
  const popularTests = await prisma.history.groupBy({
    by: ['testId'],
    _count: {
      testId: true,
    },
    where: {
      test: { category: category },
    },
    orderBy: {
      _count: { testId: 'desc' },
    },
    take: 5,
  });

  const testIds = popularTests.map((test) => test.testId);
  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Get 5 free tests within a category
export const getFreeTestsByCategory = async (category) => {
  return await prisma.test.findMany({
    where: { category, price: 0 },
    include: {
      history: true,
      author: {
        select: {
          name: true,
          authorPhoto: true,
        },
      },
    },
    take: 5,
  });
};
