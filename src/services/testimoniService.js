import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTestimoni = async () => {
  return prisma.testimoni.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          userPhoto: true, // Menambahkan userPhoto di sini
        },
      },
    },
  });
};

export const createTestimoni = async (userId, comment) => {
  return prisma.testimoni.create({
    data: {
      userId,
      comment,
    },
  });
};