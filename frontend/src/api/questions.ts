import api from './index'
import type { Question, CreateQuestionRequest, ApiResponse } from '@/types'

export const getQuestions = (params?: {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  difficulty?: string
  type?: string
}): Promise<ApiResponse<{ questions: Question[], total: number }>> => {
  return api.get('/questions', { params })
}

export const getQuestionById = (id: number): Promise<ApiResponse<{ question: Question }>> => {
  return api.get(`/questions/${id}`)
}

export const createQuestion = (data: CreateQuestionRequest): Promise<ApiResponse<{ questionId: number }>> => {
  return api.post('/questions', data)
}

export const updateQuestion = (id: number, data: Partial<CreateQuestionRequest>): Promise<ApiResponse> => {
  return api.put(`/questions/${id}`, data)
}

export const deleteQuestion = (id: number): Promise<ApiResponse> => {
  return api.delete(`/questions/${id}`)
}

export const getRandomQuestions = (params: { category?: string, count?: number }): Promise<ApiResponse<{ questions: Question[] }>> => {
  return api.get('/questions/random', { params })
}

export const importQuestionsExcel = (formData: FormData): Promise<ApiResponse> => {
  return api.post('/questions/import-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const generateQuestionsByAI = (data: {
  subject: string
  knowledgePoints: string
  count: number
}): Promise<ApiResponse<{ questions: Array<{
  title: string
  content: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correct_answer?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  explanation?: string
}> }>> => {
  return api.post('/questions/generate-ai', data, {
    timeout: 3000000
  })
}

export const batchCreateQuestions = (questions: CreateQuestionRequest[]): Promise<ApiResponse<{ successCount: number, failCount: number, errors?: string[] }>> => {
  return api.post('/questions/batch-create', { questions })
} 