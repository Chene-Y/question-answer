import pool from '../config/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database initialization...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        // DDL 语句用 query
        await pool.query(statement);
        logger.debug(`Executed SQL statement: ${statement.substring(0, 50)}...`);
      }
    }

    // Insert sample users with proper password hashing
    await insertSampleUsers();
    
    // Insert sample questions
    await insertSampleQuestions();

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

const insertSampleUsers = async (): Promise<void> => {
  try {
    // Check if users already exist
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = (existingUsers as any[])[0].count;

    if (count > 0) {
      logger.info('Sample users already exist, skipping...');
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const sampleUsers = [
      ['teacher1', 'teacher1@example.com', passwordHash, 'teacher'],
      ['student1', 'student1@example.com', passwordHash, 'student'],
      ['student2', 'student2@example.com', passwordHash, 'student']
    ];

    for (const [username, email, hash, role] of sampleUsers) {
      await pool.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, hash, role]
      );
    }

    logger.info('Sample users inserted successfully');
  } catch (error) {
    logger.error('Failed to insert sample users:', error);
    throw error;
  }
};

const insertSampleQuestions = async (): Promise<void> => {
  try {
    // Check if questions already exist
    const [existingQuestions] = await pool.query('SELECT COUNT(*) as count FROM questions');
    const count = (existingQuestions as any[])[0].count;

    if (count > 0) {
      logger.info('Sample questions already exist, skipping...');
      return;
    }

    const sampleQuestions = [
      {
        title: 'What is 2 + 2?',
        content: 'Basic arithmetic question',
        question_type: 'multiple_choice',
        options: JSON.stringify(['3', '4', '5', '6']),
        correct_answer: '4',
        points: 1,
        difficulty: 'easy',
        category: 'Mathematics',
        created_by: 1
      },
      {
        title: 'Is the Earth round?',
        content: 'True or false question about Earth',
        question_type: 'true_false',
        options: JSON.stringify(['True', 'False']),
        correct_answer: 'True',
        points: 1,
        difficulty: 'easy',
        category: 'Science',
        created_by: 1
      },
      {
        title: 'Explain photosynthesis',
        content: 'Describe the process of photosynthesis',
        question_type: 'essay',
        options: null,
        correct_answer: null,
        points: 5,
        difficulty: 'hard',
        category: 'Biology',
        created_by: 1
      },
      {
        title: 'What is the capital of France?',
        content: 'Geography question about France',
        question_type: 'short_answer',
        options: null,
        correct_answer: 'Paris',
        points: 2,
        difficulty: 'medium',
        category: 'Geography',
        created_by: 1
      }
    ];

    for (const question of sampleQuestions) {
      await pool.execute(
        `INSERT INTO questions (
          title, content, question_type, options, correct_answer, 
          points, difficulty, category, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question.title,
          question.content,
          question.question_type,
          question.options,
          question.correct_answer,
          question.points,
          question.difficulty,
          question.category,
          question.created_by
        ]
      );
    }

    logger.info('Sample questions inserted successfully');
  } catch (error) {
    logger.error('Failed to insert sample questions:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    });
} 