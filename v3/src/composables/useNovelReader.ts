/**
 * 小说阅读核心逻辑 Composable
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useUIStore } from '@/stores/ui'

export function useNovelReader()
{
  const novelStore = useNovelStore()
  const readerStore = useReaderStore()
  const uiStore = useUIStore()

  // ===== State =====
  
  /** 编辑器元素引用 */
  const editorRef = ref<HTMLElement | null>(null)
  
  /** 当前输入法组合的文本 */
  const compositionData = ref<string>('')

  // ===== Computed =====
  
  /** 是否可以开始阅读 */
  const canStartReading = computed(() => 
{
    return novelStore.hasNovel && !readerStore.isReading
  })

  /** 是否可以输出字符 */
  const canOutput = computed(() => 
{
    return (
      readerStore.isReading &&
      !readerStore.isComposing &&
      novelStore.remainingChars > 0
    )
  })

  // ===== Methods =====

  /**
   * 开始阅读
   */
  function startReading(): void
  {
    if (!canStartReading.value)
    {
      return
    }

    readerStore.startReading()
    uiStore.showSuccess('开始阅读')

    // 聚焦编辑器
    editorRef.value?.focus()
  }

  /**
   * 暂停阅读
   */
  function pauseReading(): void
  {
    readerStore.pauseReading()
    novelStore.saveProgress()
    uiStore.showInfo('已暂停')
  }

  /**
   * 继续阅读
   */
  function resumeReading(): void
  {
    readerStore.resumeReading()
    uiStore.showSuccess('继续阅读')
  }

  /**
   * 停止阅读
   */
  function stopReading(): void
  {
    readerStore.stopReading()
    novelStore.saveProgress()
    uiStore.showInfo('已停止')
  }

  /**
   * 输出字符
   * @param count 输出字符数（可选）
   */
  function outputChars(count?: number): string
  {
    if (!canOutput.value)
    {
      return ''
    }

    const charsCount = count || readerStore.config.charsPerOutput
    const { content, currentPosition } = novelStore

    // 获取要输出的字符
    const endPosition = Math.min(
      currentPosition + charsCount,
      content.length
    )
    const chars = content.substring(currentPosition, endPosition)

    // 更新位置
    novelStore.updatePosition(endPosition)

    // 记录输出
    readerStore.recordOutput(chars)

    // 检查是否读完
    if (novelStore.remainingChars === 0)
    {
      stopReading()
      uiStore.showSuccess('阅读完成！')
    }

    return chars
  }

  /**
   * 处理按键按下事件
   * @param event 键盘事件
   */
  function handleKeyDown(event: KeyboardEvent): void
  {
    // 如果不是阅读状态，不处理
    if (!readerStore.isReading)
    {
      return
    }

    // 如果在输入法组合中，不处理
    if (readerStore.isComposing)
    {
      return
    }

    // 检查是否正在使用输入法（通过 isComposing 属性）
    if (event.isComposing)
    {
      // 输入法正在工作，不阻止
      return
    }

    // 处理退格键
    if (event.key === 'Backspace')
    {
      event.preventDefault()
      handleBackspace()
      return
    }

    // 检查是否是功能键（不应该触发输出）
    const functionalKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
      'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ]
    
    if (functionalKeys.includes(event.key))
    {
      return
    }

    // 对于普通按键，不在这里阻止，让 beforeinput 来处理
    // 这样输入法可以正常启动
  }

  /**
   * 处理 beforeinput 事件
   * @param event 输入事件
   */
  function handleBeforeInput(event: Event): void
  {
    // 如果不是阅读状态，允许正常输入
    if (!readerStore.isReading)
    {
      return
    }

    // 如果在输入法组合中，允许输入法正常工作
    if (readerStore.isComposing)
    {
      return
    }

    // 阻止所有直接输入
    event.preventDefault()

    // 输出小说内容
    const chars = outputChars()
    if (chars)
    {
      insertTextToEditor(chars)
    }
  }

  /**
   * 处理退格键
   */
  function handleBackspace(): void
  {
    const editor = editorRef.value
    if (!editor) return

    const text = editor.textContent || ''
    if (text.length > 0)
    {
      // 删除最后一个字符
      editor.textContent = text.slice(0, -1)
      
      // 光标移到末尾
      moveCursorToEnd(editor)
    }
  }

  /**
   * 处理输入法组合开始
   * @param event 组合事件
   */
  function handleCompositionStart(event: CompositionEvent): void
  {
    readerStore.setComposing(true)
    compositionData.value = event.data || ''
    // 不阻止默认行为，让输入法窗口正常显示
  }

  /**
   * 处理输入法组合更新
   * @param event 组合事件
   */
  function handleCompositionUpdate(event: CompositionEvent): void
  {
    compositionData.value = event.data || ''
    // 不阻止默认行为，让输入法窗口正常更新
  }

  /**
   * 处理输入法组合结束
   * @param event 组合事件
   */
  function handleCompositionEnd(event: CompositionEvent): void
  {
    readerStore.setComposing(false)

    const composedText = event.data || ''
    
    // 使用 setTimeout 确保在输入法文本插入后再删除
    setTimeout(() =>
    {
      // 删除输入法插入的文本
      if (editorRef.value && composedText)
      {
        const text = editorRef.value.textContent || ''
        const lastIndex = text.lastIndexOf(composedText)
        if (lastIndex !== -1)
        {
          editorRef.value.textContent = text.substring(0, lastIndex) + text.substring(lastIndex + composedText.length)
        }
      }

      // 输出小说字符替代输入法文本
      const chars = outputChars(composedText.length)
      if (chars)
      {
        insertTextToEditor(chars)
      }

      compositionData.value = ''
    }, 0)
  }

  /**
   * 插入文本到编辑器
   * @param text 文本
   */
  function insertTextToEditor(text: string): void
  {
    const editor = editorRef.value
    if (!editor) return

    // 始终在编辑器内容末尾追加文本，而不是在当前光标位置插入
    const textNode = document.createTextNode(text)
    editor.appendChild(textNode)

    // 移动光标到编辑器末尾
    moveCursorToEnd(editor)

    // 滚动到可见区域
    editor.scrollTop = editor.scrollHeight
  }

  /**
   * 移动光标到元素末尾
   * @param element 元素
   */
  function moveCursorToEnd(element: HTMLElement): void
  {
    const selection = window.getSelection()
    if (!selection) return

    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)

    selection.removeAllRanges()
    selection.addRange(range)
  }

  /**
   * 清空编辑器内容
   */
  function clearEditor(): void
  {
    if (editorRef.value)
    {
      editorRef.value.textContent = ''
    }
    readerStore.clearOutputBuffer()
  }

  /**
   * 跳转到指定位置
   * @param position 目标位置
   */
  function jumpToPosition(position: number): void
  {
    novelStore.jumpTo(position)
    uiStore.showSuccess(`已跳转到 ${position} 字符`)
  }

  // ===== Lifecycle =====

  /** 清理函数 */
  let cleanup: (() => void) | null = null

  onMounted(() => 
{
    // 可以在这里添加全局事件监听
    cleanup = () => 
{
      // 清理逻辑
    }
  })

  onUnmounted(() => 
{
    cleanup?.()
  })

  return {
    // Refs
    editorRef,
    compositionData,

    // Computed
    canStartReading,
    canOutput,

    // Methods
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    outputChars,
    handleKeyDown,
    handleBeforeInput,
    handleBackspace,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    clearEditor,
    jumpToPosition
  }
}

