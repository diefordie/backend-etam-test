import { body, validationResult } from 'express-validator';

// Validator khusus untuk memperbarui nama pengguna
export const validateUserName = [
    body('name').notEmpty().withMessage('Name is required'),
];

// Validator khusus untuk memperbarui email pengguna
export const validateUserEmail = [
    body('email').isEmail().withMessage('Valid email is required'),
];

// Validator khusus untuk memperbarui foto profil pengguna
export const validateUserPhoto = [
    body('userPhoto').optional().isURL().withMessage('User photo must be a valid URL'),
];

// Validator khusus untuk memperbarui kata sandi pengguna
export const validatePasswordChange = [
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// Middleware untuk memeriksa hasil validasi
export const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};