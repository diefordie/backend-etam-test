import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();  

// Get favorite tests for a user
const getFavoriteTests = async (userId) => {
  const favoriteTests = await prisma.favourite.findMany({
    where: {
      userId,
    },
    include: {
      test: {
        include: {
          history: true,
          author: {
            select: {
              name: true,
              authorPhoto: true,
            },
          },
        },
      },
    },
  });

  return favoriteTests.map(fav => ({
    ...fav.test,
    accessCount: fav.test.history.length,
    author: {
      name: fav.test.author.name,
      foto: fav.test.author.authorPhoto,
    },
  }));
};

// Add test to favorites
const addFavoriteTest = async (userId, testId) => {
  return await prisma.favourite.create({
    data: {
      userId,
      testId,
    },
  });
};

// Remove test from favorites
const removeFavoriteTest = async (userId, testId) => {
  return await prisma.favourite.deleteMany({
    where: {
      userId,
      testId,
    },
  });
};

export { getFavoriteTests, addFavoriteTest, removeFavoriteTest };