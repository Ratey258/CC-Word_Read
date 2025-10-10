<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useUIStore } from '@/stores/ui'
import { useNovelReader } from '@/composables/useNovelReader'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import Icon from './Icon.vue'

// Stores
const novelStore = useNovelStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()

// Refs
const pageRef = ref<HTMLDivElement>()

// Reactive state
const { currentNovel } = storeToRefs(novelStore)
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

// 注册全局快捷键
useKeyboardShortcuts()

// Computed
const hasNovel = computed(() => currentNovel.value !== null)

const editorStyles = computed(() => ({
  fontSize: `${settings.value.editor.fontSize}px`,
  fontFamily: settings.value.editor.fontFamily,
  lineHeight: settings.value.editor.lineHeight.toString()
}))

const pageStyles = computed(() => ({
  width: '816px' // A4 宽度
}))

// 计算编辑器容器顶部位置（根据 Ribbon 折叠状态）
const containerStyles = computed(() =>
{
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

// 监听小说加载
watch(currentNovel, (novel) =>
{
  if (novel && editorRef.value)
  {
    // 清空编辑器并聚焦
    editorRef.value.textContent = ''
    editorRef.value.focus()
  }
})

// 监听清空编辑器事件
function handleClearEditorEvent(): void
{
  clearEditor()
}

// Lifecycle
onMounted(() =>
{
  // 监听自定义事件
  window.addEventListener('clear-editor', handleClearEditorEvent)
  
  if (editorRef.value)
  {
    editorRef.value.focus()
  }
  
  // 如果有小说且未开始阅读，按任意键开始阅读
  const handleAutoStart = (event: KeyboardEvent) =>
  {
    if (hasNovel.value && !isReading.value)
    {
      // 排除修饰键和特殊键
      if (!['Control', 'Shift', 'Alt', 'Meta', 'Tab', 'Escape'].includes(event.key) &&
          !event.ctrlKey && !event.altKey && !event.metaKey)
      {
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
      :style="pageStyles"
    >
      <div 
        ref="editorRef"
        class="document-content"
        contenteditable="true"
        spellcheck="false"
        :style="editorStyles"
        @keydown="handleKeyDown"
        @beforeinput="handleBeforeInput"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
      >
        <template v-if="!hasNovel">
          <div class="document-placeholder">
            <div class="document-placeholder__icon">
              <Icon 
                name="file"
                :size="64"
                class="editor__welcome-icon"
              />
            </div>
            <h3 class="document-placeholder__title">
              导入小说开始阅读
            </h3>
            <p class="document-placeholder__description">
              点击"文件"选项卡导入 TXT 文件<br>
              或将文件拖放到此处
            </p>
            <div class="document-placeholder__shortcuts">
              <div class="document-placeholder__shortcut">
                <kbd>Ctrl</kbd> + <kbd>O</kbd>
                <span>打开文件</span>
              </div>
              <div class="document-placeholder__shortcut">
                <kbd>→</kbd>
                <span>下一字</span>
              </div>
              <div class="document-placeholder__shortcut">
                <kbd>←</kbd>
                <span>上一字</span>
              </div>
            </div>
          </div>
        </template>
      </div>
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

