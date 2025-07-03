import { Router } from 'express';
import {
  submitAnswer,
  getStudentAnswers,
  getStudentStats,
  getQuestionStats,
  submitBatchAnswers,
  getRanking,
  getQuestionAnalysis,
  getWrongAnswerStats,
  getWrongAnswers,
  getCategoryAnswerStats,
  askDeepSeek
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

// 获取错题统计（按时间分组）
router.get('/wrong-stats', getWrongAnswerStats);

// 获取错题列表
router.get('/wrong-answers', getWrongAnswers);

// 获取分类统计
router.get('/category-stats', getCategoryAnswerStats);

// DeepSeek AI 问答
router.post('/ask-deepseek', askDeepSeek);

export default router; 