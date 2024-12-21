// src/services/authorServices.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { uploadFileToStorage } from '../../firebase/firebaseBucket.js';
dotenv.config();
import bcrypt from 'bcrypt';
import { bucket } from '../../firebase/firebaseAdmin.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

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


export const getAuthorService = async () => {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        isApproved: true,
        handphoneNum: true,
        authorPhoto: true,
        bank: true,
        accountBank: true,
        profit: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        test: {
          where: {
            isPublished: true
          },
          select: {
            id: true
          }
        }
      },
    });

    // Map data untuk menyertakan rincian yang diminta
    const result = authors.map((author) => ({
      id: author.id,
      name: author.name,
      email: author.user.email,
      isApproved: author.isApproved,
      handphoneNum: author.handphoneNum,
      authorPhoto: author.authorPhoto,
      bank: author.bank,
      accountBank: author.accountBank,
      profit: author.profit,
      createdAt: author.user.createdAt,
      publishedTestCount: author.test.length
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

export const getAuthorByUserId = async (token) => {
    try {
        // Decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        // Find the author associated with this user ID
        const author = await prisma.author.findFirst({
            where: { userId: userId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!author) {
            throw new Error("Author not found for this user");
        }

        // Split the name into first name and last name
        const names = author.name.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' '); // Join the rest of the names together

        // Format the response
        return {
            id: author.id,
            firstName: firstName,
            lastName: lastName,
            email: author.user.email,
            handphoneNum: author.handphoneNum,
            authorPhoto: author.authorPhoto,
            bank: author.bank,
            accountBank: author.accountBank,
            profit: author.profit,
            isApproved: author.isApproved,
            createdAt: author.user.createdAt
        };
    } catch (error) {
        console.error("Error in getAuthorByUserId:", error);
        throw new Error("Failed to retrieve author: " + error.message);
    }
};





import admin from '../../firebase/firebaseAdmin.js'; // Sesuaikan path jika perlu

export const editAuthorProfileService = async (token, profileData, file) => {
  console.log('Starting editAuthorProfileService');
  try {
      console.log('Verifying token');
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const userId = decodedToken.id;
      console.log('User ID:', userId);

      console.log('Finding author');
      const author = await prisma.author.findFirst({
          where: { userId: userId },
          include: { user: true }
      });

      if (!author) {
          console.log('Author not found');
          throw new Error("Author not found for this user");
      }

      console.log('Author found:', author.id);

      const authorUpdateData = {};
      const userUpdateData = {};

      if (profileData.firstName || profileData.lastName) {
          const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
          authorUpdateData.name = fullName;
          userUpdateData.name = fullName;
      }

      // Handle file upload if a new photo is provided
      if (file) {
          console.log('Uploading new author photo');
          const fileBuffer = file.buffer;
          const filename = `author-photos/${userId}-${Date.now()}.jpg`;
          const photoUrl = await uploadFileToStorage(fileBuffer, filename);
          authorUpdateData.authorPhoto = photoUrl;
          console.log('New photo URL:', photoUrl);
      }

      // ... rest of the existing code for email and password update ...

      // Update author data
      console.log('Updating author data');
      const updatedAuthor = await prisma.author.update({
          where: { id: author.id },
          data: authorUpdateData,
      });

      // Update user data
      console.log('Updating user data');
      const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
      });

      console.log('Profile update completed');
      return {
          ...updatedAuthor,
          email: updatedUser.email,
      };
  } catch (error) {
      console.error("Error in editAuthorProfileService:", error);
      throw new Error("Failed to update profile: " + error.message);
  }
};


export const getAuthorDataService = async (token) => {
  try {
    // Decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decodedToken); 

    const userId = decodedToken.id;

    const author = await prisma.author.findFirst({
      where: { userId: userId },
      select: {
        id: true,  // Ambil id dari author
        name: true, // Ambil name dari author
      }
    });
    
    if (!author) {
      throw new Error("Author not found for this user");
    }

    const authorWithRelations = await prisma.author.findFirst({
      where: { id: author.id },
      include: {
        user: {
          select: {
            role: true,  // Ambil role dari user
          }
        },
        test: {
          include: {
            history: true,  // Sertakan history dari test
          }
        }
      }
    });

    // Calculate total tests and total participants
    const totalSoal = authorWithRelations.test.length;
    const totalPeserta = authorWithRelations.test.reduce((sum, test) => sum + test.history.length, 0);

    // Format the response
    return {
      id: authorWithRelations.id,
      nama: authorWithRelations.name,
      role: authorWithRelations.user.role,
      totalSoal: totalSoal,
      totalPeserta: totalPeserta,
    };
  } catch (error) {
    console.error("Error in getAuthorDataService:", error);
    throw new Error("Failed to retrieve author data: " + error.message);
  }
};

export const getAuthorById = async (userId) => {
  try {
    const author = await prisma.author.findFirst({
      where: { 
        userId: userId 
      },
      select: { 
        name: true,
        profit: true,
      },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    return author;
  } catch (error) {
    console.error('Error fetching author by user ID:', error);
    throw error;
  }
};
