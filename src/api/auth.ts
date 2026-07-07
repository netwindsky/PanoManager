import http from './index'
import type { LoginForm, LoginResult, ApiResponse } from '@/types'

export function login(data: LoginForm) {
  return http.post<ApiResponse<LoginResult>>('/auth/login', data)
}

export function logout() {
  return http.post<ApiResponse<null>>('/auth/logout')
}

export function getProfile() {
  return http.get<ApiResponse<LoginResult['user']>>('/users/me')
}
