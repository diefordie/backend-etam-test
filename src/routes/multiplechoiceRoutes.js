import express from 'express';
import { createMultipleChoice, getMultipleChoice } from '../controllers/multiplechoiceController.js';

const router = express.Router();

// Endpoint untuk menambah soal ke tes
router.post('/add-questions', createMultipleChoice);
router.get('/get-questions/:id', getMultipleChoice);

export default router; // Menggunakan default export





// const express = require("express");
// const { createMultipleChoice } = require("../controllers/multiplechoiceController.js");
// const router = express.Router();

// // Endpoint untuk menambah soal ke tes
// router.post("/add-questions", createMultipleChoice);

// module.exports = router;