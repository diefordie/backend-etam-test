import { createMultipleChoiceService, getMultipleChoiceService } from '../services/multiplechoiceSevice.js';

const createMultipleChoice = async (req, res) => {
    try {
        const { testId, questions } = req.body;

        // Pastikan testId dan questions dikirimkan
        if (!testId || !questions) {
            return res.status(400).send({
                message: 'testId and questions are required',
            });
        }

        // Panggil service untuk membuat soal beserta opsi
        const multipleChoices = await createMultipleChoiceService(testId, questions);

        res.status(201).send({
            data: multipleChoices,
            message: 'Multiple choice questions created successfully',
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed to create multiple choice questions',
            error: error.message,
        });
    }
};


const getMultipleChoice = async (req, res) => {
    try {
        const { id } = req.params; // Mengambil testId dari parameter URL
        console.log('Test ID yang dicari:', id);

        // Memanggil service untuk mendapatkan pilihan ganda berdasarkan testId
        const multipleChoices = await getMultipleChoiceService(id);

        // Mengembalikan respons sukses
        res.status(200).send({
            data: multipleChoices,
            message: 'Get multiple choice success',
        });
    } catch (error) {
        console.error('Error fetching multiple choices:', error);
        // Mengembalikan respons gagal
        res.status(500).send({
            message: 'Failed to get multiple choice',
            error: error.message,
        });
    }
};

export { createMultipleChoice, getMultipleChoice }; // Menggunakan named export



// const { createMultipleChoiceService } = require("backend/src/services/multiplechoiceSevice.js");

// const createMultipleChoice = async (req, res) => {
//     try {
//         const { testId, questions } = req.body;

//         // Pastikan testId dan questions dikirimkan
//         if (!testId || !questions) {
//             return res.status(400).send({
//                 message: "testId and questions are required",
//             });
//         }

//         // Panggil service untuk membuat soal beserta opsi
//         const multipleChoices = await createMultipleChoiceService(testId, questions);

//         res.status(201).send({
//             data: multipleChoices,
//             message: "Multiple choice questions created successfully",
//         });
//     } catch (error) {
//         res.status(500).send({
//             message: "Failed to create multiple choice questions",
//             error: error.message,
//         });
//     }
// };

// module.exports = { createMultipleChoice };