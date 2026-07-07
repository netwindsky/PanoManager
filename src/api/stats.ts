import http from './index'
import type { DashboardStats, ApiResponse } from '@/types'

export function getDashboardStats() {
  return http.get<ApiResponse<DashboardStats>>('/admin/stats')
}
