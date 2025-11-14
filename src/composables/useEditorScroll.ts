/**
 * 编辑器滚动逻辑 Composable
 */

import { Ref } from 'vue'

export function useEditorScroll(
  editorRef: Ref<HTMLElement | null>,
  isRibbonCollapsed: Ref<boolean>
) {
  function getScrollContainer(): HTMLElement | null {
    return document.querySelector('.document-container') as HTMLElement | null
  }
  /**
   * 获取编辑器中的最后一个文本节点
   */
  function getLastTextNode(editor: HTMLElement): Node | null {
    const walker = document.createTreeWalker(
      editor,
      globalThis.NodeFilter.SHOW_TEXT,
      null
    )
    
    let lastNode: Node | null = null
    while (walker.nextNode()) {
      lastNode = walker.currentNode
    }
    
    return lastNode
  }

  /**
   * 计算视口信息
   */
  function getViewportInfo() {
    const titlebarHeight = 32
    const ribbonTabHeight = 27
    const ribbonToolbarHeight = isRibbonCollapsed.value ? 0 : 93
    const headerHeight = titlebarHeight + ribbonTabHeight + ribbonToolbarHeight
    
    return {
      viewportTop: headerHeight,
      viewportBottom: window.innerHeight,
      viewportHeight: window.innerHeight - headerHeight
    }
  }

  /**
   * 滚动到内容末尾
   */
  function scrollToContentEnd(): void {
    if (!editorRef.value) return
    
    const editor = editorRef.value
    const text = editor.textContent || ''
    
    // 如果没有内容，不需要滚动
    if (text.length === 0) return
    
    // 获取文档容器（它是滚动容器）
    const container = getScrollContainer()
    if (!container) return
    
    // 获取最后一个文本节点
    const lastTextNode = getLastTextNode(editor)
    if (!lastTextNode) return
    
    // 创建 range 定位到最后一个字符
    const range = document.createRange()
    const textLength = lastTextNode.textContent?.length || 0
    
    if (textLength > 0) {
      range.setStart(lastTextNode, textLength - 1)
      range.setEnd(lastTextNode, textLength)
    } else {
      range.selectNodeContents(lastTextNode)
    }
    
    const rect = range.getBoundingClientRect()
    const { viewportTop, viewportHeight } = getViewportInfo()
    
    // 目标位置：视口中心偏上 1/3 处
    const targetPositionInViewport = viewportTop + viewportHeight / 3
    const contentEndTop = rect.top
    
    // 允许 50px 的缓冲区，避免频繁滚动
    const buffer = 50
    const shouldScroll = 
      contentEndTop < (targetPositionInViewport - buffer) || 
      contentEndTop > (targetPositionInViewport + buffer)
    
    if (shouldScroll) {
      const scrollDelta = contentEndTop - targetPositionInViewport
      const targetScrollTop = container.scrollTop + scrollDelta
      
      // 平滑滚动
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
    }
  }

  function scrollCursorIntoView(options: { immediate?: boolean } = {}): void {
    if (!editorRef.value) return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0).cloneRange()
    const editor = editorRef.value

    if (!editor.contains(range.startContainer)) {
      return
    }

    range.collapse(false)
    const rect = range.getBoundingClientRect()
    const container = getScrollContainer()
    if (!container) return

    const { viewportTop, viewportHeight } = getViewportInfo()
    const caretTop = rect.top
    const caretBottom = rect.bottom || caretTop
    const safeTop = viewportTop + viewportHeight * 0.2
    const safeBottom = viewportTop + viewportHeight * 0.8

    if (caretTop >= safeTop && caretBottom <= safeBottom) {
      return
    }

    const caretCenter = caretTop + (rect.height || 0) / 2
    const targetCenter = viewportTop + viewportHeight / 2
    const scrollDelta = caretCenter - targetCenter

    container.scrollTo({
      top: Math.max(0, container.scrollTop + scrollDelta),
      behavior: options.immediate ? 'auto' : 'smooth'
    })
  }

  return {
    scrollToContentEnd,
    scrollCursorIntoView
  }
}

