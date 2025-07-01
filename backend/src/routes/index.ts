import { Router } from 'express';
import authRoutes from './authRoutes';
import questionRoutes from './questionRoutes';
import answerRoutes from './answerRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Question Management API is running' });
});

export default router; 