<template>
  <div class="table-card">
    <div class="table-header">
      <span class="table-title">{{ title }}</span>
      <div class="table-actions">
        <slot name="headerActions"></slot>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="table-empty">加载中...</td>
          </tr>
          <tr v-else-if="!data.length">
            <td :colspan="columns.length" class="table-empty">暂无数据</td>
          </tr>
          <tr v-for="(row, index) in data" :key="index">
            <td v-for="col in columns" :key="col.key">
              <slot :name="col.key" :row="row as Record<string, unknown>" :index="index">
                {{ (row as Record<string, unknown>)[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="data.length" class="table-pagination">
      <span class="pagination-info">
        显示 {{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, total) }} 条，共 {{ total }} 条
      </span>
      <Pagination
        :current="page"
        :total="total"
        :page-size="pageSize"
        @change="$emit('pageChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from './Pagination.vue'

export interface TableColumn {
  key: string
  label: string
  width?: string
}

defineProps<{
  title: string
  columns: TableColumn[]
  data: unknown[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}>()

defineEmits<{
  pageChange: [page: number]
}>()
</script>

<style scoped>
.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table td {
  padding: 14px 20px;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}

.data-table tr:hover td {
  background: rgba(59, 130, 246, 0.05);
}

.table-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 20px !important;
}

.table-pagination {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
}

.pagination-info {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
