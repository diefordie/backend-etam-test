import { createTestService, getTestsByCategory, getAllTestsService, publishTestService, getAuthorTestsService, getTestService, getTestResult } from 'backend/src/services/testServices.js';

// Buat tes
const createTestController = async (req, res, next) => {
    const { authorId, type, category, title, testDescription } = req.body;
    console.log("Data yang diterima:", req.body);

    if (!authorId || !type || !category || !title || !testDescription) {
        return res.status(400).json({
            message: 'Semua field harus diisi.' 
        });
    }

    try {
        const newTest = await createTestService({ authorId, type, category, title, testDescription });
        res.status(201).json(newTest); 
    } catch (error) {
        next(error); 
    }
};

export const getTest = async (req, res) => {
    try {
        const { id } = req.params; // Ubah testId menjadi id
        console.log('ID Test yang dicari:', id);
        const test = await getTestService(id);

        res.status(200).send({
            data: test,
            message: 'Get test success',
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed to get test',
            error: error.message,
        });
    }
};

export const testResultController = async (req, res) => {
    const { resultId } = req.params;
  
    try {
      const result = await getTestResult(resultId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in controller:', error);
        res.status(500).json({ message: error.message });
    }
  };



// Publish Tes
const publishTestController = async (req, res, next) => {
    const { testId } = req.params;
    const { price, similarity, worktime } = req.body;

    // Validasi input
    if (!price || !similarity || !worktime) {
        const error = new Error('Semua field harus diisi untuk publikasi.');
        error.status = 400; 
        return next(error);
    }

    try {
        // Mengupdate test dengan isPublished diatur menjadi true
        const updatedTest = await publishTestService(testId, { 
            price, 
            similarity, 
            worktime, 
            isPublished: true // Ganti isPublish menjadi isPublished
        });
        res.status(200).json(updatedTest); 
    } catch (error) {
        next(error);
    }
};


const getAllTests = async (req, res) => {
    try {
        const tests = await getAllTestsService();
        res.status(200).json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Failed to fetch tests', error: error.message });
    }
};

const fetchTestsByCategory = async (req, res, next) => {
    const { category } = req.params;

    try {
        const tests = await getTestsByCategory(category);
        
        if (!tests.length) {
            const error = new Error('No tests found for this category');
            error.status = 404;
            return next(error);
        }

        res.status(200).json(tests);
    } catch (error) {
        next(error); 
    }
};



export const getAuthorTests = async (req, res) => {
  try {
    const userId = req.user.id;
    const tests = await getAuthorTestsService(userId);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error: error.message });
  }
};


export {createTestController,
    publishTestController,
    getAllTests,
    fetchTestsByCategory}; 

