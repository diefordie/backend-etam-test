import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = express.Router();

// GET all favorite tests for a user
router.get('/', getFavorites);

// POST to add a test to favorites
router.post('/', addFavorite);

// DELETE to remove a test from favorites
router.delete('/', removeFavorite);

export default router;