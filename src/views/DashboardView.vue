<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">数据概览</h1>
      <div class="page-actions">
        <button class="btn btn-primary" @click="fetchData">🔄 刷新数据</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <StatCard
        v-for="(stat, index) in statsCards"
        :key="index"
        :icon="stat.icon"
        :icon-color="stat.iconColor"
        :value="stat.value"
        :label="stat.label"
        :trend="stat.trend"
        :trend-direction="stat.trendDirection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { getDashboardStats } from '@/api/stats'
import type { DashboardStats } from '@/types'

const loading = ref(false)

const dashboardData = ref<DashboardStats>({
  projectCount: 0,
  totalViews: 0,
  userCount: 0,
  storageUsed: 0,
  publishedCount: 0,
  draftCount: 0,
})

const statsCards = computed(() => [
  {
    icon: '📁',
    iconColor: '#3b82f6',
    value: dashboardData.value.projectCount,
    label: '项目总数',
    trend: '',
    trendDirection: 'up' as const,
  },
  {
    icon: '👁️',
    iconColor: '#10b981',
    value: dashboardData.value.totalViews,
    label: '总浏览量',
    trend: '',
    trendDirection: 'up' as const,
  },
  {
    icon: '👥',
    iconColor: '#f59e0b',
    value: dashboardData.value.userCount,
    label: '用户总数',
    trend: '',
    trendDirection: 'up' as const,
  },
  {
    icon: '✅',
    iconColor: '#8b5cf6',
    value: dashboardData.value.publishedCount,
    label: '已发布项目',
    trend: '',
    trendDirection: 'up' as const,
  },
])

async function fetchData() {
  loading.value = true
  try {
    const res = await getDashboardStats()
    dashboardData.value = res.data.data
  } catch (e) {
    // API 不可用时保持默认值，错误已由拦截器提示
    console.error('获取统计数据失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
</style>
