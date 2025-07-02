import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import * as authApi from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isStudent = computed(() => user.value?.role === 'student')

  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    const { token: newToken, user: userData } = response
    token.value = newToken
    user.value = userData
    console.log(userData)
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    return response
  }

  const register = async (username: string, email: string, password: string, role: 'teacher' | 'student') => {
    const response = await authApi.register({ username, email, password, role })
    const { token: newToken, user: userData } = response
    
    token.value = newToken
    user.value = userData
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    
    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateProfile = async () => {
    if (!token.value) return
    
    try {
      const response = await authApi.getProfile()
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isTeacher,
    isStudent,
    initAuth,
    login,
    register,
    logout,
    updateProfile
  }
}) 