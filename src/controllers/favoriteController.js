import { getFavoriteTests, addFavoriteTest, removeFavoriteTest } from '../services/favoriteServices.js';

// Get user's favorite tests
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieved from middleware
    const favorites = await getFavoriteTests(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorite tests:', error);  // Tambahkan ini untuk log di konsol
    res.status(500).json({ message: 'Failed to fetch favorite tests', error: error.message || error });
  }
};

// Add a test to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieved from middleware
    const { testId } = req.body;
    await addFavoriteTest(userId, testId);
    res.status(201).json({ message: 'Test added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add favorite', error });
  }
};

// Remove a test from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieved from middleware
    const { testId } = req.body;
    await removeFavoriteTest(userId, testId);
    res.status(200).json({ message: 'Test removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite', error });
  }
};

export { getFavorites, addFavorite, removeFavorite };