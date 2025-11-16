<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useUIStore } from '@/stores/ui'
import { useNovelReader } from '@/composables/useNovelReader'
import { usePageCalculator } from '@/composables/usePageCalculator'
import { useEditorScroll } from '@/composables/useEditorScroll'
import {
  restoreEditorContent,
  getEditorTextContent,
  clearEditorContent,
  isEditorEmpty
} from '@/utils/editorHelper'
import { moveCursorToEnd } from '@/utils/cursor'
import { throttle } from 'lodash-es'
import { on, off } from '@/services/eventBus'
import { createLogger } from '@/services/logger'
import { UI } from '@/utils/constants'

const logger = createLogger('Editor')

// Stores
const novelStore = useNovelStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()

// Refs
const pageRef = ref<HTMLDivElement>()

// Reactive state
const { currentNovel, isRestoringFromHistory } = storeToRefs(novelStore)
const { isReading } = storeToRefs(readerStore)
const { settings } = storeToRefs(settingsStore)
const { isRibbonCollapsed } = storeToRefs(uiStore)

// Composables
const { 
  editorRef,
  startReading,
  handleKeyDown,
  handleBeforeInput,
  handleCompositionStart,
  handleCompositionUpdate,
  handleCompositionEnd,
  clearEditor
} = useNovelReader()

// 页码计算器
const { totalPages } = usePageCalculator()

// 编辑器滚动
const { scrollToContentEnd, scrollCursorIntoView } = useEditorScroll(editorRef)

// Computed
const hasNovel = computed(() => currentNovel.value !== null)

const editorStyles = computed(() => ({
  fontSize: `${settings.value.editor.fontSize}px`,
  fontFamily: settings.value.editor.fontFamily,
  lineHeight: settings.value.editor.lineHeight.toString()
}))

const pageStyles = computed(() => {
  // 根据页数计算最小高度
  // 确保至少显示1页的高度，并额外添加一页的缓冲空间以便输入时自动扩展
  const pages = Math.max(totalPages.value, 1)
  const minHeight = UI.A4_HEIGHT * (pages + 1) // 额外添加1页空间
  
  return {
    page: {
      width: `${UI.A4_WIDTH}px`,
      minHeight: `${minHeight}px`,
      // 使用 auto 高度允许内容自动扩展
      height: 'auto'
    }
  }
})

function handleSelectionChange(): void {
  // 阅读模式下，滚动由内容输出逻辑控制，这里不再额外触发，避免干扰
  if (isReading.value) return

  const editor = editorRef.value
  if (!editor) return
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const anchorNode = selection.anchorNode
  if (anchorNode && editor.contains(anchorNode)) {
    scrollCursorIntoView({ immediate: true })
  }
}

