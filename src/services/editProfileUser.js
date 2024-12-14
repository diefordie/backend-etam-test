import prisma from '../../prisma/prismaClient.js';
import { hashPassword, validatePassword } from "./auth/utils/hash.js";
import firebaseAdmin from '../../firebase/firebaseAdmin.js';

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        userPhoto: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

// Memperbarui nama pengguna
export const updateUserName = async (userId, name) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update name: ${error.message}`);
  }
};

// Memperbarui email pengguna
export const updateUserEmail = async (userId, email) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email is already in use by another user');
    }

    await firebaseAdmin.auth().updateUser(userId, { email });
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to update email: ${error.message}`);
  }
};

// Fungsi untuk memperbarui password
export const updateUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    console.log("Stored Hash from DB:", user.password);
    console.log("Input currentPassword:", currentPassword);

    const isMatch = validatePassword(currentPassword, user.password);
    console.log("Password Match:", isMatch); // Pastikan hasil validasi benar

    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = hashPassword(newPassword);
    const updateResults = await Promise.allSettlecd([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      firebaseAdmin.auth().updateUser(userId, { password: newPassword }),
      firebaseAdmin.firestore().collection("users").doc(userId).update({ password: hashedPassword }),
    ]);

    updateResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Error in update operation ${index + 1}:`, result.reason);
      } else {
        console.log(`Update operation ${index + 1} succeeded.`);
      }
    });

    if (updateResults.every((result) => result.status === "fulfilled")) {
      return { message: "Password updated successfully" };A
    }

    throw new Error("Some update operations failed. Check logs for details.");
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error(`Failed to update password: ${error.message}`);
  }
};

// Memperbarui foto profil pengguna
export const updateUserPhoto = async (userId, userPhotoUrl) => {
  try {
    console.log("Updating user photo for userId:", userId, "with URL:", userPhotoUrl);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { userPhoto: userPhotoUrl },
    });

    console.log("Database update successful. Updated user:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('Error updating user photo in database:', error.message);
    throw new Error(`Failed to update photo: ${error.message}`);
  }
};