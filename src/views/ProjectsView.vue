<template>
  <div class="projects-page">
    <div class="page-header">
      <h1 class="page-title">项目管理</h1>
      <div class="page-actions">
        <input
          v-model="keyword"
          type="text"
          class="search-box"
          placeholder="搜索项目..."
          @input="handleSearch"
        />
        <button class="btn btn-secondary" disabled title="功能开发中">📥 批量导出</button>
        <button class="btn btn-primary" @click="handleCreate">+ 新建项目</button>
      </div>
    </div>

    <div class="filter-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: activeStatus === tab.value }"
        @click="handleStatusFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-cover">{{ getCoverEmoji(project.name) }}</div>
        <div class="project-body">
          <div class="project-title">{{ project.name }}</div>
          <div class="project-desc">{{ project.description || '暂无描述' }}</div>
          <div class="project-meta">
            <div class="project-stats">
              <span>{{ project.sceneCount || 0 }} 场景</span>
              <span class="status-badge" :class="getStatusClass(project.status)">{{ getStatusLabel(project.status) }}</span>
            </div>
            <div class="project-actions">
              <button class="icon-btn" title="预览" @click="openViewer(project.id)">👁️</button>
              <button class="icon-btn" title="编辑信息" @click="handleEdit(project)">📝</button>
              <button class="icon-btn" title="打开全景编辑器" @click="openEditor(project.id)">✏️</button>
              <button
                v-if="project.status === 'PUBLISHED'"
                class="icon-btn"
                title="下架"
                @click="handleToggleStatus(project, 'UNPUBLISHED')"
              >📴</button>
              <button
                v-else
                class="icon-btn"
                title="发布"
                @click="handleToggleStatus(project, 'PUBLISHED')"
              >🚀</button>
              <button class="icon-btn icon-btn-danger" title="删除" @click="handleDelete(project)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建新项目卡片 -->
      <div class="project-card create-card" @click="handleCreate">
        <div class="project-cover create-cover">
          <span class="create-icon">+</span>
        </div>
        <div class="project-body">
          <div class="project-title create-title">创建新项目</div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <Pagination :current="page" :total="total" :page-size="pageSize" @change="handlePageChange" />
    </div>

    <!-- 新建项目弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">新建项目</h2>
          <button class="dialog-close" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">项目名称 <span class="required">*</span></label>
            <input
              v-model="createForm.name"
              type="text"
              class="form-input"
              placeholder="请输入项目名称"
              @keyup.enter="submitCreate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">项目描述</label>
            <textarea
              v-model="createForm.description"
              class="form-textarea"
              placeholder="请输入项目描述（可选）"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-primary" :disabled="!createForm.name.trim() || creating" @click="submitCreate">
            {{ creating ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑项目弹窗 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="showEditDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">编辑项目信息</h2>
          <button class="dialog-close" @click="showEditDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">项目名称 <span class="required">*</span></label>
            <input
              v-model="editForm.name"
              type="text"
              class="form-input"
              placeholder="请输入项目名称"
              @keyup.enter="submitEdit"
            />
          </div>
          <div class="form-group">
            <label class="form-label">项目描述</label>
            <textarea
              v-model="editForm.description"
              class="form-textarea"
              placeholder="请输入项目描述（可选）"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showEditDialog = false">取消</button>
          <button class="btn btn-primary" :disabled="!editForm.name.trim() || editing" @click="submitEdit">
            {{ editing ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/project'
import type { Project } from '@/types'
import Pagination from '@/components/Pagination.vue'

const projects = ref<Project[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(9)
const total = ref(0)
const keyword = ref('')
const activeStatus = ref('ALL')

const statusTabs = [
  { label: '全部', value: 'ALL' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '草稿', value: 'DRAFT' },
  { label: '已下架', value: 'UNPUBLISHED' },
]

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const editing = ref(false)
const toggling = ref<string | null>(null)
const editingId = ref<string | null>(null)
const createForm = reactive({
  name: '',
  description: '',
})
const editForm = reactive({
  name: '',
  description: '',
})

function getCoverEmoji(title: string): string {
  const emojiMap: Record<string, string> = {
    '企业': '🏢',
    '房地产': '🏠',
    '博物': '🏛️',
    '酒店': '🏨',
    '校园': '🏫',
  }
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (title.includes(key)) return emoji
  }
  return '🌐'
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    PUBLISHED: 'online',
    DRAFT: 'pending',
    UNPUBLISHED: 'offline',
  }
  return map[status] || 'pending'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PUBLISHED: '已发布',
    DRAFT: '草稿',
    UNPUBLISHED: '已下架',
  }
  return map[status] || status
}

function openViewer(id: string) {
  window.open(`http://localhost:5001/${id}`, '_blank')
}

function openEditor(id: string) {
  window.open(`http://localhost:5002/editor/${id}`, '_blank')
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchProjects()
  }, 300)
}