function focusEditorAtPoint(clientX: number, clientY: number): void {
  const editor = editorRef.value
  if (!editor) return

  editor.focus({ preventScroll: true })

  const caretPosition = document.caretPositionFromPoint?.(clientX, clientY)
  const selection = window.getSelection()

  if (caretPosition && caretPosition.offsetNode && editor.contains(caretPosition.offsetNode)) {
    const range = document.createRange()
    range.setStart(caretPosition.offsetNode, caretPosition.offset)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else if (document.caretRangeFromPoint) {
    const rangeFromPoint = document.caretRangeFromPoint(clientX, clientY)
    if (rangeFromPoint && editor.contains(rangeFromPoint.startContainer)) {
      selection?.removeAllRanges()
      selection?.addRange(rangeFromPoint)
    } else {
      moveCursorToEnd(editor)
    }
  } else {
    moveCursorToEnd(editor)
  }

  scrollCursorIntoView({ immediate: true })
}

function handlePageMouseDown(event: MouseEvent): void {
  const editor = editorRef.value
  if (!editor) return
  const target = event.target as Node

  if (editor.contains(target)) {
    return
  }

  event.preventDefault()
  focusEditorAtPoint(event.clientX, event.clientY)
}

// 计算编辑器容器顶部位置（根据 Ribbon 折叠状态）
const containerStyles = computed(() => {
  const topOffset = isRibbonCollapsed.value
    ? UI.TITLEBAR_HEIGHT + UI.RIBBON_TAB_HEIGHT
    : UI.TITLEBAR_HEIGHT + UI.RIBBON_TAB_HEIGHT + UI.RIBBON_TOOLBAR_HEIGHT
  
  return {
    top: `${topOffset}px`
  }
})

// 监听编辑器内容变化，同步到 store
function updateEditorContentLength(): void {
  if (editorRef.value) {
    const length = editorRef.value.textContent?.length || 0
    novelStore.updateEditorContentLength(length)
  }
}

// 注意：scrollToContentEnd 已通过 useEditorScroll composable 提供

// 使用 MutationObserver 监听编辑器内容变化
let editorObserver: globalThis.MutationObserver | null = null

function setupEditorObserver(): void {
  if (!editorRef.value) return
  
  // 清理旧的观察器
  if (editorObserver) {
    editorObserver.disconnect()
  }
  
  // 节流更新函数：最多每 100ms 执行一次
  const throttledUpdate = throttle(() => {
    updateEditorContentLength()
    globalThis.requestAnimationFrame(() => {
      if (isReading.value) {
        // 阅读模式：按内容末尾滚动，适合自动输出小说时的视图跟随
        scrollToContentEnd()
      } else {
        // 非阅读模式：按光标位置滚动，更接近 Word 的编辑体验
        scrollCursorIntoView({ immediate: true })
      }
    })
  }, 100, {
    leading: true,   // 首次立即执行
    trailing: true   // 停止后再执行最后一次
  })
  
  // 创建新的观察器
  editorObserver = new globalThis.MutationObserver(throttledUpdate)
  
  // 观察编辑器的所有子节点变化和文本内容变化
  editorObserver.observe(editorRef.value, {
    childList: true,
    characterData: true,
    subtree: true
  })
  
  // 初始化时更新一次
  updateEditorContentLength()
}

// 监听小说加载
watch(currentNovel, (novel, oldNovel) => {
  logger.debug('watch 触发', {
    novelId: novel?.id,
    oldNovelId: oldNovel?.id,
    isRestoring: isRestoringFromHistory.value
  })
  
  if (novel && editorRef.value) {
    // 如果正在从历史记录恢复，不清空编辑器
    // 因为 useHistory 会在加载后手动恢复已读内容
    if (isRestoringFromHistory.value) {
      logger.debug('正在从历史记录恢复，跳过清空编辑器')
      editorRef.value.focus()
      updateEditorContentLength()
      return
    }
    
    // 如果是新加载的小说（不是刷新页面恢复的），清空编辑器
    // 判断依据：旧小说为null或者小说ID不同
    const isNewNovel = !oldNovel || oldNovel.id !== novel.id
    
    if (isNewNovel) {
      logger.debug('加载新小说，清空编辑器')
      // 清空编辑器并聚焦
      clearEditorContent(editorRef.value)
      editorRef.value.focus()
      // 更新内容长度
      updateEditorContentLength()
    } else {
      logger.debug('同一本小说，保持编辑器内容')
      // 同一本小说，可能是位置更新，不清空内容
      editorRef.value.focus()
      // 更新内容长度
      updateEditorContentLength()
    }
  }
})

// 监听清空编辑器事件
function handleClearEditorEvent(): void {
  clearEditor()
}

// 直接展示全文
function revealAllContent(): void {
  if (!editorRef.value || !currentNovel.value) {
    uiStore.showWarning('当前没有可显示的内容')
    return
  }

  const novelText = currentNovel.value.content
  if (!novelText) {
    uiStore.showWarning('当前小说内容为空')
    return
  }

  restoreEditorContent(editorRef.value, novelText, true)
  updateEditorContentLength()
  novelStore.updatePosition(novelText.length)
  readerStore.stopReading()
  uiStore.showSuccess('已显示全文，可直接开始阅读')
}

function handleShowAllContentEvent(): void {
  revealAllContent()
}

const handleAutoStart = (event: KeyboardEvent) => {
  if (hasNovel.value && !isReading.value) {
    if (!['Control', 'Shift', 'Alt', 'Meta', 'Tab', 'Escape'].includes(event.key) &&
        !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault()
      startReading()
    }
  }
}

// Lifecycle
onMounted(() => {
  logger.info('编辑器组件已挂载')
  
  // 使用事件总线监听事件
  on('editor:clear', handleClearEditorEvent)
  on('editor:showAll', handleShowAllContentEvent)
  
  if (editorRef.value) {
    editorRef.value.focus()
    
    // 设置编辑器观察器
    setupEditorObserver()
    
    // 等待一小段时间，确保 store 的 loadFromStorage() 已经完成
    // 这样可以确保 currentPosition 已经从 localStorage 恢复
    setTimeout(() => {
      // 如果刷新页面后有小说和阅读位置，恢复已读内容
      if (editorRef.value && currentNovel.value && novelStore.currentPosition > 0) {
        // 检查编辑器是否已经有内容（可能已经被 watch 或其他地方恢复了）
        const currentContent = getEditorTextContent(editorRef.value)
        
        // 只在编辑器为空或内容不匹配时才恢复
        if (isEditorEmpty(editorRef.value) || currentContent.length !== novelStore.currentPosition) {
          const readContent = currentNovel.value.content.substring(0, novelStore.currentPosition)
          restoreEditorContent(editorRef.value, readContent, true)
          logger.info('页面刷新，已恢复已读内容', { length: readContent.length })
          
          // 更新内容长度
          updateEditorContentLength()
        } else {
          logger.debug('编辑器内容已存在，跳过恢复')
        }
      }
    }, 100) // 延迟100ms，确保异步加载完成
  }
  
  document.addEventListener('keydown', handleAutoStart)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  // 清理事件总线监听器
  off('editor:clear', handleClearEditorEvent)
  off('editor:showAll', handleShowAllContentEvent)
  
  // 清理 DOM 事件监听器
  document.removeEventListener('keydown', handleAutoStart)
  document.removeEventListener('selectionchange', handleSelectionChange)
  
  // 清理 MutationObserver
  if (editorObserver) {
    editorObserver.disconnect()
    editorObserver = null
  }
  
  logger.info('编辑器组件已卸载')
})
</script>

<template>
  <div 
    class="document-container"
    :style="containerStyles"
  >
    <div 
      ref="pageRef"
      class="document-page"
      :style="pageStyles.page"
      @mousedown.capture="handlePageMouseDown"
    >
      <div
        ref="editorRef"
        class="document-content"
        contenteditable="true"
        spellcheck="false"
        :style="editorStyles"
        :data-show-page-marks="settings.editor.showPageMarks"
        @keydown="handleKeyDown"
        @beforeinput="handleBeforeInput"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* Editor 组件样式已在 assets/styles/components/editor.css 中定义 */

/* 占位符样式（组件特定） */
.document-placeholder
{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  color: var(--word-text-secondary);
  user-select: none;
}

.document-placeholder__icon
{
  width: 128px;
  height: 128px;
  margin-bottom: 24px;
  opacity: 0.3;
}

.document-placeholder__icon svg
{
  width: 100%;
  height: 100%;
}

.document-placeholder__title
{
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 12px;
  color: var(--word-text-primary);
}

.document-placeholder__description
{
  font-size: 14px;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
}

.document-placeholder__shortcuts
{
  display: flex;
  gap: 24px;
  padding: 20px;
  background-color: var(--word-gray-hover);
  border-radius: var(--border-radius-md);
}

.document-placeholder__shortcut
{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.document-placeholder__shortcut kbd
{
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--word-white);
  border: 1px solid var(--word-gray-border);
  border-radius: 3px;
  font-family: var(--font-family-ui);
  font-size: 11px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>

