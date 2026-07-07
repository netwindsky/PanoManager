import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

const http = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5分钟
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 JWT token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器：统一处理错误
http.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    if (data.code !== 0 && data.code !== 200) {
      const errMsg = data.message || '请求失败'
      ElMessage.error(errMsg)
      return Promise.reject(new Error(errMsg))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      ElMessage.error('登录已过期，请重新登录')
    } else {
      const errMsg = error.response?.data?.message || error.message || '网络请求失败'
      ElMessage.error(errMsg)
    }
    return Promise.reject(error)
  },
)

export default http
