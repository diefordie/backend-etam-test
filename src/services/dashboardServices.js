// src/services/dashboardServices.js
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

export const getPopularTestsService = async () => {
  // Fetch all tests with their history (access count)
  const popularTests = await prisma.test.findMany({
    include: {
      history: true, // Include history to calculate access count
    },
  });

  // Filter out tests with accessCount 0 and sort by access count (history length) in descending order
  const sortedTests = popularTests
    .map(test => ({
      ...test,
      accessCount: test.history.length, // Count the number of accesses
    }))
    .filter(test => test.accessCount > 0) // Filter out tests with 0 access count
    .sort((a, b) => b.accessCount - a.accessCount); // Sort by access count in descending order

  const testIds = sortedTests.map(test => test.id);

  // Fetch detailed test information
  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Get all free tests (price 0) even if they have no access history
export const getFreeTestsService = async () => {
  const freeTests = await prisma.test.findMany({
    where: {
      price: 0, // Only include free tests
    },
    include: {
      history: true, // Include history to calculate access count
    },
  });

  // Set accessCount to 0 if there is no access history
  const testsWithAccessCount = freeTests.map(test => ({
    ...test,
    accessCount: test.history.length, // Access count, default to 0 if no history
  }));

  const testIds = testsWithAccessCount.map(test => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Search tests by title
export const searchTestsByTitleService = async (title) => {
  const tests = await prisma.test.findMany({
    where: {
      title: { contains: title, mode: 'insensitive' },
    },
  });

  const testIds = tests.map(test => test.id);

  // Fetch detailed test information
  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Search tests by title within a category
export const searchTestsByTitleAndCategoryService = async (title, category) => {
  const tests = await prisma.test.findMany({
    where: {
      AND: [
        { title: { contains: title, mode: 'insensitive' } },
        { category: category },
      ]
    },
  });

  const testIds = tests.map(test => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};


// Get tests by category with details (including access count and author)
export const getTestsByCategoryService = async (category) => {
  const tests = await prisma.test.findMany({
    where: { category },
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

  // Mapping to get test IDs
  const testIds = tests.map(test => test.id);

  // Fetch detailed test information including access count and author details
  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

// Get most popular tests within a category based on access count
export const getPopularTestsByCategoryService = async (category) => {
  const popularTests = await prisma.test.findMany({
    where: {
      category: category,
    },
    include: {
      history: true, // Include history to calculate access count
    },
  });

  // Filter out tests with accessCount 0 and sort by access count in descending order
  const sortedTests = popularTests
    .map(test => ({
      testId: test.id,
      accessCount: test.history.length, // Count the number of accesses
    }))
    .filter(test => test.accessCount > 0) // Filter out tests with 0 access count
    .sort((a, b) => b.accessCount - a.accessCount); // Sort by access count in descending order

  const testIds = sortedTests.map(test => test.testId);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const getFreeTestsByCategoryService = async (category) => {
  const freeTests = await prisma.test.findMany({
    where: {
      category: category,
      price: 0, // Only include free tests
    },
    include: {
      history: true, // Include history to calculate access count
    },
  });

  // Set accessCount to 0 if there is no access history
  const testsWithAccessCount = freeTests.map(test => ({
    ...test,
    accessCount: test.history.length, // Access count, default to 0 if no history
  }));

  const testIds = testsWithAccessCount.map(test => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};