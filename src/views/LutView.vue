<template>
  <div class="lut-page">
    <div class="page-header">
      <h1 class="page-title">LUT 色彩查找表管理</h1>
      <div class="page-actions">
        <button class="btn btn-primary" @click="showUploadDialog = true">
          + 上传LUT
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else-if="luts.length === 0" class="empty-state">
      <div style="font-size: 48px; margin-bottom: 12px;">🎨</div>
      <p>暂无LUT资源，点击上方按钮上传</p>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">
        支持 .cube / .3dl 格式 LUT 文件
      </p>
    </div>

    <div v-else class="lut-grid">
      <div v-for="lut in luts" :key="lut.id" class="lut-card">
        <div class="lut-preview">
          <img
            v-if="lut.previewUrl"
            :src="resolveUrl(lut.previewUrl)"
            :alt="lut.name"
            class="lut-preview-img"
            @error="onPreviewError($event)"
          />
          <div v-else class="lut-preview-placeholder">🎨</div>
        </div>
        <div class="lut-info">
          <div class="lut-name" :title="lut.name">{{ lut.name }}</div>
          <div class="lut-meta">
            <span class="format-badge">{{ lut.format || 'CUBE' }}</span>
            <span v-if="lut.lutSize" class="lut-size-badge">{{ lut.lutSize }}</span>
          </div>
          <div class="lut-meta-secondary">
            <span v-if="lut.sizeBytes">{{ formatSize(lut.sizeBytes) }}</span>
            <span v-if="lut.uploadedBy">by {{ lut.uploadedBy }}</span>
          </div>
          <div class="lut-date">{{ formatDate(lut.createdAt) }}</div>
        </div>
        <div class="lut-actions">
          <button class="icon-btn icon-btn-danger" title="删除" @click="handleDelete(lut)">🗑️</button>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUploadDialog" class="dialog-overlay" @click="closeUploadDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">上传 LUT 文件</h2>
          <button class="dialog-close" @click="closeUploadDialog">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">LUT名称</label>
            <input
              v-model="uploadForm.name"
              type="text"
              class="form-input"
              placeholder="留空则使用文件名"
            />
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea
              v-model="uploadForm.description"
              class="form-textarea"
              placeholder="描述（可选）"
              rows="2"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">LUT文件 <span class="required">*</span></label>
            <div
              class="upload-dropzone"
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".cube,.3dl,.CUBE,.3DL"
                style="display: none;"
                @change="handleFileSelect"
              />
              <div v-if="!selectedFile" class="upload-placeholder">
                <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
                <p>点击选择或拖拽文件到此处</p>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                  支持 .cube / .3dl 格式
                </p>
              </div>
              <div v-else class="upload-selected">
                <p>📄 {{ selectedFile.name }}</p>
                <p style="font-size: 12px; color: var(--text-muted);">
                  {{ formatSize(selectedFile.size) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeUploadDialog">取消</button>
          <button
            class="btn btn-primary"
            :disabled="!selectedFile || uploading"
            @click="submitUpload"
          >
            {{ uploading ? '上传中...' : '上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllLuts, uploadLut, deleteLut } from '@/api/lut'
import type { LutResource } from '@/types'

const luts = ref<LutResource[]>([])
const loading = ref(false)
const showUploadDialog = ref(false)
const uploading = ref(false)
const isDragOver = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const uploadForm = reactive({
  name: '',
  description: '',
})

/**
 * 处理URL路径
 */
function resolveUrl(url: string | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!url.startsWith('/')) return '/' + url
  return url
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

function onPreviewError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = '<div class="lut-preview-placeholder">🎨</div>'
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    selectedFile.value = file
    // 自动填充名称
    if (!uploadForm.name) {
      uploadForm.name = file.name.replace(/\.[^.]+$/, '')
    }
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'cube' || ext === '3dl') {
      selectedFile.value = file
      if (!uploadForm.name) {
        uploadForm.name = file.name.replace(/\.[^.]+$/, '')
      }
    } else {
      ElMessage.error('仅支持 .cube / .3dl 格式的LUT文件')
    }
  }
}

function closeUploadDialog() {
  showUploadDialog.value = false
  selectedFile.value = null
  uploadForm.name = ''
  uploadForm.description = ''
  isDragOver.value = false
}

async function submitUpload() {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    await uploadLut(
      selectedFile.value,
      uploadForm.name || undefined,
      uploadForm.description || undefined
    )
    ElMessage.success('LUT上传成功')
    closeUploadDialog()
    await fetchLuts()
  } catch (e) {
    console.error('上传LUT失败:', e)
  } finally {
    uploading.value = false
  }
}

async function fetchLuts() {
  loading.value = true
  try {
    const res = await getAllLuts()
    luts.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (e) {
    console.error('获取LUT列表失败:', e)
  } finally {
    loading.value = false
  }
}

async function handleDelete(lut: LutResource) {
  try {
    await ElMessageBox.confirm(
      `确定删除LUT「${lut.name}」吗？删除后使用该LUT的场景效果将受影响。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteLut(lut.id)
    ElMessage.success('删除成功')
    fetchLuts()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除LUT失败:', e)
    }
  }
}

onMounted(() => {
  fetchLuts()
})
</script>

<style scoped>
.lut-page {
  padding: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.lut-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.lut-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.lut-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.lut-preview {
  aspect-ratio: 16 / 10;
  width: 100%;
  background: linear-gradient(135deg, #1e293b, #334155);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lut-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lut-preview-placeholder {
  font-size: 40px;
  opacity: 0.5;
}

.lut-info {
  padding: 12px;
}

.lut-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.lut-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.lut-meta-secondary {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.format-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent);
}

.lut-size-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.lut-date {
  font-size: 11px;
  color: var(--text-muted);
}

.lut-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.lut-card:hover .lut-actions {
  opacity: 1;
}

.upload-dropzone {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover,
.upload-dropzone.drag-over {
  border-color: var(--accent);
  background: rgba(59, 130, 246, 0.05);
}

.upload-placeholder p {
  font-size: 14px;
  color: var(--text-secondary);
}

.upload-selected p {
  font-size: 14px;
  color: var(--text-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
