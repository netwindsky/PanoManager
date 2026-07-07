import http from './index'
import type { UserItem, PageParams, PageResult, ApiResponse } from '@/types'

export function getUsers(params: PageParams) {
  return http.get<ApiResponse<PageResult<UserItem>>>('/admin/users', { params })
}

export function createUser(data: { name: string; password: string; email: string }) {
  return http.post<ApiResponse<UserItem>>('/auth/register', data)
}

export function updateUser(id: string, data: { name?: string; avatarUrl?: string }) {
  return http.put<ApiResponse<UserItem>>(`/users/${id}`, data)
}

export function updateCurrentUser(data: { name?: string; avatarUrl?: string }) {
  return http.put<ApiResponse<UserItem>>('/users', data)
}

export function updatePassword(oldPassword: string, newPassword: string) {
  return http.put<ApiResponse<null>>('/users/password', { oldPassword, newPassword })
}

export function updateUserRole(id: string, role: string) {
  return http.put<ApiResponse<null>>(`/admin/users/${id}/role`, { role })
}

export function updateUserStatus(id: string, status: string) {
  return http.put<ApiResponse<null>>(`/admin/users/${id}/status`, { status })
}
