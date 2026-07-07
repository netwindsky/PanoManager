import http from './index'
import type { PostProcessingPreset, ApiResponse } from '@/types'

export function getPresets() {
  return http.get<ApiResponse<PostProcessingPreset[]>>('/post-processing/presets')
}
