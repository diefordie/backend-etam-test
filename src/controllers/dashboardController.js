import {
  getPopularTestsService,
  getFreeTestsService,
  searchTestsByTitleService,
  getTestsByCategoryService,
  getPopularTestsByCategoryService,
  getFreeTestsByCategoryService,
  getLockedTestsService,
  getLockedTestsByCategoryService
} from '../services/dashboardServices.js';

export const getPopularTests = async (req, res) => {
  try {
    const tests = await getPopularTestsService();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFreeTests = async (req, res) => {
  try {
    const tests = await getFreeTestsService();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchTestsByTitle = async (req, res) => {
  const { title } = req.query;
  try {
    const tests = await searchTestsByTitleService(title);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchTestsByTitleAndCategory = async (req, res) => {
  const { title, category } = req.query;
  try {
    const tests = await getTestsByCategoryService(category);
    const filteredTests = tests.filter(test =>
      test.title.toLowerCase().includes(title.toLowerCase())
    );
    res.status(200).json(filteredTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await getTestsByCategoryService(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPopularTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await getPopularTestsByCategoryService(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFreeTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await getFreeTestsByCategoryService(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLockedTests = async (req, res) => {
  try {
    const tests = await getLockedTestsService();
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLockedTestsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const tests = await getLockedTestsByCategoryService(category);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
