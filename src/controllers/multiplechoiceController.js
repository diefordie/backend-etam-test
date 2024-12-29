import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { findPreviousQuestion, updateQuestionNumberService,  updatePageNameForQuestion, createMultipleChoiceService, updateMultipleChoiceService, getQuestionNumbersServices, updateQuestionNumberServices, getMultipleChoiceByIdService, deleteQuestionAndReorderNumbers,  fetchMultipleChoiceByNumberAndTestId, updateMultipleChoicePageNameService, getPagesByTestIdService, deletePageService, updateNumberServices } from '../services/multiplechoiceSevice.js'; 
import { Buffer } from 'buffer';
import * as multiplechoiceService from '../services/multiplechoiceSevice.js';
import { uploadFileToStorage } from '../../firebase/firebaseBucket.js';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);

// const extractBase64Images = (content) => {
//     const base64Regex = /data:image\/[^;]+;base64,([^"]+)/g;
//     const matches = content.match(base64Regex) || [];
//     return matches;
//   };
  
//   // Fungsi untuk mengganti URL gambar dalam konten
//   const replaceImageUrlInContent = (content, oldUrl, newUrl) => {
//     return content.replace(oldUrl, newUrl);
// };

const createMultipleChoice = async (req, res) => {
    try {
        const { testId, questions } = req.body;

        if (!testId || !questions) {
            return res.status(400).send({
                message: 'testId and questions are required',
            });
        }

        const uploadedQuestion = await Promise.all(
            questions.map(async (question) => {
                const questionData = { ...question };

                if (req.files && req.files[index]) {
                    const fileBuffer = req.files[index].buffer; 
                    const fileName = `questions/${Date.now()}_${req.files[index].originalname}`; 

                    const imageUrl = await uploadFileToStorage(fileBuffer, fileName);
                    questionData.questionPhoto = imageUrl; 
                }

                return questionData;
            })
        );

        const multipleChoices = await createMultipleChoiceService(testId, uploadedQuestion);

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

export { createMultipleChoice }; 

export const updateQuestionPageName = async (req, res) => {
    const { questionNumber, pageName } = req.body;
  
    if (!questionNumber || !pageName) {
      return res.status(400).json({
        success: false,
        message: 'questionNumber and pageName are required.',
      });
    }
  
    try {
      const result = await updatePageNameForQuestion(questionNumber, pageName);
  
      if (result.modifiedCount > 0) {
        res.status(200).json({
          success: true,
          message: 'Page name updated successfully for the question.',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Question not found or no changes made.',
        });
      }
    } catch (error) {
      console.error('Error updating pageName for question:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
      });
    }
};

const updateMultipleChoice = async (req, res) => {
    try {
        const { multiplechoiceId } = req.params; 
        const updatedData = req.body; 

        if (!multiplechoiceId || !updatedData) {
          return res.status(400).send({
              message: 'multiplechoiceId and updatedData are required',
          });
        }

        const updatedMultipleChoice = await updateMultipleChoiceService(multiplechoiceId, updatedData);

        res.status(200).send({
            data: updatedMultipleChoice,
            message: 'Multiple choice question updated successfully',
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed to update multiple choice question',
            error: error.message,
        });
    }
};

export { updateMultipleChoice };

const getMultipleChoiceById = async (req, res) => {
    try {
        const { id } = req.params;  
        const multipleChoice = await getMultipleChoiceByIdService(id);
        res.status(200).json(multipleChoice);
    } catch (error) {
        console.error("Error fetching multiple choice:", error.message);
        res.status(404).json({ error: error.message });
    }
};

export { getMultipleChoiceById };

export const deleteMultiplechoice = async (req, res) => {
  try {
    const { multiplechoiceId } = req.params;
    const actualMultiplechoiceId = req.body;
    await deleteQuestionAndReorderNumbers(multiplechoiceId);
    res.status(200).json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteMultiplechoice:', error);
    res.status(500).json({ message: 'Gagal menghapus soal' });
  }
};

export const updateQuestionNumberPage = async (req, res) => {
    try {
      const { testId, oldNumber } = req.params;
      const { newQuestionNumber } = req.body;
      if (!newQuestionNumber || isNaN(newQuestionNumber)) {
        return res.status(400).json({ 
          success: false, 
          message: 'New question number is required and must be a number' 
        });
      }
      const updatedQuestion = await multiplechoiceService.updateQuestionNumber(
        testId,
        parseInt(oldNumber),
        parseInt(newQuestionNumber)
      );
      return res.status(200).json({
        success: true,
        data: updatedQuestion,
        message: 'Question number updated successfully'
      });
    } catch (error) {
      console.error('Error in updateQuestionNumber controller:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error updating question number'
      });
    }
};

