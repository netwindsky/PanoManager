// ===== 认证相关 =====
export interface LoginForm {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

export interface UserInfo {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string
  status: UserStatus
  createdAt: string
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'
export type UserStatus = 'ACTIVE' | 'DISABLED'

// ===== 项目相关 =====
export interface Project {
  id: string
  name: string
  description: string
  coverUrl: string
  sceneCount: number
  creator: string
  status: string
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'published' | 'editing' | 'offline'

// ===== 用户管理 =====
export interface UserItem {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string
  projectCount: number
  status: UserStatus
  createdAt: string
}

// ===== 媒体资源 =====
export type MediaType = 'all' | 'panorama' | 'audio' | 'video' | 'document'

export interface MediaResource {
  id: string
  name: string
  type: string
  mimeType: string
  sizeBytes: number
  url: string
  thumbUrl: string
  projectId: string
  createdAt: string
}

// ===== LUT 资源 =====
export interface LutResource {
  id: string
  projectId: string | null
  name: string
  format: string
  fileUrl: string
  previewUrl: string | null
  lutSize: string | null
  sizeBytes: number
  uploadedBy: string
  description: string | null
  createdAt: string
}

// ===== 后期预设 =====
export interface PostProcessingPreset {
  id: string
  name: string
  presetStyle: string | null
  lutResourceId: string | null
  toneMapping: string | null
  exposure: number | null
  contrast: number | null
  saturation: number | null
  colorTemperature: number | null
  bloomStrength: number | null
  bloomThreshold: number | null
  enabled: boolean
}

// ===== 统计 =====
export interface StatItem {
  label: string
  value: string | number
  icon: string
  iconColor: string
  trend: string
  trendDirection: 'up' | 'down'
}

export interface ChartDataItem {
  label: string
  value: number
}

export interface PieDataItem {
  label: string
  value: number
  color: string
}

export interface DashboardStats {
  projectCount: number
  totalViews: number
  userCount: number
  storageUsed: number
  publishedCount: number
  draftCount: number
}

// ===== 操作日志 =====
export type LogStatus = 'success' | 'failed'

export interface LogItem {
  id: string
  createdAt: string
  userId: string
  action: string
  entityType: string
  entityId: string
  ipAddress: string
  status: string
}

// ===== 系统设置 =====
export interface SystemSettings {
  systemName: string
  logo: string
  defaultLanguage: string
  allowRegistration: boolean
  requireProjectReview: boolean
  maxUploadSize: string
  allowedFileTypes: string
  storageType: string
  storagePath: string
  accessKey: string
  secretKey: string
  bucket: string
  region: string
  sessionTimeout: number
  maxLoginAttempts: number
  enableTwoFactor: boolean
  enableEmailNotify: boolean
  enableSystemNotify: boolean
  notifyEmail: string
  smtpServer: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
}

// ===== 通用分页 =====
export interface PageParams {
  current: number
  size: number
  keyword?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

// ===== 通用 API 响应 =====
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
