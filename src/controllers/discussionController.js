// backend/src/controllers/discussionController.js
import { getDiscussionsByResultId, generateDiscussionPDF } from '../services/discussionService.js';

export const getDiscussions = async (req, res) => {
    try {
      const { resultId } = req.params;
      const discussions = await getDiscussionsByResultId(resultId);
      res.status(200).json(discussions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const downloadDiscussionPDF = async (req, res) => {
  try {
    const { resultId } = req.params;
    const doc = await generateDiscussionPDF(resultId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pembahasan-${resultId}.pdf`);

    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

