import { Router } from 'express';
import {
  submitAnswer,
  getStudentAnswers,
  getStudentStats,
  getQuestionStats,
  submitBatchAnswers,
  getRanking,
  getQuestionAnalysis
} from '../controllers/answerController';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { submitAnswerValidation } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/submit', submitAnswerValidation, submitAnswer);
router.post('/submit-batch', submitBatchAnswers);
router.get('/my-answers', getStudentAnswers);
router.get('/my-stats', getStudentStats);
router.get('/ranking', getRanking);
router.get('/analysis/:questionId', getQuestionAnalysis);

// Teacher routes
router.get('/question-stats/:questionId', requireTeacher, getQuestionStats);

export default router; 