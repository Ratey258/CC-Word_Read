/**
 * 编辑器操作辅助函数
 */

/**
 * 将光标移动到元素末尾
 * @param element HTML 元素
 */
export function moveCursorToEnd(element: HTMLElement): void {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  
  // 如果元素有子节点，选择最后一个
  if (element.childNodes.length > 0) {
    range.selectNodeContents(element)
    range.collapse(false) // 折叠到末尾
  } else {
    range.setStart(element, 0)
    range.setEnd(element, 0)
  }

  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 恢复编辑器内容并移动光标
 * @param element 编辑器元素
 * @param content 要恢复的内容
 * @param moveCursor 是否移动光标到末尾
 */
export function restoreEditorContent(
  element: HTMLElement,
  content: string,
  moveCursor = true
): void {
  element.textContent = content
  
  if (moveCursor) {
    // 使用 requestAnimationFrame 确保 DOM 更新后再移动光标
    globalThis.requestAnimationFrame(() => {
      moveCursorToEnd(element)
    })
  }
}

/**
 * 获取编辑器文本内容
 * @param element 编辑器元素
 */
export function getEditorTextContent(element: HTMLElement | null): string {
  return element?.textContent || ''
}

/**
 * 清空编辑器内容
 * @param element 编辑器元素
 */
export function clearEditorContent(element: HTMLElement): void {
  element.textContent = ''
}

/**
 * 在光标位置插入文本
 * @param element 编辑器元素
 * @param text 要插入的文本
 */
export function insertTextAtCursor(element: HTMLElement, text: string): void {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) {
    // 如果没有选区，直接追加到末尾
    element.appendChild(document.createTextNode(text))
    moveCursorToEnd(element)
    return
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()
  
  const textNode = document.createTextNode(text)
  range.insertNode(textNode)
  
  // 移动光标到插入文本之后
  range.setStartAfter(textNode)
  range.setEndAfter(textNode)
  
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 检查元素是否为空
 * @param element 编辑器元素
 */
export function isEditorEmpty(element: HTMLElement | null): boolean {
  return !element || !element.textContent || element.textContent.length === 0
}

