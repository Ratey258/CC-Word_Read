<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useUIStore } from '@/stores/ui'
import { useFileImporter } from '@/composables/useFileImporter'
import { useNovelReader } from '@/composables/useNovelReader'
import { useProgress } from '@/composables/useProgress'

// Stores
const novelStore = useNovelStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()

// Composables
const { importFile, importSampleNovel } = useFileImporter()
const { startReading, pauseReading, resumeReading, stopReading, canStartReading } = useNovelReader()
const { saveProgress, jumpToPercentage, resetToStart } = useProgress()

// Reactive state
const { settings } = storeToRefs(settingsStore)
const { hasNovel } = storeToRefs(novelStore)
const { isReading, isPaused } = storeToRefs(readerStore)
const { isRibbonCollapsed } = storeToRefs(uiStore)

const activeTab = ref<'home' | 'insert' | 'design' | 'layout' | 'reference' | 'mailings' | 'review' | 'view'>('home')
const showFileMenu = ref(false)

// Font options
const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]
const fontFamilies = [
  { label: '宋体', value: '宋体' },
  { label: '黑体', value: '黑体' },
  { label: '楷体', value: '楷体' },
  { label: '仿宋', value: '仿宋' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' }
]

// Computed
const canPause = computed(() => isReading.value && !isPaused.value)
const canResume = computed(() => isPaused.value)
const canStop = computed(() => isReading.value || isPaused.value)

// Methods - Tab navigation
const switchTab = (tab: typeof activeTab.value) =>
{
  activeTab.value = tab
  showFileMenu.value = false
  
  // 如果 Ribbon 折叠了，点击标签时展开
  if (isRibbonCollapsed.value)
  {
    uiStore.toggleRibbonCollapse()
  }
}

const toggleFileMenu = () =>
{
  showFileMenu.value = !showFileMenu.value
}

const closeFileMenu = () =>
{
  showFileMenu.value = false
}

// 双击标签折叠/展开 Ribbon
const handleTabDoubleClick = () =>
{
  uiStore.toggleRibbonCollapse()
}

// Methods - File operations
const handleImportFile = async () =>
{
  closeFileMenu()
  await importFile()
}

const handleImportSample = async () =>
{
  closeFileMenu()
  await importSampleNovel()
}

const handleSaveProgress = () =>
{
  closeFileMenu()
  saveProgress()
}

// Methods - Reading control
const handleStartReading = () =>
{
  if (canStartReading.value)
  {
    startReading()
  }
}

const handlePauseReading = () =>
{
  if (canPause.value)
  {
    pauseReading()
  }
}

const handleResumeReading = () =>
{
  if (canResume.value)
  {
    resumeReading()
  }
}

const handleStopReading = () =>
{
  if (canStop.value)
  {
    stopReading()
  }
}

const handleResetPosition = () =>
{
  resetToStart()
}

const handleJumpToPosition = () =>
{
  const input = window.prompt('跳转到百分比位置 (0-100):')
  if (input)
  {
    const percentage = parseFloat(input)
    if (!isNaN(percentage))
    {
      jumpToPercentage(percentage)
    }
  }
}

// Methods - Font styling
const changeFontSize = (size: number) =>
{
  settingsStore.setFontSize(size)
}

const changeFontFamily = (family: string) =>
{
  settingsStore.setFontFamily(family)
}

const increaseFontSize = () =>
{
  const currentIndex = fontSizes.indexOf(settings.value.editor.fontSize)
  if (currentIndex < fontSizes.length - 1)
  {
    changeFontSize(fontSizes[currentIndex + 1])
  }
}

const decreaseFontSize = () =>
{
  const currentIndex = fontSizes.indexOf(settings.value.editor.fontSize)
  if (currentIndex > 0)
  {
    changeFontSize(fontSizes[currentIndex - 1])
  }
}

const toggleBold = () => console.log('Toggle Bold')
const toggleItalic = () => console.log('Toggle Italic')
const toggleUnderline = () => console.log('Toggle Underline')
const toggleStrikethrough = () => console.log('Toggle Strikethrough')
const changeTextColor = () => console.log('Change Text Color')
const changeHighlightColor = () => console.log('Change Highlight Color')
</script>

<template>
  <div 
    class="ribbon"
    :class="{ 'ribbon--collapsed': isRibbonCollapsed }"
  >
    <!-- 标签栏 -->
    <div class="ribbon__tabs">
      <button 
        class="ribbon__tab ribbon__tab--file"
        :class="{ 'ribbon__tab--active': showFileMenu }"
        @click="toggleFileMenu"
        @dblclick="handleTabDoubleClick"
      >
        文件
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'home' && !isRibbonCollapsed }"
        @click="switchTab('home')"
        @dblclick="handleTabDoubleClick"
      >
        开始
      </button>
      <div class="ribbon__officeplus">
        OfficePLUS
      </div>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'insert' && !isRibbonCollapsed }"
        @click="switchTab('insert')"
        @dblclick="handleTabDoubleClick"
      >
        插入
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'design' && !isRibbonCollapsed }"
        @click="switchTab('design')"
        @dblclick="handleTabDoubleClick"
      >
        设计
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'layout' && !isRibbonCollapsed }"
        @click="switchTab('layout')"
        @dblclick="handleTabDoubleClick"
      >
        布局
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'reference' && !isRibbonCollapsed }"
        @click="switchTab('reference')"
        @dblclick="handleTabDoubleClick"
      >
        引用
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'mailings' && !isRibbonCollapsed }"
        @click="switchTab('mailings')"
        @dblclick="handleTabDoubleClick"
      >
        邮件
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'review' && !isRibbonCollapsed }"
        @click="switchTab('review')"
        @dblclick="handleTabDoubleClick"
      >
        审阅
      </button>
      <button 
        class="ribbon__tab"
        :class="{ 'ribbon__tab--active': activeTab === 'view' && !isRibbonCollapsed }"
        @click="switchTab('view')"
        @dblclick="handleTabDoubleClick"
      >
        视图
      </button>
      <button 
        class="ribbon__tab"
        @click="handleImportFile"
        @dblclick="handleTabDoubleClick"
      >
        📖导入
      </button>
    </div>

    <!-- 文件菜单 -->
    <div 
      v-if="showFileMenu" 
      class="file-menu"
      @click.stop
    >
      <div class="file-menu__section">
        <h3 class="file-menu__section-title">
          打开
        </h3>
        <button 
          class="file-menu__item"
          @click="handleImportFile"
        >
          <span class="file-menu__item-icon">📁</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              打开文件
            </div>
            <div class="file-menu__item-description">
              从本地导入 TXT 文本文件
            </div>
          </div>
          <kbd class="file-menu__item-shortcut">Ctrl+O</kbd>
        </button>
        <button 
          class="file-menu__item"
          @click="handleImportSample"
        >
          <span class="file-menu__item-icon">📖</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              加载示例
            </div>
            <div class="file-menu__item-description">
              加载示例小说进行体验
            </div>
          </div>
        </button>
      </div>

      <div class="file-menu__divider" />

      <div class="file-menu__section">
        <h3 class="file-menu__section-title">
          进度
        </h3>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleSaveProgress"
        >
          <span class="file-menu__item-icon">💾</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              保存进度
            </div>
            <div class="file-menu__item-description">
              保存当前阅读进度
            </div>
          </div>
          <kbd class="file-menu__item-shortcut">Ctrl+S</kbd>
        </button>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleJumpToPosition"
        >
          <span class="file-menu__item-icon">🎯</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              跳转位置
            </div>
            <div class="file-menu__item-description">
              跳转到指定阅读位置
            </div>
          </div>
          <kbd class="file-menu__item-shortcut">Ctrl+G</kbd>
        </button>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleResetPosition"
        >
          <span class="file-menu__item-icon">🔄</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              重置位置
            </div>
            <div class="file-menu__item-description">
              回到文件开头
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="ribbon__toolbar">
      <!-- 开始标签内容 -->
      <div
        v-show="activeTab === 'home'"
        class="ribbon__content"
      >
        <!-- 剪贴板组 -->
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <div class="ribbon__clipboard-layout">
              <button
                class="ribbon__button--large"
                title="粘贴 (Ctrl+V)"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
                </svg>
                <span>粘贴</span>
              </button>
              <div class="ribbon__button-stack">
                <button
                  class="ribbon__button--small ribbon__button--stack-text"
                  title="剪切 (Ctrl+X)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5v11A1.5 1.5 0 0 0 6.5 15h3a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V13H6V2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M1 10h1.5v1H1v-1zm13 0h1.5v1H14v-1z" />
                  </svg>
                  <span>剪切</span>
                </button>
                <button
                  class="ribbon__button--small ribbon__button--stack-text"
                  title="复制 (Ctrl+C)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 2H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM3 6H1v9c0 1.1.9 2 2 2h9v-2H3V6z" />
                  </svg>
                  <span>复制</span>
                </button>
                <button
                  class="ribbon__button--small ribbon__button--stack-text"
                  title="格式刷 (Ctrl+Shift+C)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0H4C2.9 0 2 .9 2 2v2c0 1.1.9 2 2 2h2v10h4V6h2c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>格式刷</span>
                </button>
              </div>
            </div>
          </div>
          <div class="ribbon__group-label">
            剪贴板
          </div>
        </div>

        <!-- 字体组 -->
        <div class="ribbon__group ribbon__group--font">
          <div class="ribbon__group-content">
            <div class="ribbon__font-layout">
              <!-- 第一行：字体和字号选择器 -->
              <div class="ribbon__font-row">
                <select 
                  class="ribbon__select ribbon__select--font"
                  :value="settings.editor.fontFamily"
                  @change="changeFontFamily(($event.target as HTMLSelectElement).value)"
                >
                  <option 
                    v-for="font in fontFamilies" 
                    :key="font.value" 
                    :value="font.value"
                    :style="{ fontFamily: font.value }"
                  >
                    {{ font.label }}
                  </option>
                </select>
                
                <!-- 字号控制 -->
                <select 
                  class="ribbon__select ribbon__select--size"
                  :value="settings.editor.fontSize"
                  @change="changeFontSize(Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="size in fontSizes"
                    :key="size"
                    :value="size"
                  >
                    {{ size }}
                  </option>
                </select>
                <button 
                  class="ribbon__font-size-btn"
                  title="增大字号"
                  @click="increaseFontSize"
                >
                  <svg
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3.414 7.657L1.707 5.95 1 6.657l2.707 2.707.707.707L7.07 7.414l-.707-.707-1.707 1.707V4h-1v4.414zm5 .686L11.121 6l1.415 1.414L14.95 5l-1.414-1.414L11.121 6 8.707 3.586 7.293 5l2.414 2.414-2.414 2.414L8.707 11l2.414-2.414z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button 
                  class="ribbon__font-size-btn"
                  title="减小字号"
                  @click="decreaseFontSize"
                >
                  <svg
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3.414 8.343L1.707 10.05 1 9.343l2.707-2.707.707-.707L7.07 8.586l-.707.707-1.707-1.707V12h-1V7.586zm5-.686L11.121 10l1.415-1.414L14.95 11l-1.414 1.414L11.121 10 8.707 12.414 7.293 11l2.414-2.414-2.414-2.414L8.707 5l2.414 2.414z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>

              <!-- 第二行：格式化按钮 -->
              <div class="ribbon__font-row">
                <button 
                  class="ribbon__button--small" 
                  title="粗体 (Ctrl+B)"
                  @click="toggleBold"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.5 11c.83 0 1.5-.67 1.5-1.5 0-.4-.16-.77-.43-1.04.27-.27.43-.64.43-1.04 0-.83-.67-1.5-1.5-1.5H5v7h4.5zM7 7h2.5c.28 0 .5.22.5.5s-.22.5-.5.5H7V7zm2.5 3H7V9h2.5c.28 0 .5.22.5.5s-.22.5-.5.5z" />
                  </svg>
                </button>
                <button 
                  class="ribbon__button--small" 
                  title="斜体 (Ctrl+I)"
                  @click="toggleItalic"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 3v1H8.5l-2 8H8v1H4v-1h1.5l2-8H6V3h4z" />
                  </svg>
                </button>
                <button 
                  class="ribbon__button--small" 
                  title="下划线 (Ctrl+U)"
                  @click="toggleUnderline"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 12c2.21 0 4-1.79 4-4V3h-1v5c0 1.66-1.34 3-3 3S5 9.66 5 8V3H4v5c0 2.21 1.79 4 4 4zm-5 2h10v1H3v-1z" />
                  </svg>
                </button>
                <button 
                  class="ribbon__button--small" 
                  title="删除线"
                  @click="toggleStrikethrough"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14 7H2v1h12V7zM8 3C6.34 3 5 4.34 5 6h1c0-1.1.9-2 2-2s2 .9 2 2c0 .74-.4 1.38-1 1.72v1.1c1.16-.41 2-1.52 2-2.82 0-1.66-1.34-3-3-3zm0 10c1.66 0 3-1.34 3-3h-1c0 1.1-.9 2-2 2s-2-.9-2-2H5c0 1.66 1.34 3 3 3z" />
                  </svg>
                </button>
                <button 
                  class="ribbon__button--small ribbon__button--dropdown" 
                  title="字体颜色"
                  @click="changeTextColor"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 2L4 12h1.5l1-2.5h5l1 2.5H14L10 2H8zm-.5 6l1.5-4 1.5 4h-3z" />
                    <rect
                      x="3"
                      y="13"
                      width="10"
                      height="2"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button 
                  class="ribbon__button--small ribbon__button--dropdown" 
                  title="突出显示颜色"
                  @click="changeHighlightColor"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11.5 1L9 3.5 4.5 8 4 12l4-0.5 4.5-4.5L15 4.5 11.5 1zM10 5l1.5 1.5L7 11l-1.5-1.5L10 5z" />
                    <rect
                      x="1"
                      y="13"
                      width="14"
                      height="2"
                      fill="#FFFF00"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="ribbon__group-label">
            字体
          </div>
        </div>

        <!-- 段落组 -->
        <div class="ribbon__group ribbon__group--paragraph">
          <div class="ribbon__group-content">
            <div class="ribbon__paragraph-layout">
              <!-- 第一行 -->
              <div class="ribbon__paragraph-row">
                <button
                  class="ribbon__button--small"
                  title="项目符号"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="3"
                      cy="4"
                      r="1.5"
                    />
                    <circle
                      cx="3"
                      cy="8"
                      r="1.5"
                    />
                    <circle
                      cx="3"
                      cy="12"
                      r="1.5"
                    />
                    <rect
                      x="6"
                      y="3"
                      width="8"
                      height="2"
                    />
                    <rect
                      x="6"
                      y="7"
                      width="8"
                      height="2"
                    />
                    <rect
                      x="6"
                      y="11"
                      width="8"
                      height="2"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="编号"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <text
                      x="2"
                      y="5"
                      font-size="5"
                    >1.</text>
                    <text
                      x="2"
                      y="9"
                      font-size="5"
                    >2.</text>
                    <text
                      x="2"
                      y="13"
                      font-size="5"
                    >3.</text>
                    <rect
                      x="6"
                      y="3"
                      width="8"
                      height="2"
                    />
                    <rect
                      x="6"
                      y="7"
                      width="8"
                      height="2"
                    />
                    <rect
                      x="6"
                      y="11"
                      width="8"
                      height="2"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="左对齐 (Ctrl+L)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="6"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="9"
                      width="10"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="12"
                      width="6"
                      height="1"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="居中 (Ctrl+E)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="4"
                      y="6"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="3"
                      y="9"
                      width="10"
                      height="1"
                    />
                    <rect
                      x="5"
                      y="12"
                      width="6"
                      height="1"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="右对齐 (Ctrl+R)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="6"
                      y="6"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="4"
                      y="9"
                      width="10"
                      height="1"
                    />
                    <rect
                      x="8"
                      y="12"
                      width="6"
                      height="1"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="两端对齐 (Ctrl+J)"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="6"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="9"
                      width="12"
                      height="1"
                    />
                    <rect
                      x="2"
                      y="12"
                      width="12"
                      height="1"
                    />
                  </svg>
                </button>
              </div>
              <!-- 第二行 -->
              <div class="ribbon__paragraph-row">
                <button
                  class="ribbon__button--small"
                  title="行距"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 2h1v12H2V2zm3 1h9v1H5V3zm0 4h9v1H5V7zm0 4h9v1H5v-1z" />
                    <path d="M13 2v1l1-1 1 1V2l-2-2-2 2zm0 12v-1l1 1 1-1v1l-2 2-2-2z" />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="底纹"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 2h16v12H0V2zm1 1v10h14V3H1z" />
                    <rect
                      x="2"
                      y="4"
                      width="12"
                      height="1"
                      opacity="0.5"
                    />
                    <rect
                      x="2"
                      y="6"
                      width="12"
                      height="1"
                      opacity="0.5"
                    />
                    <rect
                      x="2"
                      y="8"
                      width="12"
                      height="1"
                      opacity="0.5"
                    />
                    <rect
                      x="2"
                      y="10"
                      width="12"
                      height="1"
                      opacity="0.5"
                    />
                    <rect
                      x="2"
                      y="12"
                      width="12"
                      height="1"
                      opacity="0.5"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="边框"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h16v16H0V0zm1 1v14h14V1H1z" />
                    <path
                      d="M8 0v16M0 8h16"
                      stroke="currentColor"
                      stroke-width="1"
                    />
                  </svg>
                </button>
                <div class="ribbon__separator" />
                <button
                  class="ribbon__button--small"
                  title="显示/隐藏编辑标记"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3h10v1H3V3zm0 3h8v1H3V6zm0 3h10v1H3V9zm0 3h8v1H3v-1z" />
                    <circle
                      cx="13"
                      cy="6.5"
                      r="0.8"
                      fill="currentColor"
                    />
                    <circle
                      cx="13"
                      cy="12.5"
                      r="0.8"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="减少缩进"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="6"
                      y="3"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="6"
                      y="7"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="6"
                      y="11"
                      width="8"
                      height="1"
                    />
                    <path d="M4 5L1 8l3 3V5z" />
                  </svg>
                </button>
                <button
                  class="ribbon__button--small"
                  title="增加缩进"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="6"
                      y="3"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="6"
                      y="7"
                      width="8"
                      height="1"
                    />
                    <rect
                      x="6"
                      y="11"
                      width="8"
                      height="1"
                    />
                    <path d="M1 5v6l3-3-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="ribbon__group-label">
            段落
          </div>
        </div>

        <!-- 样式组 -->
        <div class="ribbon__group ribbon__group--styles">
          <div class="ribbon__group-content">
            <div class="ribbon__styles-container">
              <div class="ribbon__styles-gallery">
                <div class="ribbon__style-item ribbon__style-item--active">
                  <span>正文</span>
                </div>
                <div class="ribbon__style-item">
                  <span>无间隔</span>
                </div>
                <div class="ribbon__style-item">
                  <span style="font-weight: 600; font-size: 16px; color: #2f5496">标题 1</span>
                </div>
                <div class="ribbon__style-item">
                  <span style="font-weight: 600; font-size: 14px; color: #2f5496">标题 2</span>
                </div>
                <button
                  class="ribbon__styles-more"
                  title="更多样式"
                >
                  <svg
                    class="icon"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 11l-4-4h8l-4 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="ribbon__group-label">
            样式
          </div>
        </div>

        <!-- 编辑组 -->
        <div class="ribbon__group ribbon__group--editing">
          <div class="ribbon__group-content">
            <div class="ribbon__editing-layout">
              <button
                class="ribbon__button--small ribbon__button--with-text"
                title="查找 (Ctrl+F)"
              >
                <svg
                  class="icon"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.5 11h-.79l-.28-.27C11.41 9.59 12 8.11 12 6.5 12 2.91 9.09 0 5.5 0S-1 2.91-1 6.5 1.91 13 5.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L16.49 16l-4.99-5zm-6 0C3.01 11 1 8.99 1 6.5S3.01 2 5.5 2 10 4.01 10 6.5 8.99 11 5.5 11z" />
                </svg>
                <span>查找</span>
              </button>
              <button
                class="ribbon__button--small ribbon__button--with-text"
                title="替换 (Ctrl+H)"
              >
                <svg
                  class="icon"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 9h8v2H7V9zm0-4h8v2H7V5zm0-4h8v2H7V1zM4 3v4H0V3h4zm-1 3V4H1v2h2z" />
                </svg>
                <span>替换</span>
              </button>
              <button
                class="ribbon__button--small ribbon__button--with-text ribbon__button--with-dropdown"
                title="选择"
              >
                <svg
                  class="icon"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1l4 4V3h6v2H5v6h2V5h6v6h-2v6l-4-4h2V7H3v2H1V1z" />
                </svg>
                <span>选择</span>
                <svg
                  class="dropdown-arrow"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 4l4 4 4-4z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="ribbon__group-label">
            编辑
          </div>
        </div>

        <!-- 论文辅助组 -->
        <div class="ribbon__group ribbon__group--compact">
          <div class="ribbon__group-content">
            <div class="ribbon__row">
              <button
                class="ribbon__button--large"
                title="论文写作"
              >
                <svg
                  class="icon"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.854.146a.5.5 0 00-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 000-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.207l6.5-6.5z" />
                  <path d="M3 9v6h6V9H3zm1 1v4H1.5v-4H4z" />
                </svg>
                <span class="ribbon__button--large-label">论文<br>写作</span>
              </button>
              <button
                class="ribbon__button--large"
                title="论文查重"
              >
                <svg
                  class="icon"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2zM9.5 3A1.5 1.5 0 0011 4.5h2V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1h5.5v2z" />
                </svg>
                <span class="ribbon__button--large-label">论文<br>查重</span>
              </button>
            </div>
          </div>
          <div class="ribbon__group-label">
            论文辅助
          </div>
        </div>

        <!-- PDF工具栏组 -->
        <div class="ribbon__group ribbon__group--compact">
          <div class="ribbon__group-content">
            <button
              class="ribbon__button--large"
              title="转PDF"
            >
              <svg
                class="icon"
                viewBox="0 0 16 16"
                style="color: #d13438;"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14 14V4.5L9.5 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2zM9.5 3A1.5 1.5 0 0011 4.5h2V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1h5.5v2z" />
                <path d="M4.603 14.087a.81.81 0 01-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 011.482-.645 19.697 19.697 0 001.062-2.227 7.269 7.269 0 01-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 01.477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 00.98 1.686 5.753 5.753 0 011.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 01-.354.416.856.856 0 01-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 01-.911-.95 11.651 11.651 0 00-1.997.406 11.307 11.307 0 01-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 01-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 00.035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 00.45-.606z" />
              </svg>
              <span class="ribbon__button--large-label">转<br>PDF</span>
            </button>
          </div>
          <div class="ribbon__group-label">
            PDF工具栏
          </div>
        </div>

        <!-- 加载宏组 -->
        <div class="ribbon__group ribbon__group--compact">
          <div class="ribbon__group-content">
            <button
              class="ribbon__button--large"
              title="加载宏"
            >
              <svg
                class="icon"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z" />
                <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
              </svg>
              <span class="ribbon__button--large-label">加载宏</span>
            </button>
          </div>
          <div class="ribbon__group-label">
            加载宏
          </div>
        </div>

        <!-- 阅读控制组（自定义功能） -->
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <div class="ribbon__row">
              <button
                class="ribbon__button--large"
                :class="{ 'ribbon__button--disabled': !canStartReading }"
                :disabled="!canStartReading"
                title="开始阅读 (F5)"
                @click="handleStartReading"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>开始</span>
              </button>
              <button
                v-if="!isPaused"
                class="ribbon__button--large"
                :class="{ 'ribbon__button--disabled': !canPause }"
                :disabled="!canPause"
                title="暂停阅读 (F6)"
                @click="handlePauseReading"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="6"
                    y="5"
                    width="4"
                    height="14"
                  />
                  <rect
                    x="14"
                    y="5"
                    width="4"
                    height="14"
                  />
                </svg>
                <span>暂停</span>
              </button>
              <button
                v-if="isPaused"
                class="ribbon__button--large"
                :class="{ 'ribbon__button--disabled': !canResume }"
                :disabled="!canResume"
                title="继续阅读 (F6)"
                @click="handleResumeReading"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>继续</span>
              </button>
              <button
                class="ribbon__button--large"
                :class="{ 'ribbon__button--disabled': !canStop }"
                :disabled="!canStop"
                title="停止阅读 (F7)"
                @click="handleStopReading"
              >
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                  />
                </svg>
                <span>停止</span>
              </button>
            </div>
          </div>
          <div class="ribbon__group-label">
            阅读控制
          </div>
        </div>
      </div>

      <!-- 其他标签内容（暂时为空） -->
      <div
        v-show="activeTab === 'insert'"
        class="ribbon__content"
      >
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <p style="padding: 20px; color: var(--word-text-secondary)">
              插入功能开发中...
            </p>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'layout'"
        class="ribbon__content"
      >
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <p style="padding: 20px; color: var(--word-text-secondary)">
              布局功能开发中...
            </p>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'review'"
        class="ribbon__content"
      >
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <p style="padding: 20px; color: var(--word-text-secondary)">
              审阅功能开发中...
            </p>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'view'"
        class="ribbon__content"
      >
        <div class="ribbon__group">
          <div class="ribbon__group-content">
            <p style="padding: 20px; color: var(--word-text-secondary)">
              视图功能开发中...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ribbon 组件样式已在 assets/styles/components/ribbon.css 中定义 */

