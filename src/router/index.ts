import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: '数据概览' },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { requiresAuth: true, title: '项目管理' },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true, title: '用户管理' },
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import('@/views/MediaView.vue'),
    meta: { requiresAuth: true, title: '媒体资源' },
  },
  {
    path: '/luts',
    name: 'Luts',
    component: () => import('@/views/LutView.vue'),
    meta: { requiresAuth: true, title: 'LUT 管理' },
  },
  {
    path: '/presets',
    name: 'Presets',
    component: () => import('@/views/PresetsView.vue'),
    meta: { requiresAuth: true, title: '后期预设' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, title: '系统设置' },
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/LogsView.vue'),
    meta: { requiresAuth: true, title: '操作日志' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
