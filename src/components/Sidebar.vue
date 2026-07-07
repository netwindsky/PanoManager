<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">主菜单</div>
      <div class="sidebar-menu">
        <router-link
          v-for="item in mainMenu"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: $route.path === item.path }"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
        </router-link>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">资源</div>
      <div class="sidebar-menu">
        <router-link
          v-for="item in resourceMenu"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: $route.path === item.path }"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">系统</div>
      <div class="sidebar-menu">
        <router-link
          v-for="item in systemMenu"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: $route.path === item.path }"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  path: string
  label: string
  icon: string
  badge?: string
}

const mainMenu = ref<MenuItem[]>([
  { path: '/dashboard', label: '数据概览', icon: '📊' },
  { path: '/projects', label: '项目管理', icon: '🗂️', badge: '3' },
  { path: '/users', label: '用户管理', icon: '👥' },
  { path: '/media', label: '媒体资源', icon: '🖼️' },
])

const resourceMenu = ref<MenuItem[]>([
  { path: '/luts', label: 'LUT 管理', icon: '🎨' },
  { path: '/presets', label: '后期预设', icon: '✨' },
])

const systemMenu = ref<MenuItem[]>([
  { path: '/settings', label: '系统设置', icon: '⚙️' },
  { path: '/logs', label: '操作日志', icon: '📋' },
])
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section {
  padding: 16px 12px;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 12px;
  margin-bottom: 8px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent);
}

.menu-icon {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.menu-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--danger);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
</style>
