import { Request, Response } from 'express';
import pool from '../config/database';
import { SubmitAnswerRequest } from '../types';

export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question_id, answer }: SubmitAnswerRequest = req.body;
    const studentId = (req as any).user.id;

    // Check if question exists and is active
    const [questions] = await pool.execute(
      'SELECT * FROM questions WHERE id = ? AND is_active = true',
      [question_id]
    );

    const question = (questions as any[])[0];

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    // Check if student already answered this question
    const [existingAnswers] = await pool.execute(
      'SELECT id FROM student_answers WHERE student_id = ? AND question_id = ?',
      [studentId, question_id]
    );

    if ((existingAnswers as any[]).length > 0) {
      res.status(400).json({ message: 'You have already answered this question' });
      return;
    }

    // Calculate score and correctness
    let isCorrect = false;
    let score = 0;

    if (question.correct_answer) {
      isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
      score = isCorrect ? question.points : 0;
    }

    // Insert answer
    await pool.execute(
      `INSERT INTO student_answers (
        student_id, question_id, answer, is_correct, score
      ) VALUES (?, ?, ?, ?, ?)`,
      [studentId, question_id, answer, isCorrect, score]
    );

    res.status(201).json({
      message: 'Answer submitted successfully',
      isCorrect,
      score,
      totalPoints: question.points
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let query = `
      SELECT sa.*, q.title, q.content, q.question_type, q.points, u.username as student_name
      FROM student_answers sa
      JOIN questions q ON sa.question_id = q.id
      JOIN users u ON sa.student_id = u.id
    `;
    const params: any[] = [];

    // Teachers can see all answers, students see only their own
    if (userRole === 'student') {
      query += ' WHERE sa.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY sa.submitted_at DESC';

    const [answers] = await pool.execute(query, params);

    res.json({ answers });
  } catch (error) {
    console.error('Get student answers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;

    // Get total questions answered
    const [totalAnswered] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_answers WHERE student_id = ?',
      [studentId]
    );

    // Get correct answers
    const [correctAnswers] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_answers WHERE student_id = ? AND is_correct = true',
      [studentId]
    );

    // Get total score
    const [totalScore] = await pool.execute(
      'SELECT SUM(score) as total FROM student_answers WHERE student_id = ?',
      [studentId]
    );

    // Get total possible score
    const [totalPossible] = await pool.execute(
      `SELECT SUM(q.points) as total 
       FROM student_answers sa 
       JOIN questions q ON sa.question_id = q.id 
       WHERE sa.student_id = ?`,
      [studentId]
    );

    const stats = {
      totalAnswered: (totalAnswered as any[])[0].count,
      correctAnswers: (correctAnswers as any[])[0].count,
      totalScore: (totalScore as any[])[0].total || 0,
      totalPossible: (totalPossible as any[])[0].total || 0,
      accuracy: 0,
      percentage: 0
    };

    if (stats.totalAnswered > 0) {
      stats.accuracy = (stats.correctAnswers / stats.totalAnswered) * 100;
    }

    if (stats.totalPossible > 0) {
      stats.percentage = (stats.totalScore / stats.totalPossible) * 100;
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuestionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const userRole = (req as any).user.role;

    if (userRole !== 'teacher') {
      res.status(403).json({ message: 'Only teachers can view question statistics' });
      return;
    }

    // Get question details
    const [questions] = await pool.execute(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    const question = (questions as any[])[0];

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    // Get answer statistics
    const [answerStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_answers,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_answers,
        AVG(score) as average_score,
        MIN(score) as min_score,
        MAX(score) as max_score
       FROM student_answers 
       WHERE question_id = ?`,
      [questionId]
    );

    const stats = (answerStats as any[])[0];

    res.json({
      question,
      stats: {
        totalAnswers: stats.total_answers,
        correctAnswers: stats.correct_answers,
        averageScore: parseFloat(stats.average_score) || 0,
        minScore: stats.min_score || 0,
        maxScore: stats.max_score || 0,
        accuracy: stats.total_answers > 0 ? (stats.correct_answers / stats.total_answers) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitBatchAnswers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { answers, session_id } = req.body; // answers: [{question_id, answer}]
    const studentId = (req as any).user.id;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }
    let totalScore = 0;
    let totalPoints = 0;
    const results: any[] = [];
    for (const item of answers) {
      const { question_id, answer } = item;
      // 查题目
      const [questions] = await pool.query('SELECT * FROM questions WHERE id = ? AND is_active = true', [question_id]);
      const question = (questions as any[])[0];
      if (!question) {
        results.push({ question_id, correct: false, score: 0, error: '题目不存在' });
        continue;
      }
      // 查是否已答过
      const [existing] = await pool.query('SELECT id FROM student_answers WHERE student_id = ? AND question_id = ?', [studentId, question_id]);
      if ((existing as any[]).length > 0) {
        results.push({ question_id, correct: false, score: 0, error: '已答过' });
        continue;
      }
      // 判分
      let isCorrect = false;
      let score = 0;
      if (question.correct_answer) {
        isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
        score = isCorrect ? question.points : 0;
      }
      totalScore += score;
      totalPoints += question.points;
      // 入库
      await pool.execute(
        'INSERT INTO student_answers (student_id, question_id, answer, is_correct, score, session_id) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, question_id, answer, isCorrect, score, session_id || null]
      );
      results.push({ question_id, correct: isCorrect, score, points: question.points });
    }
    res.status(201).json({
      message: 'Batch answers submitted',
      totalScore,
      totalPoints,
      results
    });
  } catch (error) {
    console.error('Submit batch answers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRanking = async (req: Request, res: Response) => {
  try {
    // 可选：根据登录用户的 IP 获取前缀
    // const ipPrefix = req.ip.split('.').slice(0, 3).join('.') + '.';
    // const ipCondition = 'AND u.last_ip LIKE ?';
    // const params = [ipPrefix + '%'];

    const [rows] = await pool.query(
      `SELECT u.id, u.username, SUM(sa.score) as total_score
       FROM users u
       JOIN student_answers sa ON u.id = sa.student_id
       WHERE u.role = 'student'
       GROUP BY u.id, u.username
       ORDER BY total_score DESC
       LIMIT 100`
      // , params
    );
    res.json({ ranking: rows });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuestionAnalysis = async (req: Request, res: Response): Promise<any> => {
  try {
    const { questionId } = req.params;
    const [questions] = await pool.query('SELECT id, analysis FROM questions WHERE id = ?', [questionId]);
    const question = (questions as any[])[0];
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ questionId: question.id, analysis: question.analysis });
  } catch (error) {
    console.error('Get question analysis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 