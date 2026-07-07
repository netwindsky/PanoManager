<template>
  <div class="presets-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">后期处理预设</h1>
        <p class="page-desc">系统内置的色彩分级与后期效果预设</p>
      </div>
      <div class="page-actions">
        <div class="filter-tabs" style="margin-bottom: 0; margin-right: 12px;">
          <button
            v-for="tab in categoryTabs"
            :key="tab.value"
            class="tab"
            :class="{ active: activeCategory === tab.value }"
            @click="activeCategory = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else-if="filteredPresets.length === 0" class="empty-state">
      <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
      <p>暂无预设</p>
    </div>

    <div v-else class="preset-grid">
      <div v-for="(preset, index) in filteredPresets" :key="preset.id || index" class="preset-card">
        <div class="preset-preview" :style="getPresetGradient(preset)">
          <div class="preset-style-badge">{{ getStyleLabel(preset.presetStyle) }}</div>
        </div>
        <div class="preset-body">
          <div class="preset-header">
            <span class="preset-id">#{{ preset.id ? String(preset.id).slice(0, 8) : '-' }}</span>
            <span v-if="preset.enabled" class="enabled-badge">已启用</span>
            <span v-else class="disabled-badge">未启用</span>
          </div>

          <div class="preset-params">
            <div class="param-item" v-if="preset.exposure != null">
              <span class="param-label">曝光</span>
              <span class="param-value">{{ formatNumber(preset.exposure) }}</span>
            </div>
            <div class="param-item" v-if="preset.contrast != null">
              <span class="param-label">对比度</span>
              <span class="param-value">{{ formatNumber(preset.contrast) }}</span>
            </div>
            <div class="param-item" v-if="preset.saturation != null">
              <span class="param-label">饱和度</span>
              <span class="param-value">{{ formatNumber(preset.saturation) }}</span>
            </div>
            <div class="param-item" v-if="preset.colorTemperature != null">
              <span class="param-label">色温</span>
              <span class="param-value">{{ preset.colorTemperature }}K</span>
            </div>
            <div class="param-item" v-if="preset.bloomStrength != null">
              <span class="param-label">泛光</span>
              <span class="param-value">{{ formatNumber(preset.bloomStrength) }}</span>
            </div>
            <div class="param-item" v-if="preset.bloomThreshold != null">
              <span class="param-label">泛光阈值</span>
              <span class="param-value">{{ formatNumber(preset.bloomThreshold) }}</span>
            </div>
            <div class="param-item" v-if="preset.toneMapping">
              <span class="param-label">色调映射</span>
              <span class="param-value">{{ preset.toneMapping }}</span>
            </div>
            <div class="param-item" v-if="preset.lutResourceId">
              <span class="param-label">LUT</span>
              <span class="param-value truncate" :title="String(preset.lutResourceId)">
                #{{ preset.lutResourceId ? String(preset.lutResourceId).slice(0, 8) : '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-notice" style="margin-top: 24px;">
      <p>💡 提示：系统预设为内置配置，后期将支持创建自定义预设</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPresets } from '@/api/postprocessing'
import type { PostProcessingPreset } from '@/types'

const presets = ref<PostProcessingPreset[]>([])
const loading = ref(false)
const activeCategory = ref('all')

const categoryTabs = [
  { label: '全部', value: 'all' },
  { label: '已启用', value: 'enabled' },
  { label: '未启用', value: 'disabled' },
  { label: '有LUT', value: 'lut' },
]

const filteredPresets = computed(() => {
  if (activeCategory.value === 'all') return presets.value
  if (activeCategory.value === 'enabled') return presets.value.filter(p => p.enabled)
  if (activeCategory.value === 'disabled') return presets.value.filter(p => !p.enabled)
  if (activeCategory.value === 'lut') return presets.value.filter(p => !!p.lutResourceId)
  return presets.value
})

function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-'
  return Number(val).toFixed(2)
}

function getStyleLabel(style: string | null): string {
  if (!style) return '默认'
  const map: Record<string, string> = {
    natural: '自然',
    vivid: '鲜艳',
    cinematic: '电影',
    night: '夜景',
    cyberpunk: '赛博朋克',
    warm: '暖色',
    cool: '冷色',
    bw: '黑白',
  }
  return map[style] || style
}

function getPresetGradient(preset: PostProcessingPreset): Record<string, string> {
  // 根据预设风格生成背景渐变预览
  const style = preset.presetStyle || 'default'
  const gradients: Record<string, string> = {
    natural: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #8fbc8f 100%)',
    vivid: 'linear-gradient(135deg, #c41e3a 0%, #ff6b35 50%, #ffd700 100%)',
    cinematic: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    night: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #2a2a6a 100%)',
    cyberpunk: 'linear-gradient(135deg, #ff00ff 0%, #8b00ff 50%, #00ffff 100%)',
    warm: 'linear-gradient(135deg, #8b4513 0%, #cd853f 50%, #f5deb3 100%)',
    cool: 'linear-gradient(135deg, #003366 0%, #4682b4 50%, #87ceeb 100%)',
    bw: 'linear-gradient(135deg, #000000 0%, #555555 50%, #ffffff 100%)',
    default: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%)',
  }
  const bg = gradients[style] || gradients.default
  // 根据曝光和饱和度微调亮度和饱和度
  const exposure = preset.exposure ?? 0
  const saturation = preset.saturation ?? 0
  const filter = `brightness(${1 + exposure * 0.3}) saturate(${1 + saturation * 0.5})`
  return {
    background: bg,
    filter,
  }
}

async function fetchPresets() {
  loading.value = true
  try {
    const res = await getPresets()
    presets.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (e) {
    console.error('获取预设列表失败:', e)
    ElMessage.error('获取预设列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPresets()
})
</script>

<style scoped>
.presets-page {
  padding: 0;
}

.page-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.page-actions {
  display: flex;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab.active {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  font-weight: 500;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.preset-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.preset-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.preset-preview {
  aspect-ratio: 16 / 9;
  width: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}

.preset-style-badge {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin: 8px;
  backdrop-filter: blur(4px);
}

.preset-body {
  padding: 14px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preset-id {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

.enabled-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.disabled-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: rgba(100, 116, 139, 0.15);
  color: var(--text-muted);
}

.preset-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
}

.param-label {
  color: var(--text-muted);
}

.param-value {
  color: var(--text-primary);
  font-weight: 500;
}

.param-value.truncate {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-notice {
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
