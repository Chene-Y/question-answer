export interface User {
  id: number
  username: string
  email: string
  role: 'teacher' | 'student'
  created_at: string
  updated_at: string
}

export interface Question {
  id: number
  title: string
  content: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correct_answer?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  created_by: number
  created_by_name?: string
  created_by_user_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentAnswer {
  id: number
  student_id: number
  question_id: number
  answer: string
  is_correct?: boolean
  score?: number
  submitted_at: string
  title?: string
  content?: string
  question_type?: string
  points?: number
  student_name?: string
}

export interface CreateQuestionRequest {
  title: string
  content: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correct_answer?: string
  points?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}

export interface SubmitAnswerRequest {
  question_id: number
  answer: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: 'teacher' | 'student'
}

export interface ApiResponse<T = any> {
  message?: string
  data?: T
  [key: string]: any
}

export interface StudentStats {
  totalAnswered: number
  correctAnswers: number
  totalScore: number
  totalPossible: number
  accuracy: number
  percentage: number
}

export interface QuestionStats {
  totalAnswers: number
  correctAnswers: number
  averageScore: number
  minScore: number
  maxScore: number
  accuracy: number
} 