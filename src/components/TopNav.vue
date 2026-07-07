<template>
  <nav class="top-nav">
    <div class="nav-left">
      <router-link to="/dashboard" class="logo">
        <div class="logo-icon">&#9881;</div>
        <span>PanoManager</span>
      </router-link>
      <div class="nav-links">
        <a href="http://localhost:5001/" class="nav-link" target="_blank">查看器</a>
        <a href="http://localhost:5002/editor" class="nav-link" target="_blank">编辑器</a>
        <router-link to="/dashboard" class="nav-link" :class="{ active: $route.path !== '/login' }">
          后台管理
        </router-link>
      </div>
    </div>
    <div class="nav-right">
      <button class="notification-btn" @click="$emit('notify')">
        &#128276;
        <span class="notification-badge"></span>
      </button>
      <UserMenu />
    </div>
  </nav>
</template>

<script setup lang="ts">
import UserMenu from './UserMenu.vue'

defineEmits<{
  notify: []
}>()
</script>

<style scoped>
.top-nav {
  height: 56px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--accent);
  color: white;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 18px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
}
</style>
