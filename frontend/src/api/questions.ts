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