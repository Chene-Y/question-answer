import api from './index'
import type { SubmitAnswerRequest, StudentAnswer, StudentStats, QuestionStats, ApiResponse } from '@/types'

export const submitAnswer = (data: SubmitAnswerRequest): Promise<ApiResponse<{
  isCorrect: boolean
  score: number
  totalPoints: number
}>> => {
  return api.post('/answers/submit', data)
}

export const getStudentAnswers = (): Promise<ApiResponse<{ answers: StudentAnswer[] }>> => {
  return api.get('/answers/my-answers')
}

export const getStudentStats = (): Promise<ApiResponse<{ stats: StudentStats }>> => {
  return api.get('/answers/my-stats')
}

export const getQuestionStats = (questionId: number): Promise<ApiResponse<{
  question: any
  stats: QuestionStats
}>> => {
  return api.get(`/answers/question-stats/${questionId}`)
}

export async function getQuestionAnalysis(questionId: number | string) {
  return api.get(`/answers/analysis/${questionId}`);
}

// 批量提交答题
export async function submitBatchAnswers(data: { answers: { question_id: number, answer: string }[], session_id?: string }) {
  return api.post('/answers/submit-batch', data);
}

// 获取局域网排名
export async function getRanking(params?: { category?: string }) {
  return api.get('/answers/ranking', { params });
}

// 获取我的统计
export async function getMyStats() {
  return api.get('/answers/my-stats');
}

// 获取错题统计（按时间分组）
export async function getWrongAnswerStats() {
  return api.get('/answers/wrong-stats');
}

// 获取错题列表
export async function getWrongAnswers(params?: { page?: number, pageSize?: number }) {
  return api.get('/answers/wrong-answers', { params });
}

export async function getCategoryAnswerStats() {
  return api.get('/answers/category-stats');
}

// 调用DeepSeek AI问答
export const askDeepSeek = async (question: string, context?: any) => {
  const response = await api.post('/answers/ask-deepseek', {
    question,
    questionTitle: context?.questionTitle,
    questionContent: context?.questionContent,
    studentAnswer: context?.studentAnswer,
    correctAnswer: context?.correctAnswer,
    analysis: context?.analysis
  }, {
    timeout: 3000000
  });
  return (<any>response).answer;
};