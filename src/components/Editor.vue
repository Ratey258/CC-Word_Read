<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useUIStore } from '@/stores/ui'
import { useNovelReader } from '@/composables/useNovelReader'
import { usePageCalculator } from '@/composables/usePageCalculator'

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

// Computed
const hasNovel = computed(() => currentNovel.value !== null)

const editorStyles = computed(() => ({
  fontSize: `${settings.value.editor.fontSize}px`,
  fontFamily: settings.value.editor.fontFamily,
  lineHeight: settings.value.editor.lineHeight.toString()
}))

const pageStyles = computed(() => {
  // A4纸张尺寸（像素，96 DPI）
  const A4_WIDTH_PX = 816
  const A4_HEIGHT_PX = 1123
  
  // 根据页数计算最小高度
  // 确保至少显示1页的高度，并额外添加一页的缓冲空间以便输入时自动扩展
  const pages = Math.max(totalPages.value, 1)
  const minHeight = A4_HEIGHT_PX * (pages + 1) // 额外添加1页空间
  
  return {
    page: {
      width: `${A4_WIDTH_PX}px`,
      minHeight: `${minHeight}px`,
      // 使用 auto 高度允许内容自动扩展
      height: 'auto'
    }
  }
})

// 计算编辑器容器顶部位置（根据 Ribbon 折叠状态）
const containerStyles = computed(() => {
  const titlebarHeight = 32 // var(--titlebar-height)
  const ribbonTabHeight = 27 // var(--ribbon-tab-height)
  const ribbonToolbarHeight = 93 // var(--ribbon-toolbar-height)
  
  const topOffset = isRibbonCollapsed.value
    ? titlebarHeight + ribbonTabHeight
    : titlebarHeight + ribbonTabHeight + ribbonToolbarHeight
  
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

// 滚动到内容末尾，保持最后的内容在视觉中心
function scrollToContentEnd(): void {
  if (!editorRef.value) return
  
  const editor = editorRef.value
  const text = editor.textContent || ''
  
  // 如果没有内容，不需要滚动
  if (text.length === 0) return
  
  // 获取文档容器（它是滚动容器）
  const container = document.querySelector('.document-container') as HTMLElement
  if (!container) return
  
  // 创建一个临时 range 来定位到内容末尾
  const range = document.createRange()
  
  // 找到编辑器的最后一个文本节点
  let lastTextNode: Node | null = null
  const walker = document.createTreeWalker(
    editor,
    globalThis.NodeFilter.SHOW_TEXT,
    null
  )
  
  while (walker.nextNode()) {
    lastTextNode = walker.currentNode
  }
  
  // 如果找不到文本节点，退出
  if (!lastTextNode) return
  
  // 设置 range 到最后一个字符
  const textLength = lastTextNode.textContent?.length || 0
  if (textLength > 0) {
    range.setStart(lastTextNode, textLength - 1)
    range.setEnd(lastTextNode, textLength)
  } else {
    range.selectNodeContents(lastTextNode)
  }
  
  const rect = range.getBoundingClientRect()
  
  // 计算编辑器容器顶部位置（考虑 Ribbon 的高度）
  const titlebarHeight = 32
  const ribbonTabHeight = 27
  const ribbonToolbarHeight = isRibbonCollapsed.value ? 0 : 93
  const headerHeight = titlebarHeight + ribbonTabHeight + ribbonToolbarHeight
  
  // 计算视口可用区域（排除顶部工具栏）
  const viewportTop = headerHeight
  const viewportBottom = window.innerHeight
  const viewportHeight = viewportBottom - viewportTop
  
  // 定义内容末尾应该保持在视口中的目标位置（视口中心偏上1/3处）
  const targetPositionInViewport = viewportTop + viewportHeight / 3
  
  // 内容末尾当前在窗口中的位置
  const contentEndTop = rect.top
  
  // 如果内容末尾不在合适的位置，进行滚动
  // 允许一定的缓冲区，避免频繁滚动
  const buffer = 50
  const shouldScroll = 
    contentEndTop < (targetPositionInViewport - buffer) || 
    contentEndTop > (targetPositionInViewport + buffer)
  
  if (shouldScroll) {
    // 计算需要滚动的距离
    const scrollDelta = contentEndTop - targetPositionInViewport
    const targetScrollTop = container.scrollTop + scrollDelta
    
    // 平滑滚动到目标位置（滚动容器而不是 window）
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    })
  }
}

