import http from './index'
import type { Project, PageParams, PageResult, ApiResponse } from '@/types'

export function getProjects(params: PageParams) {
  return http.get<ApiResponse<PageResult<Project>>>('/admin/projects', { params })
}

/**
 * 获取所有项目列表（不分页，用于下拉选择）
 */
export function getAllProjects() {
  return http.get<ApiResponse<PageResult<Project>>>('/admin/projects', {
    params: { current: 1, size: 1000 }
  })
}

export function createProject(data: { name: string; description?: string }) {
  return http.post<ApiResponse<Project>>('/projects', data)
}

export function updateProject(id: string, data: { name?: string; description?: string; status?: string }) {
  return http.put<ApiResponse<Project>>(`/projects/${id}`, data)
}

export function deleteProject(id: string) {
  return http.delete<ApiResponse<null>>(`/admin/projects/${id}`)
}
