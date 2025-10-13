/**
 * 编辑器滚动逻辑 Composable
 */

import { Ref } from 'vue'

export function useEditorScroll(
  editorRef: Ref<HTMLElement | null>,
  isRibbonCollapsed: Ref<boolean>
) {
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
    const container = document.querySelector('.document-container') as HTMLElement
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

  return {
    scrollToContentEnd
  }
}