/* 文件菜单样式 */
.file-menu
{
  position: fixed;
  top: 64px; /* 标题栏高度 + Ribbon 标签高度 */
  left: 0;
  width: 360px;
  max-height: calc(100vh - 64px);
  background-color: var(--word-white);
  border-right: 1px solid var(--word-gray-border);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 100;
  animation: slideInLeft 200ms ease-out;
}

@keyframes slideInLeft
{
  from
  {
    opacity: 0;
    transform: translateX(-20px);
  }
  to
  {
    opacity: 1;
    transform: translateX(0);
  }
}

.file-menu__section
{
  padding: 16px;
}

.file-menu__section-title
{
  font-size: 12px;
  font-weight: 600;
  color: var(--word-text-secondary);
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-left: 8px;
}

.file-menu__item
{
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 150ms;
  text-align: left;
  gap: 12px;
}

.file-menu__item:hover:not(:disabled)
{
  background-color: var(--word-gray-hover);
}

.file-menu__item:active:not(:disabled)
{
  background-color: var(--word-gray-active);
}

.file-menu__item:disabled
{
  opacity: 0.5;
  cursor: not-allowed;
}

.file-menu__item-icon
{
  font-size: 24px;
  flex-shrink: 0;
}

.file-menu__item-content
{
  flex: 1;
  min-width: 0;
}

