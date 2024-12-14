import * as dashboardServices from '../services/dashboardServices.js';

// Get 5 most popular tests
export const getPopularTests = async (req, res) => {
  try {
    const tests = await dashboardServices.getPopularTests();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get 5 free tests
export const getFreeTests = async (req, res) => {
  try {
    const tests = await dashboardServices.getFreeTests();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search tests by title
export const searchTestsByTitle = async (req, res) => {
  const { title } = req.query;
  try {
    const tests = await dashboardServices.searchTestsByTitle(title);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tests by category
export const getTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await dashboardServices.getTestsByCategory(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get 5 most popular tests within a category
export const getPopularTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await dashboardServices.getPopularTestsByCategory(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get 5 free tests within a category
export const getFreeTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await dashboardServices.getFreeTestsByCategory(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getPopularTests,
  getFreeTests,
  searchTestsByTitle,
  getTestsByCategory,
  getPopularTestsByCategory,
  getFreeTestsByCategory,
};
