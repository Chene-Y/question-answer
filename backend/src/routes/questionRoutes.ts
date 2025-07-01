import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getRandomQuestions,
  importExcelQuestions
} from '../controllers/questionController';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import { createQuestionValidation } from '../utils/validation';
import multer from 'multer';
import path from 'path';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public question routes (for both teachers and students)
router.get('/', getQuestions);
router.get('/random', getRandomQuestions);
router.get('/:id', getQuestionById);

const upload = multer({ dest: path.join(__dirname, '../../../uploads/') });

// Teacher-only routes
router.post('/', requireTeacher, createQuestionValidation, createQuestion);
router.put('/:id', requireTeacher, createQuestionValidation, updateQuestion);
router.delete('/:id', requireTeacher, deleteQuestion);
router.post('/import-excel', requireTeacher, upload.single('file') as any, importExcelQuestions);

export default router; 