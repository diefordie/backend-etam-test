import { createTestService, getTestService, getTestResult } from '../services/testServices.js'; // Pastikan menggunakan ekstensi .js

const createTest = async (req, res) => {
    try {
        const newTest = req.body;

        const test = await createTestService(newTest);

        res.status(201).send({
            data: test,
            message: 'Create test success',
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed to create test',
            error: error.message,
        });
    }
};

const getTest = async (req, res) => {
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

const testResultController = async (req, res) => {
    const { resultId } = req.params;
  
    try {
      const result = await getTestResult(resultId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in controller:', error);
        res.status(500).json({ message: error.message });
    }
  };
  
  

export { createTest , getTest, testResultController}; // Menggunakan named