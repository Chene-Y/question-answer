import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginRequest, RegisterRequest, User } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role }: RegisterRequest = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute<any[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(400).json({ message: 'Username or email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute<any[]>(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );

    const userId = (result as any).insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, username, email, role } as any,
      process.env.JWT_SECRET || 'fallback_secret' as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: LoginRequest = req.body;

    // Find user
    const [users] = await pool.execute<any[]>(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role } as any,
      process.env.JWT_SECRET || 'fallback_secret' as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const [users] = await pool.execute<any[]>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 