export const updateQuestionNumberDel = async (req, res) => {
    try {
        const { testId, oldNumber, newNumber } = req.body;
        
        // Validasi input
        if (!testId || oldNumber === undefined || newNumber === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'testId, oldNumber, dan newNumber harus diisi'
            });
        }
        const updatedQuestion = await updateQuestionNumberService(testId, oldNumber, newNumber);
        
        return res.status(200).json({
            status: 'success',
            message: 'Nomor soal berhasil diupdate',
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Error in updateQuestionNumber controller:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Terjadi kesalahan saat mengupdate nomor soal'
        });
    }
};

export const getPreviousQuestion = async (req, res) => {
  const { testId, number } = req.params;

  try {
    const question = await findPreviousQuestion(testId, number);

    if (!question) {
      return res.status(404).json({ message: 'Soal sebelumnya tidak ditemukan' });
    }

    res.json({ multiplechoiceId: question.id });
  } catch (error) {
    console.error('Error fetching previous question:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mencari soal sebelumnya' });
  }
};

const getMultipleChoiceByNumberAndTestId = async (req, res) => {
    const { testId, number, pageName } = req.params;

    try {
        const multipleChoice = await fetchMultipleChoiceByNumberAndTestId(testId, parseInt(number), pageName);

        if (!multipleChoice) {
            return res.status(404).json({ message: 'Multiplechoice not found' });
        }

        return res.json(multipleChoice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export{ getMultipleChoiceByNumberAndTestId};

const updateMultipleChoicePageNameController = async (req, res) => {
    const { testId, pageIndex, currentPageName, newPageName } = req.body;
  
    try {
      const result = await updateMultipleChoicePageNameService(testId, currentPageName, newPageName);
      res.status(200).json({ message: 'Page name updated successfully', result });
    } catch (error) {
      console.error('Error updating pageName:', error);
      res.status(500).json({ error: 'Failed to update page name' });
    }
};

export {updateMultipleChoicePageNameController};

const getPagesByTestIdController = async (req, res) => {
    try {
      const { testId } = req.query; 
  
      if (!testId) {
        return res.status(400).json({ message: 'Test ID is required' });
      }
  
      const pages = await getPagesByTestIdService(testId);
  
      if (!pages.length) {
        return res.status(404).json({ message: 'No pages found for this test ID' });
      }
  
      return res.status(200).json({ pages });
    } catch (error) {
      console.error('Error fetching pages:', error);
      return res.status(500).json({ message: 'Failed to fetch pages', error: error.message });
    }
};
  
export { getPagesByTestIdController };

const getQuestionNumbers = async (req, res) => {
    try {
      const { testId, category } = req.params;
      const questionNumbers = await getQuestionNumbersServices(testId, category);
      res.json({ questionNumbers });
    } catch (error) {
      res.status(500).json({ error: 'Error getting question numbers' });
    }
  };
  
  const updateQuestionNumber = async (req, res) => {
    try {
      const { testId } = req.params;
      const { oldNumber, newNumber } = req.body;
  
      await updateQuestionNumberServices(testId, oldNumber, newNumber);
      res.json({ message: 'Question numbers updated successfully' });
    } catch (error) {
      console.error('Error updating question numbers:', error);
      res.status(500).json({ error: 'Error updating question numbers' });
    }
  };
  
  export {
    getQuestionNumbers,
    updateQuestionNumber,
  };

export const deletePageController = async (req, res) => {
    try {
        const { testId, pageName } = req.body;

        // Validasi input
        if (!testId || !pageName) {
            return res.status(400).json({
                success: false,
                message: "testId dan pageName wajib diisi.",
            });
        }

        // Panggil service untuk menghapus halaman
        const result = await deletePageService(testId, pageName);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: "Halaman berhasil dihapus.",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan saat menghapus halaman.",
            });
        }
    } catch (error) {
        console.error('Error in deletePageController:', error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server.",
        });
    }
  };

  export const updateNumberController = async (req, res) => {
    try {
      const { testId, oldNumber, newNumber } = req.body;
  
      if (!testId || oldNumber === undefined || newNumber === undefined) {
        return res.status(400).json({
          success: false,
          message: "testId, oldNumber, dan newNumber wajib diisi.",
        });
      }
  
      await updateQuestionNumberService(testId, oldNumber, newNumber);
  
      return res.status(200).json({
        success: true,
        message: "Nomor soal berhasil diperbarui.",
      });
    } catch (error) {
      console.error('Error in updateQuestionNumberController:', error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server.",
      });
    }
  };
  