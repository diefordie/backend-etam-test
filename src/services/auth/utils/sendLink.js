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
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://firebasestorage.googleapis.com/v0/b/tes-online-ippl.appspot.com/o/logo%2FVector.svg?alt=media&token=ec408fdc-0e43-4853-b022-1fc70ba011af" alt="Logo Aplikasi">
                    </div>
                    <h1>Reset Password</h1>
                    <p>Anda telah meminta untuk mereset password Anda. Silakan klik tombol di bawah untuk mereset password:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
                    </p>
                    <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
                    <p>Terima kasih,<br>Tim Aplikasi Kami</p>
                </div>
            </body>
            </html>
        `,
    });

    console.log(`Password reset email sent to ${email}`);
};