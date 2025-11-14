<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useUIStore } from '@/stores/ui'
import { useHistoryStore } from '@/stores/history'
import { useFileImporter } from '@/composables/useFileImporter'
import { useNovelReader } from '@/composables/useNovelReader'
import { useHistory } from '@/composables/useHistory'
import type { HistoryItem } from '@/types/history'
import RenameDialog from './RenameDialog.vue'
import ChapterDialog from './ChapterDialog.vue'

// Stores
const novelStore = useNovelStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()
const historyStore = useHistoryStore()

// Composables
const { importFile, importSampleNovel } = useFileImporter()
const { startReading, pauseReading, resumeReading, stopReading, canStartReading } = useNovelReader()
const { recentItems, hasHistory, loadFromHistory, clearAllHistory, formatTime, formatFileSize, getFormatIcon } = useHistory()

// 调试：监视历史记录变化
watch(hasHistory, (newVal) => {
  console.log('[Ribbon] hasHistory changed:', newVal)
  console.log('[Ribbon] recentItems:', recentItems.value)
}, { immediate: true })

watch(recentItems, (newVal) => {
  console.log('[Ribbon] recentItems changed:', newVal?.length, 'items')
}, { immediate: true })

// 键盘快捷键处理
function handleKeyboardShortcuts(event: KeyboardEvent): void {
  // Ctrl + 左箭头：上一章节
  if (event.ctrlKey && event.key === 'ArrowLeft' && hasChapters.value) {
    event.preventDefault()
    novelStore.jumpToPrevChapter()
  }
  // Ctrl + 右箭头：下一章节
  else if (event.ctrlKey && event.key === 'ArrowRight' && hasChapters.value) {
    event.preventDefault()
    novelStore.jumpToNextChapter()
  }
  // Ctrl + Shift + C：打开章节目录
  else if (event.ctrlKey && event.shiftKey && event.key === 'C' && hasChapters.value) {
    event.preventDefault()
    handleShowChapters()
  }
}

onMounted(() => {
  console.log('[Ribbon] Component mounted')
  console.log('[Ribbon] hasHistory:', hasHistory.value)
  console.log('[Ribbon] recentItems:', recentItems.value)
  console.log('[Ribbon] historyStore.historyItems:', historyStore.historyItems)
  
  // 尝试手动重新加载历史记录
  if (!hasHistory.value) {
    console.log('[Ribbon] No history found, attempting to reload...')
    historyStore.loadFromStorage()
  }
  
  // 添加键盘快捷键监听
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})

// Reactive state
const { settings } = storeToRefs(settingsStore)
const { hasNovel, hasChapters } = storeToRefs(novelStore)
const { isReading, isPaused } = storeToRefs(readerStore)
const { isRibbonCollapsed } = storeToRefs(uiStore)

const showFileMenu = ref(false)
const showRenameDialog = ref(false)
const showChapterDialog = ref(false)

const lineSpacingPresets = [
  { label: '1 倍行距', value: 1 },
  { label: '1.5 倍行距', value: 1.5 }
]

const LINE_HEIGHT_MIN = 0.8
const LINE_HEIGHT_MAX = 4

const currentLineHeight = computed(() => Number(settings.value.editor.lineHeight.toFixed(2)))
const customLineHeight = ref(currentLineHeight.value.toFixed(1))

watch(() => settings.value.editor.lineHeight, (val) => {
  customLineHeight.value = val.toFixed(1)
})

