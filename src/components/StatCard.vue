<template>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-icon" :class="iconColor">{{ icon }}</div>
      <span class="stat-trend" :class="trendDirection">{{ trend }}</span>
    </div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  iconColor: string
  value: string | number
  label: string
  trend: string
  trendDirection: 'up' | 'down'
}>()
</script>

<style scoped>
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: var(--accent);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.blue { background: rgba(59, 130, 246, 0.15); }
.stat-icon.green { background: rgba(16, 185, 129, 0.15); }
.stat-icon.orange { background: rgba(245, 158, 11, 0.15); }
.stat-icon.red { background: rgba(239, 68, 68, 0.15); }

.stat-trend {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 6px;
}

.stat-trend.up {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
