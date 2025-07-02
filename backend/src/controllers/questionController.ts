import { Request, Response } from 'express';
import pool from '../config/database';
import { CreateQuestionRequest, Question } from '../types';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionData: CreateQuestionRequest = req.body;
    const userId = (req as any).user.id;

    const [result] = await pool.execute(
      `INSERT INTO questions (
        title, content, question_type, options, correct_answer, 
        points, difficulty, category, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionData.title,
        questionData.content,
        questionData.question_type,
        questionData.options ? JSON.stringify(questionData.options) : null,
        questionData.correct_answer,
        questionData.points || 1,
        questionData.difficulty || 'medium',
        questionData.category,
        userId
      ]
    );

    const questionId = (result as any).insertId;

    res.status(201).json({
      message: 'Question created successfully',
      questionId
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, type, search, page = 1, pageSize = 10 } = req.query;
    let baseQuery = `
      FROM questions q 
      JOIN users u ON q.created_by = u.id 
      WHERE q.is_active = true
    `;
    const params: any[] = [];

    if (category) {
      baseQuery += ' AND q.category = ?';
      params.push(category);
    }
    if (difficulty) {
      baseQuery += ' AND q.difficulty = ?';
      params.push(difficulty);
    }
    if (type) {
      baseQuery += ' AND q.question_type = ?';
      params.push(type);
    }
    if (search) {
      baseQuery += ' AND (q.title LIKE ? OR q.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 统计总数
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = (countRows as any[])[0].total;

    // 分页
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;
    const dataQuery = `SELECT q.*, u.username as created_by_name, q.created_by as created_by_user_id ${baseQuery} ORDER BY q.created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, pageSizeNum, (pageNum - 1) * pageSizeNum];
    const [questions] = await pool.query(dataQuery, dataParams);

    res.json({ questions, total });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const [questions] = await pool.execute(
      `SELECT q.*, u.username as created_by_name, q.created_by as created_by_user_id 
       FROM questions q 
       JOIN users u ON q.created_by = u.id 
       WHERE q.id = ? AND q.is_active = true`,
      [id]
    );

    const question = (questions as any[])[0];

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    // For students, don't show correct answer
    if (userRole === 'student') {
      delete question.correct_answer;
    }

    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const questionData: Partial<CreateQuestionRequest> = req.body;
    const userId = (req as any).user.id;

    // Check if question exists and user owns it
    const [questions] = await pool.execute(
      'SELECT created_by FROM questions WHERE id = ?',
      [id]
    );

    const question = (questions as any[])[0];

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    if (question.created_by !== userId) {
      res.status(403).json({ message: 'Not authorized to update this question' });
      return;
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    if (questionData.title) {
      updateFields.push('title = ?');
      params.push(questionData.title);
    }

    if (questionData.content) {
      updateFields.push('content = ?');
      params.push(questionData.content);
    }

    if (questionData.question_type) {
      updateFields.push('question_type = ?');
      params.push(questionData.question_type);
    }

    if (questionData.options !== undefined) {
      updateFields.push('options = ?');
      params.push(questionData.options ? JSON.stringify(questionData.options) : null);
    }

    if (questionData.correct_answer !== undefined) {
      updateFields.push('correct_answer = ?');
      params.push(questionData.correct_answer);
    }

    if (questionData.points !== undefined) {
      updateFields.push('points = ?');
      params.push(questionData.points);
    }

    if (questionData.difficulty) {
      updateFields.push('difficulty = ?');
      params.push(questionData.difficulty);
    }

    if (questionData.category !== undefined) {
      updateFields.push('category = ?');
      params.push(questionData.category);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    params.push(id);

    await pool.execute(
      `UPDATE questions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Check if question exists and user owns it
    const [questions] = await pool.execute(
      'SELECT created_by FROM questions WHERE id = ?',
      [id]
    );

    const question = (questions as any[])[0];

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    if (question.created_by !== userId) {
      res.status(403).json({ message: '不能删除其他老师的题目' });
      return;
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE questions SET is_active = false WHERE id = ?',
      [id]
    );

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRandomQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, count } = req.query;
    const num = parseInt(count as string) || 10;
    const params: any[] = [];
    let query = `
      SELECT q.*, u.username as created_by_name, q.created_by as created_by_user_id 
      FROM questions q 
      JOIN users u ON q.created_by = u.id 
      WHERE q.is_active = true
    `;
    if (category) {
      query += ' AND q.category = ?';
      params.push(category);
    }
    query += ' ORDER BY RAND() LIMIT ?';
    params.push(num);
    const [questions] = await pool.query(query, params);
    res.json({ questions });
  } catch (error) {
    console.error('Get random questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const importExcelQuestions = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const userId = (req as any).user.id;
    let success = 0, fail = 0, errors: any[] = [];
    for (const row of data) {
      
      try {
        const keys = Object.values(row as any);
        const option = String(keys[3] || '').split('，').map((item: string) => item.trim());
        
      
        await pool.execute(
          `INSERT INTO questions (title, content, question_type, options, correct_answer, points, difficulty, category, analysis, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            keys[0],
            keys[1],
            keys[2],
            option,
            keys[4],
            keys[5],
            keys[6],
            keys[7],
            keys[8],
            userId
          ]
        );
        success++;
      } catch (err) {
        fail++;
        errors.push({ row, error: (err as Error).message });
      }
    }
    // 删除临时文件
    fs.unlinkSync(filePath);
    res.json({ message: 'Import finished', success, fail, errors });
  } catch (error) {
    console.error('Import Excel questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 