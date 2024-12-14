// src/services/authorServices.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAuthorService = async (authorData) => {
    return await prisma.author.create({
        data: {
            userId: authorData.userId,
            name: authorData.name,
            handphoneNum: authorData.handphoneNum,
            authorPhoto: authorData.authorPhoto,
            bank: authorData.bank,
            accountBank: authorData.accountBank,
            profit: authorData.profit,
            isApproved: authorData.isApproved,
        },
    });
};

export const editAuthorService = async (id, authorData) => {
    try {
        const existingAuthor = await prisma.author.findUnique({
            where: { id: id },
        });

        if (!existingAuthor) {
            throw new Error("Author not found");
        }

        const updatedAuthor = await prisma.author.update({
            where: { id: id },
            data: {
                userId: authorData.userId,
                name: authorData.name,
                handphoneNum: authorData.handphoneNum,
                authorPhoto: authorData.authorPhoto,
                bank: authorData.bank,
                accountBank: authorData.accountBank,
                profit: authorData.profit,
                isApproved: authorData.isApproved,
            },
        });

        return updatedAuthor;
    } catch (error) {
        throw new Error("Failed to update author: " + error.message);
    }
};

export const getAuthorService = async () => {
    try {
      const authors = await prisma.author.findMany({
        select: {
          id: true,           // Ambil id dari tabel Author
          name: true,         // Ambil nama dari tabel Author
          isApproved: true,   // Ambil isApproved dari tabel Author
          user: {
            select: {
              createdAt: true, // Ambil createdAt dari tabel User
              email: true,     // Ambil email dari tabel User
            },
          },
        },
      });
  
      // Map data untuk menyertakan rincian yang diminta
      const result = authors.map((author) => ({
        createdAt: author.user.createdAt, // Ambil createdAt dari tabel User
        id: author.id,                    // Ambil id dari tabel Author
        name: author.name,                // Ambil nama dari tabel Author
        email: author.user.email,         // Ambil email dari tabel User
        isApproved: author.isApproved,    // Ambil isApproved dari tabel Author
      }));
  
      return result;
    } catch (error) {
      throw new Error("Failed to retrieve authors: " + error.message);
    }
  };


export const updateVerificationAuthorService = async (id, authorData) => {
    try {
        const existingAuthor = await prisma.author.findUnique({
            where: { id: id },
        });

        if (!existingAuthor) {
            throw new Error("Author not found");
        }

        const updatedAuthor = await prisma.author.update({
            where: { id: id },
            data: {
                isApproved: authorData.isApproved,
            },
        });

        const updatedUser = await prisma.user.update({
            where: { id: existingAuthor.userId },
            data: {
                isApproved: authorData.isApproved,
            },
        });

        console.log('Author updated: ', updatedAuthor);
        console.log('User updated: ', updatedUser);

        return updatedAuthor;
    } catch (error) {
        console.error("Error in updateVerificationAuthorService: ", error);
        throw new Error("Failed to update verification author: " + error.message);
    }
};