// 使用 MutationObserver 监听编辑器内容变化
let editorObserver: globalThis.MutationObserver | null = null

function setupEditorObserver(): void {
  if (!editorRef.value) return
  
  // 清理旧的观察器
  if (editorObserver) {
    editorObserver.disconnect()
  }
  
  // 创建新的观察器
  editorObserver = new globalThis.MutationObserver(() => {
    updateEditorContentLength()
    // 内容变化后，滚动到内容末尾
    globalThis.requestAnimationFrame(() => {
      scrollToContentEnd()
    })
  })
  
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
  console.log('[Editor] ========== watch triggered ==========')
  console.log('[Editor] 新小说 ID:', novel?.id)
  console.log('[Editor] 旧小说 ID:', oldNovel?.id)
  console.log('[Editor] isRestoring 标志:', isRestoringFromHistory.value)
  console.log('[Editor] novelStore.isRestoringFromHistory:', novelStore.isRestoringFromHistory)
  
  if (novel && editorRef.value) {
    // 如果正在从历史记录恢复，不清空编辑器
    // 因为 useHistory 会在加载后手动恢复已读内容
    if (isRestoringFromHistory.value) {
      console.log('[Editor] 正在从历史记录恢复，跳过清空编辑器')
      editorRef.value.focus()
      updateEditorContentLength()
      return
    }
    
    // 如果是新加载的小说（不是刷新页面恢复的），清空编辑器
    // 判断依据：旧小说为null或者小说ID不同
    const isNewNovel = !oldNovel || oldNovel.id !== novel.id
    
    if (isNewNovel) {
      console.log('[Editor] 加载新小说，清空编辑器')
      // 清空编辑器并聚焦
      editorRef.value.textContent = ''
      editorRef.value.focus()
      // 更新内容长度
      updateEditorContentLength()
    } else {
      console.log('[Editor] 同一本小说，保持编辑器内容')
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

// Lifecycle
onMounted(() => {
  // 监听自定义事件
  window.addEventListener('clear-editor', handleClearEditorEvent)
  
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
        const currentContent = editorRef.value.textContent || ''
        
        // 只在编辑器为空或内容不匹配时才恢复
        if (currentContent.length === 0 || currentContent.length !== novelStore.currentPosition) {
          const readContent = currentNovel.value.content.substring(0, novelStore.currentPosition)
          editorRef.value.textContent = readContent
          console.log('[Editor] 页面刷新，已恢复已读内容，长度:', readContent.length)
          
          // 更新内容长度
          updateEditorContentLength()
          
          // 将光标移到末尾
          setTimeout(() => {
            if (editorRef.value) {
              const range = document.createRange()
              const selection = window.getSelection()
              if (selection && editorRef.value.childNodes.length > 0) {
                range.selectNodeContents(editorRef.value)
                range.collapse(false) // 折叠到末尾
                selection.removeAllRanges()
                selection.addRange(range)
              }
            }
          }, 50)
        } else {
          console.log('[Editor] 编辑器内容已存在，跳过恢复')
        }
      }
    }, 100) // 延迟100ms，确保异步加载完成
  }
  
  // 如果有小说且未开始阅读，按任意键开始阅读
  const handleAutoStart = (event: KeyboardEvent) => {
    if (hasNovel.value && !isReading.value) {
      // 排除修饰键和特殊键
      if (!['Control', 'Shift', 'Alt', 'Meta', 'Tab', 'Escape'].includes(event.key) &&
          !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault()
        startReading()
        // 只执行一次后移除
        document.removeEventListener('keydown', handleAutoStart)
      }
    }
  }
  
  document.addEventListener('keydown', handleAutoStart)
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

