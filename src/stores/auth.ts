import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth'
import type { LoginForm } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'VIEWER')
  const displayName = computed(() => user.value?.name || '')

  async function login(form: LoginForm) {
    const res = await loginApi(form)
    const data = res.data.data
    token.value = data.accessToken
    user.value = data.user
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  async function fetchProfile() {
    const res = await getProfile()
    user.value = res.data.data
    localStorage.setItem('user', JSON.stringify(res.data.data))
  }

  function initFromStorage() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        user.value = null
      }
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    displayName,
    login,
    logout,
    fetchProfile,
    initFromStorage,
  }
})
