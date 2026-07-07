<template>
  <div class="media-page">
    <div class="page-header">
      <h1 class="page-title">媒体资源</h1>
      <div class="page-actions">
        <button class="btn btn-secondary" disabled title="文件夹功能开发中">📁 新建文件夹</button>
        <label class="btn btn-primary" style="cursor: pointer;">
          + 上传文件
          <input type="file" style="display: none;" multiple @change="handleFileUpload" />
        </label>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else-if="filteredResources.length === 0" class="empty-state">暂无资源</div>

    <div v-else class="media-grid">
      <div v-for="item in filteredResources" :key="item.id" class="media-card">
        <div class="media-cover" @click="isPreviewable(item) && handlePreview(item)">
          <span v-if="isPanorama(item)" class="media-type-badge">🌐 全景</span>
          <img
            v-if="canShowThumb(item)"
            :src="getThumbUrl(item)"
            :alt="item.name"
            class="media-thumb"
            loading="lazy"
            @error="onImgError($event, item)"
          />
          <template v-else>{{ getTypeEmoji(item) }}</template>
        </div>
        <div class="media-body">
          <div class="media-title" :title="item.name">{{ item.name }}</div>
          <div class="media-desc">{{ item.mimeType }}</div>
          <div class="media-meta">
            <div class="media-stats">
              <span>{{ formatSize(item.sizeBytes) }}</span>
            </div>
            <div class="media-actions">
              <button v-if="isPreviewable(item)" class="icon-btn" title="预览" @click="handlePreview(item)">👁️</button>
              <button class="icon-btn icon-btn-danger" title="删除" @click="handleDelete(item.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="previewItem" class="dialog-overlay" @click="previewItem = null">
      <div class="dialog preview-dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">{{ previewItem.name }}</h2>
          <button class="dialog-close" @click="previewItem = null">&times;</button>
        </div>
        <div class="dialog-body preview-body">
          <img v-if="isImage(previewItem)" :src="getFullUrl(previewItem)" :alt="previewItem.name" class="preview-image" />
          <video v-else-if="isVideo(previewItem)" :src="getFullUrl(previewItem)" controls style="max-width: 100%; max-height: 70vh;" />
          <audio v-else-if="isAudio(previewItem)" :src="getFullUrl(previewItem)" controls style="width: 100%;" />
          <p v-else>该文件类型不支持预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllResources, deleteResource } from '@/api/resource'
import type { MediaResource } from '@/types'

const resources = ref<MediaResource[]>([])
const loading = ref(false)
const activeTab = ref('all')
const previewItem = ref<MediaResource | null>(null)

const tabs = [
  { label: '全部', value: 'all' },
  { label: '全景图', value: 'panorama' },
  { label: '图片', value: 'image' },
  { label: '音频', value: 'audio' },
  { label: '视频', value: 'video' },
]

const filteredResources = computed(() => {
  if (activeTab.value === 'all') return resources.value
  return resources.value.filter(item => {
    const type = (item.type || '').toLowerCase()
    const mime = getMimeType(item)
    if (activeTab.value === 'panorama') return type === 'panorama'
    if (activeTab.value === 'image') return mime.startsWith('image') && type !== 'panorama'
    if (activeTab.value === 'audio') return mime.startsWith('audio')
    if (activeTab.value === 'video') return mime.startsWith('video')
    return true
  })
})

/**
 * 获取资源MIME类型，兼容不同字段
 */
function getMimeType(item: MediaResource): string {
  // type字段可能是MIME类型，也可能是分类(image/audio/video)
  const mime = item.mimeType || item.type || ''
  return mime.toLowerCase()
}

function isPanorama(item: MediaResource): boolean {
  const type = (item.type || '').toLowerCase()
  return type === 'panorama'
}

function isImage(item: MediaResource): boolean {
  const mime = getMimeType(item)
  return mime.startsWith('image') || mime === 'image' || isPanorama(item)
}

function isVideo(item: MediaResource): boolean {
  const mime = getMimeType(item)
  return mime.startsWith('video') || mime === 'video'
}