function handleStatusFilter(status: string) {
  activeStatus.value = status
  page.value = 1
  fetchProjects()
}

async function handleToggleStatus(project: Project, newStatus: string) {
  const actionText = newStatus === 'PUBLISHED' ? '发布' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}项目「${project.name}」吗？`,
      `确认${actionText}`,
      {
        confirmButtonText: `确定${actionText}`,
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    toggling.value = project.id
    await updateProject(project.id, { status: newStatus })
    ElMessage.success(`${actionText}成功`)
    fetchProjects()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(`${actionText}项目失败:`, e)
    }
  } finally {
    toggling.value = null
  }
}

async function handleDelete(project: Project) {
  const sceneCount = project.sceneCount || 0
  const warnMsg = sceneCount > 0
    ? `该项目下有 ${sceneCount} 个场景，删除后不可恢复，其下场景和资源也将被删除。`
    : '删除后项目不可恢复。'
  try {
    await ElMessageBox.confirm(warnMsg, `确定删除项目「${project.name}」吗？`, {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteProject(project.id)
    ElMessage.success('删除成功')
    fetchProjects()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除项目失败:', e)
    }
  }
}

function handleCreate() {
  createForm.name = ''
  createForm.description = ''
  showCreateDialog.value = true
}

async function submitCreate() {
  if (!createForm.name.trim() || creating.value) return

  creating.value = true
  try {
    await createProject({
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
    })
    ElMessage.success('项目创建成功')
    showCreateDialog.value = false
    fetchProjects()
  } catch (e) {
    console.error('创建项目失败:', e)
  } finally {
    creating.value = false
  }
}

function handleEdit(project: Project) {
  editingId.value = project.id
  editForm.name = project.name
  editForm.description = project.description || ''
  showEditDialog.value = true
}

async function submitEdit() {
  if (!editForm.name.trim() || editing.value || !editingId.value) return

  editing.value = true
  try {
    await updateProject(editingId.value, {
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
    })
    ElMessage.success('项目信息更新成功')
    showEditDialog.value = false
    editingId.value = null
    fetchProjects()
  } catch (e) {
    console.error('更新项目失败:', e)
  } finally {
    editing.value = false
  }
}

async function fetchProjects() {
  loading.value = true
  try {
    const params: { current: number; size: number; keyword?: string } = {
      current: page.value,
      size: pageSize.value,
    }
    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    const res = await getProjects(params)
    const data = res.data.data
    let list = data.records || []
    // 前端过滤状态（因为后端可能不支持状态筛选参数）
    if (activeStatus.value !== 'ALL') {
      list = list.filter((p: Project) => p.status === activeStatus.value)
    }
    projects.value = list
    total.value = data.total
  } catch (e) {
    console.error('获取项目列表失败:', e)
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchProjects()
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-page {
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
  align-items: center;
}

.search-box {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  width: 200px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box:focus {
  border-color: var(--accent);
}

.filter-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}

.filter-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-tab.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
  font-weight: 500;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.loading-state {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.project-cover {
  height: 140px;
  background: linear-gradient(135deg, #1e3a5f, #2d5a87);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.project-body {
  padding: 16px;
}

.project-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.project-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
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

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.project-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.icon-btn-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.create-card {
  cursor: pointer;
}

.create-cover {
  background: linear-gradient(135deg, #2d3748, #4a5568);
  border: 2px dashed var(--border);
}

.create-icon {
  font-size: 32px;
  color: var(--text-secondary);
}

.create-title {
  text-align: center;
  color: var(--text-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-card);
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.dialog-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close:hover {
  background: var(--bg-hover);
}

.dialog-body {
  padding: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.required {
  color: var(--danger);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
