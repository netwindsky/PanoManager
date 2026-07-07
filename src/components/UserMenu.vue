<template>
  <div class="user-menu" @click="showDropdown = !showDropdown">
    <div class="user-avatar">{{ avatarText }}</div>
    <div class="user-info">
      <span class="user-name">{{ displayName }}</span>
      <span class="user-role">{{ roleLabel }}</span>
    </div>
    <div v-if="showDropdown" class="dropdown" @click.stop>
      <button class="dropdown-item" @click="goProfile">个人设置</button>
      <button class="dropdown-item danger" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const showDropdown = ref(false)

const avatarText = computed(() => {
  const name = authStore.user?.name || '用'
  return name.charAt(0)
})

const displayName = computed(() => authStore.user?.name || '用户')

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    ADMIN: '超级管理员',
    EDITOR: '编辑者',
    VIEWER: '浏览者',
  }
  return roleMap[authStore.userRole] || '浏览者'
})

function goProfile() {
  showDropdown.value = false
  router.push('/settings')
}

async function handleLogout() {
  showDropdown.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  position: relative;
}

.user-menu:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  min-width: 140px;
  z-index: 1001;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-item.danger {
  color: var(--danger);
}
</style>
