// backend/src/routes/discussionRoutes.js
import express from 'express';
import { getDiscussions, downloadDiscussionPDF } from '../controllers/discussionController.js';

const router = express.Router();

router.get('/discussions/:resultId', getDiscussions);
router.get('/discussions/:resultId/download', downloadDiscussionPDF);

export default router;