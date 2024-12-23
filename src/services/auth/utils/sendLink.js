import nodemailer from 'nodemailer';
import adminFirebase from '../../../../firebase/firebaseAdmin.js';

import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Fungsi untuk mengirim email verifikasi
export const sendVerificationEmail = async (email, name) => {
    const firebaseAuth = adminFirebase.auth();
    const verificationLink = await firebaseAuth.generateEmailVerificationLink(email);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email, // Menggunakan email pengguna, bukan email tetap
        subject: 'Verifikasi Email Anda',
        html: `
            <h1>Selamat datang, ${name}!</h1>
            <p>Silakan klik tautan di bawah untuk memverifikasi email Anda:</p>
            <a href="${verificationLink}" target="_blank">${verificationLink}</a>
        `,
    });

    console.log(`Verification email sent to ${email}`);
};

export const sendResetPasswordEmail = async (email) => {
    const firebaseAuth = adminFirebase.auth();
    const resetLink = await firebaseAuth.generatePasswordResetLink(email);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        html: `
            <h1>Reset Password</h1>
            <p>Anda telah meminta untuk mereset password Anda. Silakan klik tautan di bawah untuk mereset password:</p>
            <a href="${resetLink}" target="_blank">Reset Password</a>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `,
    });

    console.log(`Password reset email sent to ${email}`);
};