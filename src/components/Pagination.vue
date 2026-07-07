<template>
  <div class="pagination-buttons">
    <button
      class="page-btn"
      :disabled="current <= 1"
      @click="emitChange(current - 1)"
    >
      &larr;
    </button>
    <button
      v-for="p in displayedPages"
      :key="p"
      class="page-btn"
      :class="{ active: p === current }"
      @click="emitChange(p)"
    >
      {{ p }}
    </button>
    <button
      class="page-btn"
      :disabled="current >= totalPages"
      @click="emitChange(current + 1)"
    >
      &rarr;
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const displayedPages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = props.current

  let start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  start = Math.max(1, end - 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function emitChange(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.current) {
    emit('change', page)
  }
}
</script>

<style scoped>
.pagination-buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--accent);
  color: var(--text-primary);
}

.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
