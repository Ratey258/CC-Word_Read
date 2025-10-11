<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useSettingsStore } from '@/stores/settings'
import { usePageCalculator } from '@/composables/usePageCalculator'
import { formatNumber } from '@/utils/formatter'

// Stores
const novelStore = useNovelStore()
const settingsStore = useSettingsStore()

// Composables
const { currentPage, totalPages } = usePageCalculator()

// Reactive state
const { currentNovel, currentPosition } = storeToRefs(novelStore)
const { settings } = storeToRefs(settingsStore)

// Computed
const hasNovel = computed(() => currentNovel.value !== null)

const currentChar = computed(() => currentPosition.value + 1)
const totalChars = computed(() => currentNovel.value?.content.length || 0)

const wordCount = computed(() => {
  // 简单计算：中文按字数，英文按单词数
  const content = currentNovel.value?.content || ''
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const englishWords = content.match(/[a-zA-Z]+/g)?.length || 0
  return chineseChars + englishWords
})

const zoomPercentage = computed(() => Math.round(settings.value.window.zoomLevel))

// Methods
const handleZoomIn = () => {
  if (settings.value.window.zoomLevel < 200) {
    settingsStore.setZoomLevel(Math.min(settings.value.window.zoomLevel + 10, 200))
  }
}

const handleZoomOut = () => {
  if (settings.value.window.zoomLevel > 50) {
    settingsStore.setZoomLevel(Math.max(settings.value.window.zoomLevel - 10, 50))
  }
}

const handleZoomChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newZoom = parseInt(target.value)
  settingsStore.setZoomLevel(newZoom)
}

const handleZoomReset = () => {
  settingsStore.setZoomLevel(100)
}

const switchView = (view: 'print' | 'web' | 'reading') => {
  // 装饰性视图切换按钮，保持 Word 风格界面
  console.log('View mode:', view)
}
</script>

<template>
  <div class="status-bar">
    <!-- 左侧信息 -->
    <div class="status-bar__left">
      <!-- 页码 -->
      <div 
        class="status-bar__item"
        title="页码"
      >
        <span class="status-bar__text">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      </div>

      <div class="status-bar__divider"></div>

      <!-- 字数统计 -->
      <div
        v-if="hasNovel"
        class="status-bar__item"
        title="字数统计信息"
      >
        <span class="status-bar__text">{{ formatNumber(wordCount) }} 字</span>
      </div>

      <div v-if="hasNovel" class="status-bar__divider"></div>

      <!-- 字符位置 -->
      <div
        v-if="hasNovel"
        class="status-bar__item"
        title="字符位置"
      >
        <span class="status-bar__text">第 {{ formatNumber(currentChar) }} 个字符，共 {{ formatNumber(totalChars) }} 个</span>
      </div>
    </div>

    <!-- 右侧控制 -->
    <div class="status-bar__right">
      <!-- 语言指示器 -->
      <div class="status-bar__item status-bar__language">
        <span class="status-bar__text">简体中文(中国大陆)</span>
      </div>

      <div class="status-bar__divider"></div>

      <!-- 视图切换 -->
      <div class="status-bar__views">
        <button 
          class="status-bar__view-btn"
          title="页面视图"
          @click="switchView('print')"
        >
          <svg
            class="status-bar__view-icon"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z" />
            <path d="M5 5h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z" />
          </svg>
        </button>
        <button 
          class="status-bar__view-btn status-bar__view-btn--active"
          title="Web 版式视图"
          @click="switchView('web')"
        >
          <svg
            class="status-bar__view-icon"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 2h14v12H1V2zm1 1v10h12V3H2z" />
            <path d="M3 4h10v1H3V4z" />
          </svg>
        </button>
        <button 
          class="status-bar__view-btn"
          title="阅读视图"
          @click="switchView('reading')"
        >
          <svg
            class="status-bar__view-icon"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 2c-3 0-5.5 1.5-7 4 1.5 2.5 4 4 7 4s5.5-1.5 7-4c-1.5-2.5-4-4-7-4zm0 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      <div class="status-bar__divider"></div>

      <!-- 缩放控制 -->
      <div class="status-bar__zoom">
        <button 
          class="status-bar__zoom-btn"
          title="缩小"
          :disabled="settings.window.zoomLevel <= 50"
          @click="handleZoomOut"
        >
          <svg
            class="status-bar__zoom-icon"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 7.5h8v1H4v-1z" />
          </svg>
        </button>

        <input
          type="range"
          class="status-bar__zoom-slider"
          min="50"
          max="200"
          step="10"
          :value="zoomPercentage"
          title="缩放级别"
          @input="handleZoomChange"
        />

        <button 
          class="status-bar__zoom-display"
          title="单击可重置为 100%"
          @click="handleZoomReset"
        >
          {{ zoomPercentage }}%
        </button>

        <button 
          class="status-bar__zoom-btn"
          title="放大"
          :disabled="settings.window.zoomLevel >= 200"
          @click="handleZoomIn"
        >
          <svg
            class="status-bar__zoom-icon"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 4v3.5H4v1h4V12h1V8.5h4v-1H9V4H8z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* StatusBar 组件样式已在 assets/styles/components/statusbar.css 中定义 */
</style>

