import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const currentUser = computed(() => authStore.user)
  const isAdmin = computed(() => authStore.userRole === 'ADMIN')

  async function login(email: string, password: string) {
    await authStore.login({ email, password })
    router.push('/dashboard')
  }

  async function logout() {
    await authStore.logout()
    router.push('/login')
  }

  return {
    isLoggedIn,
    currentUser,
    isAdmin,
    login,
    logout,
  }
}
