<template>
  <div class="logs-page">
    <div class="page-header">
      <h1 class="page-title">操作日志</h1>
      <div class="page-actions">
      </div>
    </div>

    <DataTable
      title="最近操作记录"
      :columns="columns"
      :data="logs"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :loading="loading"
      @page-change="handlePageChange"
    >
      <template #headerActions>
        <input
          v-model="keyword"
          type="text"
          class="search-box"
          placeholder="搜索日志..."
          @input="handleSearch"
        />
      </template>
      <template #status="{ row }">
        <span class="status-badge" :class="(row as unknown as LogItem).status === 'SUCCESS' ? 'online' : 'offline'">
          <span class="status-dot"></span>
          {{ (row as unknown as LogItem).status === 'SUCCESS' ? '成功' : '失败' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { getLogs } from '@/api/log'
import type { LogItem } from '@/types'

const logs = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')

const columns: TableColumn[] = [
  { key: 'createdAt', label: '时间' },
  { key: 'userId', label: '用户' },
  { key: 'action', label: '操作类型' },
  { key: 'entityType', label: '资源类型' },
  { key: 'entityId', label: '操作对象' },
  { key: 'ipAddress', label: 'IP 地址' },
  { key: 'status', label: '状态' },
]

async function fetchLogs() {
  loading.value = true
  try {
    const res = await getLogs({
      current: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    const data = res.data.data
    logs.value = data.records.map(l => ({ ...l }))
    total.value = data.total
  } catch (e) {
    console.error('获取日志列表失败:', e)
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchLogs()
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchLogs()
  }, 300)
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.logs-page {
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

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.search-box {
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  width: 200px;
}

.search-box:focus {
  border-color: var(--accent);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.online {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.status-badge.offline {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
