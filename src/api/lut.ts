import http from './index'
import type { LutResource, ApiResponse } from '@/types'

export function getAllLuts() {
  return http.get<ApiResponse<LutResource[]>>('/public/luts')
}

export function getLutById(id: string) {
  return http.get<ApiResponse<LutResource>>(`/luts/${id}`)
}

export function deleteLut(id: string) {
  return http.delete<ApiResponse<null>>(`/luts/${id}`)
}

/**
 * 上传全局LUT文件（不绑定项目）
 */
export function uploadLut(file: File, name?: string, description?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (name) formData.append('name', name)
  if (description) formData.append('description', description)
  return http.post<ApiResponse<LutResource>>('/luts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
