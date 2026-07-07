<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">{{ title }}</span>
      <div v-if="periods && periods.length" class="chart-period">
        <button
          v-for="p in periods"
          :key="p"
          class="period-btn"
          :class="{ active: activePeriod === p }"
          @click="$emit('periodChange', p); activePeriod = p"
        >
          {{ p }}天
        </button>
      </div>
    </div>
    <div class="chart-body">
      <template v-if="data && data.length > 0">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="chart-bar"
          :style="{ height: getMaxHeight(item.value) + '%' }"
        >
          <span class="chart-bar-label">{{ item.label }}</span>
        </div>
      </template>
      <div v-else class="empty-state">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChartDataItem } from '@/types'

const props = defineProps<{
  title: string
  data: ChartDataItem[]
  periods?: number[]
}>()

defineEmits<{
  periodChange: [period: number]
}>()

const activePeriod = ref(props.periods?.[1] || 30)

function getMaxHeight(value: number): number {
  if (!props.data || props.data.length === 0) return 5
  const maxVal = Math.max(...props.data.map(d => d.value), 1)
  return Math.max((value / maxVal) * 90, 5)
}
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

.chart-period {
  display: flex;
  gap: 4px;
}

.period-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover, .period-btn.active {
  background: var(--accent);
  color: white;
}

.chart-body {
  height: 240px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, var(--accent), var(--accent-light));
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s;
  position: relative;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

.empty-state {
  width: 100%;
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
  font-size: 14px;
}
</style>