function isAudio(item: MediaResource): boolean {
  const mime = getMimeType(item)
  return mime.startsWith('audio') || mime === 'audio'
}

function isPreviewable(item: MediaResource): boolean {
  return isImage(item) || isVideo(item) || isAudio(item)
}

/**
 * 能否在列表中直接显示图片
 * - 有thumbUrl字段 → 使用缩略图（安全）
 * - url文件名以thumb_开头 → 本身就是缩略图文件（安全，几十KB）
 * - 普通图片（非全景图）→ 可以显示，普通图片不大
 * - 全景图(panorama类型)无缩略图 → 不加载原图，显示🌐emoji
 */
function canShowThumb(item: MediaResource): boolean {
  if (!isImage(item)) return false
  // 有显式缩略图URL → 安全
  if (item.thumbUrl && item.thumbUrl.trim()) return true
  // 文件名以thumb_开头 → 本身就是缩略图
  const url = item.url || ''
  const fileName = url.split('/').pop() || ''
  if (fileName.startsWith('thumb_') || fileName.includes('_th.')) return true
  // 全景图无缩略图 → 不加载原图（原图几MB~几十MB）
  if (isPanorama(item)) return false
  // 普通图片允许直接显示（一般不大）
  return true
}

/**
 * 获取缩略图URL
 * 优先thumbUrl字段，否则用url（对于thumb_开头缩略图或普通小图）
 */
function getThumbUrl(item: MediaResource): string {
  const thumbUrl = item.thumbUrl?.trim()
  if (thumbUrl) return resolveUrl(thumbUrl)
  return resolveUrl(item.url || '')
}

/**
 * 获取原始资源URL（用于预览）
 */
function getFullUrl(item: MediaResource): string {
  return resolveUrl(item.url || '')
}

/**
 * 处理URL相对路径
 */
function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!url.startsWith('/')) url = '/' + url
  return url
}

function getTypeEmoji(item: MediaResource): string {
  if (isPanorama(item)) return '🌐'
  if (isImage(item)) return '🖼️'
  if (isAudio(item)) return '🎵'
  if (isVideo(item)) return '🎬'
  return '📄'
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

function switchTab(tab: string) {
  activeTab.value = tab
}

function handlePreview(item: MediaResource) {
  previewItem.value = item
}

/**
 * 图片加载失败时显示emoji
 */
function onImgError(event: Event, item: MediaResource) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // 给父元素添加内容
  const parent = img.parentElement
  if (parent) {
    parent.textContent = getTypeEmoji(item)
    parent.style.display = 'flex'
    parent.style.alignItems = 'center'
    parent.style.justifyContent = 'center'
    parent.style.fontSize = '40px'
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  // 全局上传需要选择项目，提示用户去项目详情页上传
  ElMessage.warning('请进入具体项目详情页上传资源，全局上传功能开发中')
  target.value = '' // 重置input
}

async function fetchResources() {
  loading.value = true
  try {
    const res = await getAllResources()
    const data = res.data.data
    resources.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('获取资源列表失败:', e)
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该资源吗？如果资源正在使用可能导致异常。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteResource(id)
    ElMessage.success('删除成功')
    fetchResources()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除资源失败:', e)
    }
  }
}

onMounted(() => {
  fetchResources()
})
</script>

<style scoped>
.media-page {
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.media-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.media-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.media-cover {
  aspect-ratio: 1 / 1;
  width: 100%;
  background: linear-gradient(135deg, #1e3a5f, #2d5a87);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  overflow: hidden;
  cursor: default;
}

.media-cover:has(.media-thumb) {
  cursor: pointer;
}

.media-cover:hover:has(.media-thumb) {
  opacity: 0.9;
}

.media-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  z-index: 1;
  backdrop-filter: blur(4px);
}

.media-cover {
  position: relative;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 0;
}

.preview-dialog {
  max-width: 80vw;
  max-height: 80vh;
}

.preview-body {
  text-align: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.media-body {
  padding: 14px;
}

.media-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-stats {
  font-size: 12px;
  color: var(--text-muted);
}

.media-actions {
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
