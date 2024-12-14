// src/routes/authorRoutes.js
import express from "express";
import { createAuthor, editAuthor, getAuthor, editVerifiedAuthor } from "../controllers/authorControllers.js";

const router = express.Router();

router.post('/create-author', createAuthor);
router.put('/edit-author/:id', editAuthor);
router.patch('/edit-author/:id/status', editVerifiedAuthor);
router.get('/get-author', getAuthor);

export default router;