.file-menu__item-title
{
  font-size: 14px;
  font-weight: 500;
  color: var(--word-text-primary);
  margin-bottom: 2px;
}

.file-menu__item-description
{
  font-size: 12px;
  color: var(--word-text-secondary);
  line-height: 1.4;
}

.file-menu__item-shortcut
{
  font-size: 11px;
  color: var(--word-text-secondary);
  background-color: var(--word-gray-hover);
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid var(--word-gray-border);
  font-family: var(--font-family-ui);
  flex-shrink: 0;
}

.file-menu__divider
{
  height: 1px;
  background-color: var(--word-gray-border);
  margin: 8px 16px;
}

/* Ribbon 按钮禁用状态样式 */
.ribbon__button--disabled
{
  opacity: 0.5;
  cursor: not-allowed;
}

/* 剪贴板组特殊布局 */
.ribbon__row--with-large
{
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.ribbon__button-column
{
  display: flex;
  flex-direction: column;
}

.ribbon__button-stack
{
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: space-between;
}

.ribbon__button--stack
{
  flex: 1;
  min-height: 0;
  padding: 4px 8px !important;
  font-size: 11px !important;
}

.ribbon__button--stack .icon
{
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.ribbon__button--stack span
{
  font-size: 11px;
}

/* 垂直按钮行布局 */
.ribbon__row--vertical
{
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ribbon__row--vertical .ribbon__button--small
{
  justify-content: flex-start;
  text-align: left;
}

.ribbon__row--vertical .ribbon__button--small .icon
{
  margin-right: 8px;
}
</style>

