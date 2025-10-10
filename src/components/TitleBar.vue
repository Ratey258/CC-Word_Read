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
const { minimize, toggleMaximize, close, isMaximized, supportsWindowControls } = useWindowControls()

// Reactive state
const { settings } = storeToRefs(settingsStore)
const { displayName } = storeToRefs(novelStore)
const searchQuery = ref('')

// Computed
const novelTitle = computed(() => displayName.value)

// Methods
const toggleAutoSave = () => {
  settingsStore.toggleAutoSave()
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  // TODO: 实现搜索功能
}

const handleUndo = () => {
  console.log('Undo')
  // TODO: 实现撤销功能
}

const handleRedo = () => {
  console.log('Redo')
  // TODO: 实现重做功能
}

const handleSave = () => {
  console.log('Save')
  // TODO: 实现保存功能
}

const toggleRibbonCollapse = () => {
  uiStore.toggleRibbonCollapse()
}

// 窗口控制方法
const handleMinimize = () => {
  console.log('🔘 [TitleBar] 点击最小化按钮')
  minimize()
}

const handleToggleMaximize = () => {
  console.log('🔘 [TitleBar] 点击最大化按钮')
  toggleMaximize()
}

const handleClose = async () => {
  console.log('🔘 [TitleBar] 点击关闭按钮')
  console.log('🔘 [TitleBar] supportsWindowControls:', supportsWindowControls.value)
  try {
    await close()
    console.log('🔘 [TitleBar] 关闭函数执行完毕')
  } catch (error) {
    console.error('🔘 [TitleBar] 关闭失败:', error)
  }
}
</script>

<template>
  <div
    class="title-bar"
  >
    <!-- 左侧区域 -->
    <div 
      class="title-bar__left"
      data-tauri-drag-region
    >
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
        <!-- 保存按钮 -->
        <button 
          class="title-bar__quick-btn" 
          title="保存 (Ctrl+S)"
          @click="handleSave"
        >
          <Icon
            name="save"
            :size="16"
          />
        </button>
        
        <!-- 撤销按钮 -->
        <button 
          class="title-bar__quick-btn" 
          title="撤销 (Ctrl+Z)"
          @click="handleUndo"
        >
          <Icon
            name="undo"
            :size="16"
          />
        </button>
        
        <!-- 重做按钮 -->
        <button 
          class="title-bar__quick-btn" 
          title="重做 (Ctrl+Y)"
          @click="handleRedo"
        >
          <Icon
            name="redo"
            :size="16"
          />
        </button>
      </div>

      <!-- 文档标题 -->
      <div class="title-bar__document-name">
        {{ novelTitle }}
      </div>
    </div>

    <!-- 中间 - 搜索框 -->
    <div 
      class="title-bar__center"
      data-tauri-drag-region
    >
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
    </div>

    <!-- 右上角按钮组 -->
    <div 
      class="title-bar__top-right"
      data-tauri-drag-region
    >
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
    <div 
      class="title-bar__controls"
    >
      <button
        class="title-bar__control-button title-bar__control-button--minimize"
        :title="supportsWindowControls ? '最小化' : '最小化（浏览器模式不支持）'"
        :class="{ 'title-bar__control-button--disabled': !supportsWindowControls }"
        data-tauri-drag-region="false"
        @click="handleMinimize"
      >
        <!-- 最小化图标 -->
      </button>
      <button
        class="title-bar__control-button title-bar__control-button--maximize"
        :title="supportsWindowControls ? (isMaximized ? '还原' : '最大化') : '全屏（按 F11 退出）'"
        data-tauri-drag-region="false"
        @click="handleToggleMaximize"
      >
        <!-- 最大化图标 -->
      </button>
      <button
        class="title-bar__control-button title-bar__control-button--close"
        :title="supportsWindowControls ? '关闭' : '关闭标签页'"
        data-tauri-drag-region="false"
        @click="handleClose"
      >
        <!-- 关闭图标 -->
      </button>
    </div>
  </div>
</template>

<style scoped>
/* TitleBar 组件样式已在 assets/styles/components/titlebar.css 中定义 */
</style>

