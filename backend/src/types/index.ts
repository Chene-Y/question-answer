export interface User {
  id: number;
  username: string;
  email: string;
  role: 'teacher' | 'student';
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  analysis?: string;
  created_by: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StudentAnswer {
  id: number;
  student_id: number;
  question_id: number;
  answer: string;
  is_correct?: boolean;
  score?: number;
  session_id?: string;
  submitted_at: Date;
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer?: string;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  analysis?: string;
}

export interface SubmitAnswerRequest {
  question_id: number;
  answer: string;
  session_id?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
} 