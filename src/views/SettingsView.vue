<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <div class="page-actions">
        <button class="btn btn-secondary" @click="handleReset" :disabled="saving">↩️ 重置</button>
        <button class="btn btn-primary" @click="handleSave" :disabled="loading || saving">
          {{ saving ? '保存中...' : '💾 保存设置' }}
        </button>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else class="settings-form">
      <!-- 基本设置 -->
      <template v-if="activeTab === 'basic'">
        <div class="form-group">
          <label class="form-label">系统名称</label>
          <input v-model="form.systemName" type="text" class="form-input" />
          <div class="form-hint">显示在浏览器标签页和导航栏中的系统名称</div>
        </div>
        <div class="form-group">
          <label class="form-label">系统 Logo</label>
          <input type="file" class="form-input" accept="image/*" @change="handleLogoUpload" />
          <div class="form-hint">建议尺寸 200x200px，支持 PNG、SVG 格式</div>
        </div>
        <div class="form-group">
          <label class="form-label">默认语言</label>
          <select v-model="form.defaultLanguage" class="form-input">
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">用户注册</label>
          <div class="form-switch">
            <div class="switch" :class="{ active: form.allowRegistration }" @click="form.allowRegistration = !form.allowRegistration"></div>
            <span>允许新用户注册</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">项目审核</label>
          <div class="form-switch">
            <div class="switch" :class="{ active: form.requireProjectReview }" @click="form.requireProjectReview = !form.requireProjectReview"></div>
            <span>新项目需要管理员审核后才能发布</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">最大上传文件大小</label>
          <input v-model="form.maxUploadSize" type="text" class="form-input" />
          <div class="form-hint">单个文件的最大允许上传大小</div>
        </div>
        <div class="form-group">
          <label class="form-label">允许的文件类型</label>
          <input v-model="form.allowedFileTypes" type="text" class="form-input" />
          <div class="form-hint">逗号分隔的文件扩展名列表</div>
        </div>
      </template>

      <!-- 存储配置 -->
      <template v-if="activeTab === 'storage'">
        <div class="form-group">
          <label class="form-label">存储类型</label>
          <select v-model="form.storageType" class="form-input">
            <option value="local">本地存储</option>
            <option value="s3">S3 对象存储</option>
            <option value="oss">阿里云 OSS</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">存储路径</label>
          <input v-model="form.storagePath" type="text" class="form-input" />
          <div class="form-hint">本地存储的文件保存路径</div>
        </div>
        <template v-if="form.storageType !== 'local'">
          <div class="form-group">
            <label class="form-label">Access Key</label>
            <input v-model="form.accessKey" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Secret Key</label>
            <input v-model="form.secretKey" type="password" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Bucket</label>
            <input v-model="form.bucket" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Region</label>
            <input v-model="form.region" type="text" class="form-input" />
          </div>
        </template>
      </template>

      <!-- 安全设置 -->
      <template v-if="activeTab === 'security'">
        <div class="form-group">
          <label class="form-label">会话超时（分钟）</label>
          <input v-model.number="form.sessionTimeout" type="number" class="form-input" />
          <div class="form-hint">用户无操作后自动登出的时间</div>
        </div>
        <div class="form-group">
          <label class="form-label">最大登录尝试次数</label>
          <input v-model.number="form.maxLoginAttempts" type="number" class="form-input" />
          <div class="form-hint">超过次数后锁定账户</div>
        </div>
        <div class="form-group">
          <label class="form-label">两步验证</label>
          <div class="form-switch">
            <div class="switch" :class="{ active: form.enableTwoFactor }" @click="form.enableTwoFactor = !form.enableTwoFactor"></div>
            <span>启用两步验证</span>
          </div>
        </div>
      </template>

      <!-- 通知设置 -->
      <template v-if="activeTab === 'notification'">
        <div class="form-group">
          <label class="form-label">邮件通知</label>
          <div class="form-switch">
            <div class="switch" :class="{ active: form.enableEmailNotify }" @click="form.enableEmailNotify = !form.enableEmailNotify"></div>
            <span>启用邮件通知</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">系统通知</label>
          <div class="form-switch">
            <div class="switch" :class="{ active: form.enableSystemNotify }" @click="form.enableSystemNotify = !form.enableSystemNotify"></div>
            <span>启用站内通知</span>
          </div>
        </div>
        <template v-if="form.enableEmailNotify">
          <div class="form-group">
            <label class="form-label">通知邮箱</label>
            <input v-model="form.notifyEmail" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">SMTP 服务器</label>
            <input v-model="form.smtpServer" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">SMTP 端口</label>
            <input v-model.number="form.smtpPort" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">SMTP 用户名</label>
            <input v-model="form.smtpUser" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">SMTP 密码</label>
            <input v-model="form.smtpPassword" type="password" class="form-input" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, saveSettings } from '@/api/system'
import type { SystemSettings } from '@/types'

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '基本设置' },
  { key: 'storage', label: '存储配置' },
  { key: 'security', label: '安全设置' },
  { key: 'notification', label: '通知设置' },
]

const defaultForm: SystemSettings = {
  systemName: 'PanoManager 全景管理系统',
  logo: '',
  defaultLanguage: 'zh-CN',
  allowRegistration: true,
  requireProjectReview: false,
  maxUploadSize: '50MB',
  allowedFileTypes: 'jpg, jpeg, png, mp3, mp4, pdf',
  storageType: 'local',
  storagePath: './uploads',
  accessKey: '',
  secretKey: '',
  bucket: '',
  region: '',
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  enableTwoFactor: false,
  enableEmailNotify: false,
  enableSystemNotify: true,
  notifyEmail: '',
  smtpServer: '',
  smtpPort: 465,
  smtpUser: '',
  smtpPassword: '',
}

const form = reactive<SystemSettings>({ ...defaultForm })

/**
 * 将字符串值转换为对应类型（boolean/number/string）
 */
function parseValue(key: string, value: string): unknown {
  const booleanKeys = ['allowRegistration', 'requireProjectReview', 'enableTwoFactor', 'enableEmailNotify', 'enableSystemNotify']
  const numberKeys = ['sessionTimeout', 'maxLoginAttempts', 'smtpPort']
  
  if (booleanKeys.includes(key)) {
    return value === 'true'
  }
  if (numberKeys.includes(key)) {
    return Number(value) || 0
  }
  return value
}

async function fetchSettings() {
  loading.value = true
  try {
    const res = await getSettings()
    const configs = res.data.data
    // 先重置为默认值
    Object.assign(form, defaultForm)
    if (Array.isArray(configs)) {
      const map: Record<string, unknown> = {}
      configs.forEach((c: { configKey: string; configValue: string }) => {
        map[c.configKey] = parseValue(c.configKey, c.configValue)
      })
      Object.assign(form, map)
    }
  } catch (e) {
    // API 不可用时使用默认值，错误已由拦截器提示
    console.error('加载设置失败:', e)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await saveSettings(form)
    ElMessage.success('设置保存成功')
  } catch (e) {
    // 错误已由拦截器提示
    console.error('保存设置失败:', e)
  } finally {
    saving.value = false
  }
}

function handleReset() {
  Object.assign(form, defaultForm)
  ElMessage.info('已重置为默认值，点击保存可应用')
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  // Logo上传功能待后端支持
  ElMessage.warning('Logo上传功能暂未开放')
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-page {
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

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1px;
}

.tab {
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: rgba(59, 130, 246, 0.05);
}

.loading-state {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 0;
}

.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--accent);
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.form-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch {
  width: 44px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.switch.active {
  background: var(--accent);
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch.active::after {
  transform: translateX(20px);
}
</style>
