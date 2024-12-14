import {
  getPopularTestsService, // Renaming to avoid conflict
  getFreeTestsService,
  searchTestsByTitleService,
  searchTestsByTitleAndCategoryService,
  getTestsByCategoryService,
  getPopularTestsByCategoryService,
  getFreeTestsByCategoryService
} from '../services/dashboardServices.js';

// Controller for fetching popular tests
export const getPopularTests = async (req, res) => {
  try {
    const tests = await getPopularTestsService(); // Using the renamed service function
    res.status(200).json(tests); // Send successful response with data
  } catch (error) {
    res.status(500).json({ error: error.message }); // Send error response if something goes wrong
  }
};

// Controller for fetching free tests
export const getFreeTests = async (req, res) => {
  try {
    const tests = await getFreeTestsService(); // Using renamed service
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for searching tests by title
export const searchTestsByTitle = async (req, res) => {
  const { title } = req.query; // Get the 'title' from request query
  try {
    const tests = await searchTestsByTitleService(title); // Using renamed service
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for searching tests by title within a category
export const searchTestsByTitleAndCategory = async (req, res) => {
  const { title, category } = req.query; // Get the 'title' and 'category' from request query
  try {
    // Step 1: Get all tests within the specified category
    const tests = await getTestsByCategoryService(category); 

    // Step 2: Filter the tests by title that contains the search keyword
    const filteredTests = tests.filter(test => 
      test.title.toLowerCase().includes(title.toLowerCase())
    );

    // Step 3: Return the filtered results
    res.status(200).json(filteredTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controller for fetching tests by category
export const getTestsByCategory = async (req, res) => {
  const { category } = req.query; // Get the 'category' from request query
  try {
    const tests = await getTestsByCategoryService(category); // Using renamed service
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching popular tests by category
export const getPopularTestsByCategory = async (req, res) => {
  const { category } = req.query; // Get the 'category' from request query
  try {
    const tests = await getPopularTestsByCategoryService(category); // Using renamed service
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching free tests by category
export const getFreeTestsByCategory = async (req, res) => {
  const { category } = req.query; // Get the 'category' from request query
  try {
    const tests = await getFreeTestsByCategoryService(category); // Using renamed service
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};