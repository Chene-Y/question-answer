import api from './index'
import type { LoginRequest, RegisterRequest, User, ApiResponse } from '@/types'

export const login = (data: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
  return api.post('/auth/login', data)
}

export const register = (data: RegisterRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
  return api.post('/auth/register', data)
}

export const getProfile = (): Promise<ApiResponse<{ user: User }>> => {
  return api.get('/auth/profile')
} 