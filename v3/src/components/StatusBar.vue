<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useSettingsStore } from '@/stores/settings'
import { formatNumber } from '@/utils/formatter'

// Stores
const novelStore = useNovelStore()
const settingsStore = useSettingsStore()

// Reactive state
const { currentNovel, currentPosition } = storeToRefs(novelStore)
const { settings } = storeToRefs(settingsStore)

// Computed
const hasNovel = computed(() => currentNovel.value !== null)

const currentPage = computed(() =>
{
  if (!hasNovel.value) return 1
  // TODO: 计算当前页码
  return 1
})

const totalPages = computed(() =>
{
  if (!hasNovel.value) return 1
  // TODO: 计算总页数
  return 1
})

const currentChar = computed(() => currentPosition.value + 1)
const totalChars = computed(() => currentNovel.value?.content.length || 0)

const wordCount = computed(() => 
{
  // 简单计算：中文按字数，英文按单词数
  const content = currentNovel.value?.content || ''
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const englishWords = content.match(/[a-zA-Z]+/g)?.length || 0
  return chineseChars + englishWords
})

const zoomPercentage = computed(() => Math.round(settings.value.window.zoomLevel))

// Methods
const handleZoomIn = () =>
{
  if (settings.value.window.zoomLevel < 200)
  {
    settingsStore.setZoomLevel(Math.min(settings.value.window.zoomLevel + 10, 200))
  }
}

const handleZoomOut = () =>
{
  if (settings.value.window.zoomLevel > 50)
  {
    settingsStore.setZoomLevel(Math.max(settings.value.window.zoomLevel - 10, 50))
  }
}

const handleZoomChange = (event: Event) =>
{
  const target = event.target as HTMLInputElement
  const newZoom = parseInt(target.value)
  settingsStore.setZoomLevel(newZoom)
}

const handleZoomReset = () =>
{
  settingsStore.setZoomLevel(100)
}

const switchView = (view: 'print' | 'web' | 'reading') =>
{
  console.log('Switch view to:', view)
  // TODO: 实现视图切换
}
</script>

<template>
  <div class="status-bar">
    <!-- 左侧信息 -->
    <div class="status-bar__left">
      <div class="status-bar__item">
        <span class="status-bar__label">页</span>
        <span class="status-bar__value">{{ currentPage }} / {{ totalPages }}</span>
      </div>

      <div class="status-bar__separator" />

      <div
        v-if="hasNovel"
        class="status-bar__item"
      >
        <span class="status-bar__label">字符</span>
        <span class="status-bar__value">{{ formatNumber(currentChar) }} / {{ formatNumber(totalChars) }}</span>
      </div>

      <div
        v-if="hasNovel"
        class="status-bar__separator"
      />

      <div
        v-if="hasNovel"
        class="status-bar__item"
      >
        <span class="status-bar__label">字数</span>
        <span class="status-bar__value">{{ formatNumber(wordCount) }}</span>
      </div>

      <div
        v-if="hasNovel"
        class="status-bar__separator"
      />

      <div
        v-if="hasNovel"
        class="status-bar__item"
      >
        <span class="status-bar__label">进度</span>
        <span class="status-bar__value">{{ ((currentPosition / totalChars) * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- 右侧控制 -->
    <div class="status-bar__right">
      <!-- 视图切换 -->
      <div class="status-bar__views">
        <button 
          class="status-bar__view-btn"
          title="页面视图"
          @click="switchView('print')"
        >
          <svg
            class="status-bar__icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M14 14V4.5L9.5 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2zM9.5 3A1.5 1.5 0 0011 4.5h2V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1h5.5v2z" />
          </svg>
        </button>
        <button 
          class="status-bar__view-btn status-bar__view-btn--active"
          title="Web 版式视图"
          @click="switchView('web')"
        >
          <svg
            class="status-bar__icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M0 2a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm15 0V4H1V2a1 1 0 011-1h12a1 1 0 011 1zM1 5h14v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5z" />
          </svg>
        </button>
        <button 
          class="status-bar__view-btn"
          title="阅读视图"
          @click="switchView('reading')"
        >
          <svg
            class="status-bar__icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 000 2.5v11a.5.5 0 00.707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 00.78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0016 13.5v-11a.5.5 0 00-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
          </svg>
        </button>
      </div>

      <div class="status-bar__separator" />

      <!-- 缩放控制 -->
      <div class="status-bar__zoom">
        <button 
          class="status-bar__zoom-btn"
          title="缩小 (Ctrl+-)"
          :disabled="settings.window.zoomLevel <= 50"
          @click="handleZoomOut"
        >
          <svg
            class="status-bar__icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 8a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 014 8z" />
          </svg>
        </button>

        <input 
          type="range"
          class="status-bar__zoom-slider"
          min="50"
          max="200"
          step="10"
          :value="zoomPercentage"
          title="缩放"
          @input="handleZoomChange"
        >

        <button 
          class="status-bar__zoom-value"
          title="重置缩放 (Ctrl+0)"
          @click="handleZoomReset"
        >
          {{ zoomPercentage }}%
        </button>

        <button 
          class="status-bar__zoom-btn"
          title="放大 (Ctrl+=)"
          :disabled="settings.window.zoomLevel >= 200"
          @click="handleZoomIn"
        >
          <svg
            class="status-bar__icon"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* StatusBar 组件样式已在 assets/styles/components/statusbar.css 中定义 */
</style>

