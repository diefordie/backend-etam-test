import { body } from 'express-validator';

export const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nama tidak boleh kosong')
    .isLength({ min: 3 })
    .withMessage('Nama harus memiliki minimal 3 karakter'),
  body('email')
    .notEmpty()
    .withMessage('Email tidak boleh kosong')
    .isEmail()
    .withMessage('Email harus dalam format yang valid'),
  body('password')
    .notEmpty()
    .withMessage('Password tidak boleh kosong')
    .isLength({ min: 6 })
    .withMessage('Password harus memiliki minimal 6 karakter'),
  body('role')
    .notEmpty()
    .withMessage('Role harus dipilih'),
];
