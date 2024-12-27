import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getTestDetailsWithAccessCountAndAuthor = async (testIds) => {
  try {
    const tests = await prisma.test.findMany({
      where: {
        isPublished: true,
        id: {
          in: testIds,
        },
      },
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

    const testsWithDetails = tests.map((test) => ({
      ...test,
      accessCount: test.history.length,
      author: {
        name: test.author.name,
        authorPhoto: test.author.authorPhoto,
      },
    }));

    return testsWithDetails; 
  } catch (error) {
    console.error("Terjadi error saat mengambil detail test:", error);
    throw error;
  }
};

export const getPopularTestsService = async () => {
  try {
    const popularTests = await prisma.test.findMany({
      where: {
        isPublished: true,
      },
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

    const testsWithAccessCount = popularTests.map((test) => ({
      ...test,
      accessCount: test.history.length, 
      author: {
        name: test.author.name,
        authorPhoto: test.author.authorPhoto,
      },
    }));

    const filteredTests = testsWithAccessCount.filter((test) => test.accessCount > 0);

    filteredTests.sort((a, b) => b.accessCount - a.accessCount);

    return filteredTests;

  } catch (error) {
    throw error;
  }
};

export const getFreeTestsService = async () => {
  const freeTests = await prisma.test.findMany({
    where: {
      isPublished: true,
      price: 0,
    },
    include: {
      history: true,
    },
  });

  const testsWithAccessCount = freeTests.map((test) => ({
    ...test,
    accessCount: test.history.length,
  }));

  const testIds = testsWithAccessCount.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const getLockedTestsService = async () => {
  const lockedTests = await prisma.test.findMany({
    where: {
      isPublished: true,
      price: { gt: 0 },
    },
    include: {
      history: true,
    },
  });

  const testsWithAccessCount = lockedTests.map((test) => ({
    ...test,
    accessCount: test.history.length,
  }));

  const testIds = testsWithAccessCount.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const searchTestsByTitleService = async (title) => {
  const tests = await prisma.test.findMany({
    where: {
      isPublished: true,
      title: { contains: title, mode: "insensitive" },
    },
  });

  const testIds = tests.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const searchTestsByTitleAndCategoryService = async (title, category) => {
  const tests = await prisma.test.findMany({
    where: {
      isPublished: true,
      AND: [
        { title: { contains: title, mode: "insensitive" } },
        { category: category },
      ],
    },
  });

  const testIds = tests.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const getTestsByCategoryService = async (category) => {
  const tests = await prisma.test.findMany({
    where: {
      isPublished: true,
      category: category,
    },
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

  const testIds = tests.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const getPopularTestsByCategoryService = async (category) => {
  try {
    const popularTests = await prisma.test.findMany({
      where: {
        category: category,
        isPublished: true,
      },
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

    const testsWithAccessCount = popularTests.map((test) => ({
      ...test,
      accessCount: test.history.length, 
      author: {
        name: test.author.name,
        authorPhoto: test.author.authorPhoto,
      },
    }));

    const filteredTests = testsWithAccessCount.filter((test) => test.accessCount > 0);

    filteredTests.sort((a, b) => b.accessCount - a.accessCount);

    return filteredTests;
  } catch (error) {
    console.error("Terjadi error saat mengambil popular tests by category:", error);
    throw error; 
  }
};

export const getFreeTestsByCategoryService = async (category) => {
  const freeTests = await prisma.test.findMany({
    where: {
      isPublished: true,
      category: category,
      price: 0,
    },
    include: {
      history: true,
    },
  });

  const testsWithAccessCount = freeTests.map((test) => ({
    ...test,
    accessCount: test.history.length,
  }));

  const testIds = testsWithAccessCount.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};

export const getLockedTestsByCategoryService = async (category) => {
  const lockedTests = await prisma.test.findMany({
    where: {
      isPublished: true,
      category: category,
      price: { gt: 0 },
    },
    include: {
      history: true,
    },
  });

  const testsWithAccessCount = lockedTests.map((test) => ({
    ...test,
    accessCount: test.history.length,
  }));

  const testIds = testsWithAccessCount.map((test) => test.id);

  return await getTestDetailsWithAccessCountAndAuthor(testIds);
};
