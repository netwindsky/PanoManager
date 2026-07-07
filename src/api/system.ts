import http from './index'
import type { ApiResponse, SystemSettings } from '@/types'

interface SystemConfigItem {
  id: string
  configKey: string
  configValue: string
  description: string
  updatedAt: string
}

export function getSettings() {
  return http.get<ApiResponse<SystemConfigItem[]>>('/system/config')
}

export function updateSetting(key: string, value: string) {
  return http.put<ApiResponse<null>>('/system/config', { key, value })
}

/**
 * 批量保存系统设置，逐个键值对调用更新接口
 */
export async function saveSettings(settings: Partial<SystemSettings>): Promise<void> {
  const booleanKeys = ['allowRegistration', 'requireProjectReview', 'enableTwoFactor', 'enableEmailNotify', 'enableSystemNotify']
  const tasks: Promise<unknown>[] = []
  
  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined || value === null) continue
    // 将布尔值和数字转换为字符串存储
    const strValue = booleanKeys.includes(key) 
      ? (value ? 'true' : 'false') 
      : String(value)
    tasks.push(updateSetting(key, strValue))
  }
  
  await Promise.all(tasks)
}
