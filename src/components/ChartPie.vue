<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">{{ title }}</span>
    </div>
    <div v-if="data && data.length > 0">
      <div class="pie-chart" :style="pieStyle">
        <div class="pie-inner"></div>
      </div>
      <div class="pie-legend">
        <div v-for="(item, index) in data" :key="index" class="legend-item">
          <div class="legend-dot" :style="{ background: item.color }"></div>
          <span>{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}%</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PieDataItem } from '@/types'

const props = defineProps<{
  title: string
  data: PieDataItem[]
}>()

const pieStyle = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { background: '#e5e7eb' }
  }
  let cumulative = 0
  const stops = props.data.map(item => {
    const start = cumulative
    cumulative += (item.value / 100) * 360
    return `${item.color} ${start}deg ${cumulative}deg`
  })
  return {
    background: `conic-gradient(${stops.join(', ')})`,
  }
})
</script>

<style scoped>
.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
}

.pie-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin: 20px auto;
  position: relative;
}

.pie-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: var(--bg-card);
  border-radius: 50%;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-value {
  margin-left: auto;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
  font-size: 14px;
}
</style>
