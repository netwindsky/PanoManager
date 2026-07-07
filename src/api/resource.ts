import http from './index'
import type { MediaResource, ApiResponse } from '@/types'

export function getAllResources() {
  return http.get<ApiResponse<MediaResource[]>>('/resources')
}

export function getResourcesByProject(projectId: string, type?: string) {
  return http.get<ApiResponse<MediaResource[]>>(`/projects/${projectId}/resources`, {
    params: type ? { type } : {}
  })
}

export function uploadResource(projectId: string, file: File, type?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (type) {
    formData.append('type', type)
  }
  return http.post<ApiResponse<MediaResource>>(`/projects/${projectId}/resources/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteResource(id: string) {
  return http.delete<ApiResponse<null>>(`/resources/${id}`)
}
