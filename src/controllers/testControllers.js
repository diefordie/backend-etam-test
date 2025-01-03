import { createTestService, getTestService, getTestResult, getAuthorTestsService, getTestDetailById, publishTestService } from '../services/testServices.js'; // Pastikan menggunakan ekstensi .js

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

const getTest = async (req, res) => {
    const { id } = req.params; // Asumsikan ID tes dikirim sebagai parameter URL

    try {
        const test = await getTestService(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Anda bisa melakukan transformasi data di sini jika diperlukan
        const formattedTest = {
            id: test.id,
            title: test.title,
            description: test.testDescription,
            category: test.category,
            similarity: test.similarity,
            price: test.price,
            author: {
                id: test.author.id,
                name: test.author.name
            },
            questions: test.multiplechoice.map(question => ({
                id: question.id,
                pageName: question.pageName,
                questionText: question.question,
                questionNumber: question.number,
                questionPhoto: question.questionPhoto,
                weight: question.weight,
                discussion: question.discussion,
                options: question.option.map(opt => ({
                    id: opt.id,
                    description: opt.optionDescription,
                    isCorrect: opt.isCorrect,
                    optionPhoto: opt.optionPhoto,
                    points: opt.points
                }))
            }))
        };

        res.status(200).json(formattedTest);
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Internal server error' });
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

// Publish Tes
const publishTestController = async (req, res, next) => {
    const { testId } = req.params;
    const { price, similarity, worktime } = req.body;

    // Validasi input
    if (price === undefined || !similarity || !worktime) {
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
            isPublished: true 
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
    // Assuming the middleware adds the user object to the request
    const userId = req.user.id;
    const tests = await getAuthorTestsService(userId);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error: error.message });
  }
};

export const getTestDetail = async (req, res) => {
    const { testId } = req.params;

    try {
        const test = await getTestDetailById(testId); // Memanggil service untuk mendapatkan detail test

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        res.status(200).json({
            title: test.title,
            similarity: test.similarity,
            price: test.price,
        });
    } catch (error) {
        console.error("Error fetching test detail:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export { getTest, testResultController, createTestController,
    publishTestController,
    getAllTests,
    fetchTestsByCategory}; 

