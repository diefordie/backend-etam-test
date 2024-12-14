import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTopScoresService = async (testId) => {
  const topScores = await prisma.result.findMany({
    where: {
      testId: testId,
    },
    select: {
      id: true,
      score: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { userId: 'asc' },
      { score: 'desc' }
    ]
  });

  // Filter to keep only the highest score per user
  const uniqueTopScores = [];
  const seenUsers = new Set();

  for (const score of topScores) {
    if (!seenUsers.has(score.user.id)) {
      uniqueTopScores.push(score);
      seenUsers.add(score.user.id);
    }
  }

  // Sort unique scores by score in descending order
  uniqueTopScores.sort((a, b) => b.score - a.score);

  // Limit to top 10
  const top10UniqueScores = uniqueTopScores.slice(0, 10);

  return top10UniqueScores.map((score, index) => ({
    ranking: index + 1,
    userId: score.user.id,
    name: score.user.name,
    score: score.score,
  }));
};
