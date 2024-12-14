import { getAllTestimoni, createTestimoni } from '../services/testimoniService.js';

// Get all testimoni
export const getTestimonis = async (req, res) => {
  try {
    const testimonis = await getAllTestimoni();
    res.status(200).json(testimonis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonies', error: error.message });
  }
};

// Post new testimoni
export const createTestimoniController = async (req, res) => {
  const { comment } = req.body;
  const userId = req.user.id; // Dapatkan userId dari middleware

  try {
    const newTestimoni = await createTestimoni(userId, comment);
    res.status(201).json(newTestimoni);
  } catch (error) {
    res.status(500).json({ message: 'Error creating testimony', error: error.message });
  }
};