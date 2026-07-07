import http from './index'
import type { LogItem, PageParams, PageResult, ApiResponse } from '@/types'

export function getLogs(params: PageParams) {
  return http.get<ApiResponse<PageResult<LogItem>>>('/admin/logs', { params })
}
