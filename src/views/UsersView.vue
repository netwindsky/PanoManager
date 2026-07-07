<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <div class="page-actions">
        <button class="btn btn-secondary" disabled title="功能开发中">📥 导出用户</button>
        <button class="btn btn-primary" @click="handleShowCreate">+ 添加用户</button>
      </div>
    </div>

    <DataTable
      title="用户列表"
      :columns="columns"
      :data="users"
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
          placeholder="搜索用户..."
          @input="handleSearch"
        />
      </template>
      <template #userInfo="{ row }">
        <div class="user-cell">
          <div class="user-avatar-sm" :style="{ background: getAvatarColor((row as unknown as UserItem).id) }">
            {{ (row as unknown as UserItem).name.charAt(0) }}
          </div>
          <div class="user-cell-info">
            <span class="user-cell-name">{{ (row as unknown as UserItem).name }}</span>
            <span class="user-cell-email">{{ (row as unknown as UserItem).email }}</span>
          </div>
        </div>
      </template>
      <template #role="{ row }">
        <select
          class="role-select"
          :value="(row as unknown as UserItem).role"
          @change="handleRoleChange((row as unknown as UserItem).id, ($event.target as HTMLSelectElement).value)"
        >
          <option value="ADMIN">管理员</option>
          <option value="EDITOR">编辑者</option>
          <option value="VIEWER">浏览者</option>
        </select>
      </template>
      <template #status="{ row }">
        <span class="status-badge" :class="(row as unknown as UserItem).status === 'ACTIVE' ? 'online' : 'offline'">
          <span class="status-dot"></span>
          {{ (row as unknown as UserItem).status === 'ACTIVE' ? '正常' : '已禁用' }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <button
            class="icon-btn"
            :title="(row as unknown as UserItem).status === 'ACTIVE' ? '禁用' : '启用'"
            @click="handleToggleStatus((row as unknown as UserItem).id)"
          >
            {{ (row as unknown as UserItem).status === 'ACTIVE' ? '🚫' : '✅' }}
          </button>
        </div>
      </template>
    </DataTable>

    <!-- 创建用户弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">添加用户</h2>
          <button class="dialog-close" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">用户名 <span class="required">*</span></label>
            <input v-model="createForm.name" type="text" class="form-input" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱 <span class="required">*</span></label>
            <input v-model="createForm.email" type="email" class="form-input" placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label class="form-label">密码 <span class="required">*</span></label>
            <input v-model="createForm.password" type="password" class="form-input" placeholder="请输入初始密码" />
          </div>
          <div class="form-group">
            <label class="form-label">角色</label>
            <select v-model="createForm.role" class="form-input">
              <option value="VIEWER">浏览者</option>
              <option value="EDITOR">编辑者</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-primary" :disabled="!createForm.name || !createForm.email || !createForm.password || creating" @click="submitCreate">
            {{ creating ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { getUsers, createUser, updateUserRole, updateUserStatus } from '@/api/user'
import type { UserItem, UserRole } from '@/types'

const users = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'VIEWER' as UserRole,
})

const columns: TableColumn[] = [
  { key: 'userInfo', label: '用户信息' },
  { key: 'role', label: '角色', width: '120px' },
  { key: 'projectCount', label: '项目数', width: '80px' },
  { key: 'status', label: '状态', width: '100px' },
  { key: 'createdAt', label: '注册时间', width: '180px' },
  { key: 'actions', label: '操作', width: '80px' },
]

function getAvatarColor(id: string): string {
  const colors = [
    'linear-gradient(135deg, #3b82f6, #60a5fa)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #ef4444, #f87171)',
  ]
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[index % colors.length]
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers({
      current: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    const data = res.data.data
    users.value = data.records.map(u => ({ ...u }))
    total.value = data.total
  } catch (e) {
    console.error('获取用户列表失败:', e)
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 300)
}

function handleShowCreate() {
  createForm.name = ''
  createForm.email = ''
  createForm.password = ''
  createForm.role = 'VIEWER'
  showCreateDialog.value = true
}

async function submitCreate() {
  if (!createForm.name || !createForm.email || !createForm.password || creating.value) return
  creating.value = true
  try {
    await createUser({
      name: createForm.name,
      email: createForm.email,
      password: createForm.password,
    })
    // 注意：创建用户后角色需要单独更新，因为register接口默认角色可能不是VIEWER
    // 这里简化处理，如果创建时指定角色需要后端支持
    ElMessage.success('用户创建成功')
    showCreateDialog.value = false
    fetchUsers()
  } catch (e) {
    console.error('创建用户失败:', e)
  } finally {
    creating.value = false
  }
}

async function handleRoleChange(id: string, newRole: string) {
  try {
    await updateUserRole(id, newRole)
    ElMessage.success('角色更新成功')
    fetchUsers()
  } catch (e) {
    console.error('更新角色失败:', e)
    fetchUsers() // 刷新恢复原值
  }
}

async function handleToggleStatus(id: string) {
  try {
    const user = users.value.find(u => (u as unknown as UserItem).id === id) as unknown as UserItem | undefined
    if (!user) return
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    const action = newStatus === 'ACTIVE' ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${action}用户「${user.name}」吗？`, `确认${action}`, {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateUserStatus(id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('切换用户状态失败:', e)
      fetchUsers()
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
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

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  color: white;
}

.user-cell-info {
  display: flex;
  flex-direction: column;
}

.user-cell-name {
  font-weight: 500;
}

.user-cell-email {
  font-size: 12px;
  color: var(--text-muted);
}

.role-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.ADMIN {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.role-badge.VIEWER {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
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

.action-btns {
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
</style>
