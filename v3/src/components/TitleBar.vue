<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { useNovelStore } from '@/stores/novel'
import { useUIStore } from '@/stores/ui'
import { useWindowControls } from '@/composables/useWindowControls'
import Icon from './Icon.vue'

// Stores
const settingsStore = useSettingsStore()
const novelStore = useNovelStore()
const uiStore = useUIStore()

// Composables
const { minimize, toggleMaximize, close, isMaximized } = useWindowControls()

// Reactive state
const { settings } = storeToRefs(settingsStore)
const searchQuery = ref('')

// Computed
const novelTitle = computed(() => novelStore.currentNovel?.metadata.title || '未命名文档')

// Methods
const toggleAutoSave = () =>
{
  settingsStore.toggleAutoSave()
}

const handleSearchInput = (event: Event) =>
{
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  // TODO: 实现搜索功能
}

const handleUndo = () =>
{
  console.log('Undo')
  // TODO: 实现撤销功能
}

const handleRedo = () =>
{
  console.log('Redo')
  // TODO: 实现重做功能
}

const handleSave = () =>
{
  console.log('Save')
  // TODO: 实现保存功能
}

const toggleRibbonCollapse = () =>
{
  uiStore.toggleRibbonCollapse()
}

// 窗口控制方法
const handleMinimize = () =>
{
  minimize()
}

const handleToggleMaximize = () =>
{
  toggleMaximize()
}

const handleClose = () =>
{
  close()
}
</script>

<template>
  <div
    class="title-bar"
    data-tauri-drag-region
  >
    <!-- 左侧区域 -->
    <div class="title-bar__left">
      <!-- Word 图标 -->
      <div class="title-bar__icon">
        <svg
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="18"
            height="18"
            fill="#2B579A"
            rx="2"
          />
          <path
            d="M4 4h10v10H4z"
            fill="#FFFFFF"
            opacity="0.3"
          />
          <text
            x="9"
            y="13"
            font-family="Segoe UI"
            font-size="11"
            font-weight="bold"
            fill="#FFFFFF"
            text-anchor="middle"
          >W</text>
        </svg>
      </div>

      <!-- 自动保存开关 -->
      <div 
        class="title-bar__autosave" 
        :class="{ 'title-bar__autosave--on': settings.autoSave }"
        @click="toggleAutoSave"
      >
        <div class="title-bar__autosave-toggle" />
        <span>自动保存</span>
      </div>

      <!-- 快速访问工具栏 -->
      <div class="title-bar__quick-access">
        <button 
          class="title-bar__quick-btn" 
          title="保存 (Ctrl+S)"
          @click="handleSave"
        >
          <Icon
            name="save"
            :size="14"
          />
        </button>
        <button 
          class="title-bar__quick-btn" 
          title="撤销 (Ctrl+Z)"
          @click="handleUndo"
        >
          <Icon
            name="undo"
            :size="14"
          />
        </button>
        <button 
          class="title-bar__quick-btn" 
          title="重做 (Ctrl+Y)"
          @click="handleRedo"
        >
          <Icon
            name="redo"
            :size="14"
          />
        </button>
      </div>
    </div>

    <!-- 中间 - 文档标题 -->
    <div class="title-bar__center">
      <div class="title-bar__title">
        {{ novelTitle }}
      </div>
      <div class="title-bar__separator">
        -
      </div>
      <div class="title-bar__app">
        Word
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="title-bar__search">
      <svg
        class="title-bar__search-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
      </svg>
      <input
        type="text"
        class="title-bar__search-input"
        placeholder="搜索"
        :value="searchQuery"
        @input="handleSearchInput"
      >
    </div>

    <!-- 右侧工具 -->
    <div class="title-bar__right">
      <button
        class="title-bar__comment-button"
        title="批注"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V2z" />
        </svg>
      </button>
      <button
        class="title-bar__share-button"
        title="共享"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M13.5 1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-.646 4.854l.646.646a.5.5 0 01-.708.708l-1.5-1.5a.5.5 0 01.708-.708l.146.146V1.5a.5.5 0 011 0v3.646zM12 8a3 3 0 00-2-2.828V3a1 1 0 10-2 0v2.172A3 3 0 006 8v5a3 3 0 006 0V8z" />
        </svg>
        <span>共享</span>
      </button>
    </div>

    <!-- 右上角按钮组 -->
    <div class="title-bar__top-right">
      <!-- 无障碍警告 -->
      <button
        class="title-bar__accessibility-warning"
        title="一些阅读者可能会在阅读此文档时遇到困难"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z" />
        </svg>
      </button>
      <!-- 共享给我 -->
      <div
        class="title-bar__shared-indicator"
        title="共享给我"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm8-7a7 7 0 00-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 008 1z" />
        </svg>
      </div>
      <!-- 功能区显示选项 -->
      <button
        class="title-bar__ribbon-toggle"
        title="功能区显示选项"
        @click="toggleRibbonCollapse"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M2 3h8v1H2V3zm0 2.5h8v1H2v-1zm0 2.5h8v1H2V8z" />
        </svg>
      </button>
      <button
        class="title-bar__help-button"
        title="帮助"
      >
        ?
      </button>
    </div>

    <!-- 窗口控制按钮 -->
    <div class="title-bar__controls">
      <button
        class="title-bar__control-button title-bar__control-button--minimize"
        title="最小化"
        @click="handleMinimize"
      />
      <button
        class="title-bar__control-button title-bar__control-button--maximize"
        :title="isMaximized ? '还原' : '最大化'"
        @click="handleToggleMaximize"
      />
      <button
        class="title-bar__control-button title-bar__control-button--close"
        title="关闭"
        @click="handleClose"
      />
    </div>
  </div>
</template>

<style scoped>
/* TitleBar 组件样式已在 assets/styles/components/titlebar.css 中定义 */
</style>

