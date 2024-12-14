import express from 'express';
import { createTest, getTest, testResultController } from '../controllers/testControllers.js';

const router = express.Router();

router.post('/create-test', createTest);
router.get('/get-test/:id', getTest);
router.get('/test-result/:resultId', testResultController);

export default router; // Menggunakan default export



// const express = require("express");
// const { createTest } = require("backend/src/controllers/testControllers.js");

// const router = express.Router();

// router.post("/create-test", createTest);

// module.exports = router;