// Font options
const fontSizes = [10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28]
const fontFamilies = [
  { label: 'Calibri', value: 'Calibri, "Microsoft YaHei", "Segoe UI", sans-serif' },
  { label: '宋体', value: '宋体' },
  { label: '黑体', value: '黑体' },
  { label: '楷体', value: '楷体' },
  { label: '仿宋', value: '仿宋' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' }
]

// Computed
const canPause = computed(() => isReading.value && !isPaused.value)
const canResume = computed(() => isPaused.value)
const canStop = computed(() => isReading.value || isPaused.value)

// Methods - Tab navigation
const switchTab = (tab: string) => {
  // 不再实际切换标签，只是提供视觉反馈
  showFileMenu.value = false
  
  // 如果 Ribbon 折叠了，点击标签时展开
  if (isRibbonCollapsed.value) {
    uiStore.toggleRibbonCollapse()
  }
  
  // 可以在这里添加其他逻辑，比如日志记录
  console.log(`Tab clicked: ${tab}`)
}

const toggleFileMenu = () => {
  showFileMenu.value = !showFileMenu.value
}

const closeFileMenu = () => {
  showFileMenu.value = false
}

// 双击标签折叠/展开 Ribbon
const handleTabDoubleClick = () => {
  uiStore.toggleRibbonCollapse()
}

// Methods - File operations
const handleImportFile = async () => {
  closeFileMenu()
  await importFile()
}

const handleImportSample = async () => {
  closeFileMenu()
  await importSampleNovel()
}

// Methods - Reading control
// 合并的开始/暂停切换按钮
const handleToggleReading = () => {
  if (!isReading.value) {
    // 未开始阅读，启动阅读
    if (canStartReading.value) {
      startReading()
    }
  } else if (isPaused.value) {
    // 已暂停，继续阅读
    if (canResume.value) {
      resumeReading()
    }
  } else {
    // 正在阅读，暂停
    if (canPause.value) {
      pauseReading()
    }
  }
}

// 计算切换按钮的状态
const toggleButtonState = computed(() => {
  if (!isReading.value) {
    return {
      icon: 'play',
      label: '开始',
      title: '开始阅读 (F5)',
      disabled: !canStartReading.value
    }
  } else if (isPaused.value) {
    return {
      icon: 'play',
      label: '继续',
      title: '继续阅读 (F6)',
      disabled: !canResume.value
    }
  } else {
    return {
      icon: 'pause',
      label: '暂停',
      title: '暂停阅读 (F6)',
      disabled: !canPause.value
    }
  }
})

const handleStopReading = () => {
  if (canStop.value) {
    stopReading()
  }
}

const handleRenameDisplay = () => {
  closeFileMenu()
  showRenameDialog.value = true
}

const handleShowAllContent = () => {
  if (!hasNovel.value) {
    uiStore.showWarning('请先导入文件后再显示内容')
    return
  }

  closeFileMenu()
  window.dispatchEvent(new CustomEvent('show-all-content'))
}

const handleAddBookmark = () => {
  window.dispatchEvent(new CustomEvent('add-bookmark'))
  closeFileMenu()
}

const handleShowBookmarks = () => {
  window.dispatchEvent(new CustomEvent('show-bookmarks'))
  closeFileMenu()
}

const handleSetLineHeight = (value: number) => {
  settingsStore.setLineHeight(value)
  uiStore.showSuccess(`行距已设置为 ${value.toFixed(1)} 倍`)
}

const handleApplyCustomLineHeight = () => {
  const value = Number(customLineHeight.value)
  if (Number.isNaN(value) || value < LINE_HEIGHT_MIN || value > LINE_HEIGHT_MAX) {
    uiStore.showWarning(`请输入 ${LINE_HEIGHT_MIN} - ${LINE_HEIGHT_MAX} 之间的行距倍数`)
    return
  }

  settingsStore.setLineHeight(value)
  uiStore.showSuccess(`行距已设置为 ${value.toFixed(1)} 倍`)
}

const handleCheckUpdates = () => {
  window.dispatchEvent(new CustomEvent('check-updates'))
  closeFileMenu()
}

const handleShowAbout = () => {
  window.dispatchEvent(new CustomEvent('show-about'))
  closeFileMenu()
}

const handleRenameConfirm = (newName: string) => {
  novelStore.setDisplayName(newName)
}


// Methods - History
const handleLoadFromHistory = async (item: HistoryItem) => {
  console.log('[Ribbon] 点击历史记录项:', item.title)
  closeFileMenu()
  await loadFromHistory(item)
  console.log('[Ribbon] 历史记录加载完成')
}

const handleClearHistory = () => {
  clearAllHistory()
}

// Methods - Chapter navigation
const handleShowChapters = () => {
  showChapterDialog.value = true
  closeFileMenu()
}

const handleCloseChapters = () => {
  showChapterDialog.value = false
}

const handleChapterSelect = (chapterIndex: number) => {
  novelStore.jumpToChapter(chapterIndex)
  showChapterDialog.value = false
}

// Methods - Font styling
const changeFontSize = (size: number) => {
  settingsStore.setFontSize(size)
}

const changeFontFamily = (family: string) => {
  settingsStore.setFontFamily(family)
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
        class="ribbon__tab ribbon__tab--active"
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
        @click="switchTab('insert')"
        @dblclick="handleTabDoubleClick"
      >
        插入
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('design')"
        @dblclick="handleTabDoubleClick"
      >
        设计
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('layout')"
        @dblclick="handleTabDoubleClick"
      >
        布局
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('reference')"
        @dblclick="handleTabDoubleClick"
      >
        引用
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('mailings')"
        @dblclick="handleTabDoubleClick"
      >
        邮件
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('review')"
        @dblclick="handleTabDoubleClick"
      >
        审阅
      </button>
      <button 
        class="ribbon__tab"
        @click="switchTab('view')"
        @dblclick="handleTabDoubleClick"
      >
        视图
      </button>
      <button 
        class="ribbon__tab"
        style="display: none;"
        @click="handleImportFile"
        @dblclick="handleTabDoubleClick"
      >
        📖导入
      </button>

      <!-- 右侧按钮组 -->
      <div class="ribbon__tabs-right">
        <button
          class="ribbon__action-button"
          title="批注"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 3.5C4 2.67157 4.67157 2 5.5 2H14.5C15.3284 2 16 2.67157 16 3.5V12.5C16 13.3284 15.3284 14 14.5 14H8L4 18V3.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
          <span>批注</span>
        </button>
        <button
          class="ribbon__action-button ribbon__action-button--edit"
          title="编辑"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.502 1.94a2.5 2.5 0 0 1 3.535 3.535L7 17.5H2v-5L13.502 1.94Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>编辑</span>
        </button>
        <button
          class="ribbon__action-button ribbon__action-button--share"
          title="共享"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 3l-1.5 1.5L11 7H4v2h7l-2.5 2.5L10 13l5-5-5-5zm-6 9v5h12v-5h2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5h2z" />
          </svg>
          <span>共享</span>
        </button>
      </div>
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
              支持 TXT、Word (.docx)、Markdown 格式，完美保留原文档格式
            </div>
          </div>
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
              加载示例文件进行体验
            </div>
          </div>
        </button>
      </div>

      <div class="file-menu__divider"></div>

      <!-- 最近打开 -->
      <div 
        v-if="hasHistory"
        class="file-menu__section"
      >
        <div class="file-menu__section-header">
          <h3 class="file-menu__section-title">
            最近打开
          </h3>
          <button
            class="file-menu__clear-button"
            title="清空历史"
            @click="handleClearHistory"
          >
            清空
          </button>
        </div>
        <div class="file-menu__recent-list">
          <button
            v-for="item in recentItems"
            :key="item.id"
            class="file-menu__recent-item"
            @click="handleLoadFromHistory(item)"
          >
            <span class="file-menu__recent-icon">{{ getFormatIcon(item.format) }}</span>
            <div class="file-menu__recent-content">
              <div class="file-menu__recent-title">
                {{ item.title }}
              </div>
              <div class="file-menu__recent-meta">
                <span class="file-menu__recent-progress">{{ Math.round(item.progress.percentage) }}%</span>
                <span class="file-menu__recent-divider">•</span>
                <span class="file-menu__recent-time">{{ formatTime(item.lastAccessedAt) }}</span>
                <span class="file-menu__recent-divider">•</span>
                <span class="file-menu__recent-size">{{ formatFileSize(item.fileSize) }}</span>
              </div>
            </div>
            <div
              v-if="item.isCompleted"
              class="file-menu__recent-badge"
              title="已完成"
            >
              ✓
            </div>
          </button>
        </div>
      </div>


      <div class="file-menu__section">
        <h3 class="file-menu__section-title">
          书签
        </h3>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleAddBookmark"
        >
          <span class="file-menu__item-icon">🔖</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              添加书签
            </div>
            <div class="file-menu__item-description">
              为当前阅读位置添加书签标记
            </div>
          </div>
        </button>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleShowBookmarks"
        >
          <span class="file-menu__item-icon">📚</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              查看书签
            </div>
            <div class="file-menu__item-description">
              查看和管理已保存的书签
            </div>
          </div>
        </button>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel || !hasChapters"
          @click="handleShowChapters"
        >
          <span class="file-menu__item-icon">📋</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              章节目录
            </div>
            <div class="file-menu__item-description">
              查看章节列表并快速跳转到指定章节
            </div>
          </div>
        </button>
      </div>

      <div class="file-menu__divider"></div>

      <div class="file-menu__section">
        <h3 class="file-menu__section-title">
          显示
        </h3>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleShowAllContent"
        >
          <span class="file-menu__item-icon">🧾</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              显示全部内容
            </div>
            <div class="file-menu__item-description">
              无需输入，直接显示已导入文件内容
            </div>
          </div>
        </button>
        <div class="file-menu__subsection">
          <div class="file-menu__subsection-header">
            <span>行距</span>
            <span class="file-menu__subsection-tip">当前：{{ currentLineHeight.toFixed(1) }} 倍</span>
          </div>
          <div class="line-spacing-options">
            <button
              v-for="option in lineSpacingPresets"
              :key="option.value"
              class="line-spacing-options__button"
              :class="{ 'line-spacing-options__button--active': Math.abs(option.value - currentLineHeight) < 0.05 }"
              @click="handleSetLineHeight(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
          <div class="line-spacing-custom">
            <label class="line-spacing-custom__label" for="custom-line-height">自定义倍数</label>
            <div class="line-spacing-custom__controls">
              <input
                id="custom-line-height"
                v-model="customLineHeight"
                type="number"
                class="line-spacing-custom__input"
                step="0.1"
                :min="LINE_HEIGHT_MIN"
                :max="LINE_HEIGHT_MAX"
              />
              <button class="line-spacing-custom__apply" @click="handleApplyCustomLineHeight">
                应用
              </button>
            </div>
            <p class="line-spacing-custom__hint">范围：{{ LINE_HEIGHT_MIN }} - {{ LINE_HEIGHT_MAX }} 倍</p>
          </div>
        </div>
        <button 
          class="file-menu__item"
          :disabled="!hasNovel"
          @click="handleRenameDisplay"
        >
          <span class="file-menu__item-icon">✏️</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              修改显示文件名
            </div>
            <div class="file-menu__item-description">
              自定义标题栏中显示的文件名
            </div>
          </div>
        </button>
      </div>

      <div class="file-menu__divider"></div>

      <div class="file-menu__section">
        <h3 class="file-menu__section-title">
          应用
        </h3>
        <button 
          class="file-menu__item"
          @click="handleCheckUpdates"
        >
          <span class="file-menu__item-icon">🔄</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              检查更新
            </div>
            <div class="file-menu__item-description">
              检查并安装应用程序更新
            </div>
          </div>
        </button>
        <button 
          class="file-menu__item"
          @click="handleShowAbout"
        >
          <span class="file-menu__item-icon">ℹ️</span>
          <div class="file-menu__item-content">
            <div class="file-menu__item-title">
              关于
            </div>
            <div class="file-menu__item-description">
              查看应用版本和作者信息
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="ribbon__toolbar">
      <!-- 开始标签内容 - 始终显示 -->
      <div class="ribbon__content">
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
              </div>

              <!-- 第二行：格式化按钮 -->
              <div class="ribbon__font-row">
                <button 
                  class="ribbon__button--small ribbon__button--bold" 
                  title="粗体 (Ctrl+B)"
                  @click="toggleBold"
                >
                  <span class="ribbon__text-icon">B</span>
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
                <div class="ribbon__separator"></div>
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

        <!-- 论文助手组 -->
        <div class="ribbon__group ribbon__group--compact">
          <div class="ribbon__group-content">
            <div class="ribbon__row">
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
                <span class="ribbon__button--large-label">论文查重</span>
              </button>
            </div>
          </div>
          <div class="ribbon__group-label">
            论文助手
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
              <span class="ribbon__button--large-label">转PDF</span>
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
                :class="{ 'ribbon__button--disabled': toggleButtonState.disabled }"
                :disabled="toggleButtonState.disabled"
                :title="toggleButtonState.title"
                @click="handleToggleReading"
              >
                <svg
                  v-if="toggleButtonState.icon === 'play'"
                  class="icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg
                  v-else
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
                <span>{{ toggleButtonState.label }}</span>
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
    </div>
  </div>

  <!-- 重命名对话框 -->
  <RenameDialog
    v-model:show="showRenameDialog"
    @confirm="handleRenameConfirm"
  />

  <!-- 章节目录对话框 -->
  <ChapterDialog
    :show="showChapterDialog"
    @close="handleCloseChapters"
    @select="handleChapterSelect"
  />
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

.file-menu__section-header
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 8px;
}

.file-menu__section-title
{
  font-size: 12px;
  font-weight: 600;
  color: var(--word-text-secondary);
  text-transform: uppercase;
  margin: 0;
}

.file-menu__clear-button
{
  font-size: 11px;
  color: var(--word-text-secondary);
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 150ms;
}

.file-menu__clear-button:hover
{
  background: var(--word-gray-hover);
  color: var(--word-text-primary);
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

.file-menu__subsection
{
  margin-top: 8px;
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  background-color: var(--word-gray-surface);
}

.file-menu__subsection-header
{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--word-text-secondary);
  margin-bottom: 8px;
}

.file-menu__subsection-tip
{
  font-size: 12px;
  color: var(--word-text-tertiary);
}

.line-spacing-options
{
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.line-spacing-options__button
{
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--word-gray-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--word-white);
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms;
}

.line-spacing-options__button--active
{
  border-color: var(--word-accent);
  background-color: rgba(43, 87, 154, 0.08);
  color: var(--word-accent);
}

.line-spacing-custom
{
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.line-spacing-custom__label
{
  font-size: 12px;
  color: var(--word-text-secondary);
}

.line-spacing-custom__controls
{
  display: flex;
  gap: 8px;
}

.line-spacing-custom__input
{
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--word-gray-border);
  border-radius: var(--border-radius-sm);
  font-size: 13px;
}

.line-spacing-custom__apply
{
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  border: none;
  background-color: var(--word-accent);
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.line-spacing-custom__hint
{
  margin: 0;
  font-size: 11px;
  color: var(--word-text-tertiary);
}

/* 历史记录列表样式 */
.file-menu__recent-list
{
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.file-menu__recent-item
{
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 150ms;
  text-align: left;
  gap: 10px;
  position: relative;
}

.file-menu__recent-item:hover
{
  background-color: var(--word-gray-hover);
}

.file-menu__recent-icon
{
  font-size: 18px;
  flex-shrink: 0;
}

.file-menu__recent-content
{
  flex: 1;
  min-width: 0;
}

.file-menu__recent-title
{
  font-size: 13px;
  font-weight: 500;
  color: var(--word-text-primary);
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-menu__recent-meta
{
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--word-text-tertiary);
}

.file-menu__recent-progress
{
  font-weight: 600;
  color: var(--word-accent);
}

.file-menu__recent-divider
{
  opacity: 0.5;
}

.file-menu__recent-time,
.file-menu__recent-size
{
  white-space: nowrap;
}

.file-menu__recent-badge
{
  width: 20px;
  height: 20px;
  background: var(--word-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
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

