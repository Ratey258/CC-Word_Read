/**
 * 光标控制工具函数
 */

/**
 * 光标位置信息
 */
export interface CursorPosition
{
  /** 节点 */
  node: Node
  /** 偏移量 */
  offset: number
}

/**
 * 获取当前光标位置
 */
export function getCursorPosition(): CursorPosition | null
{
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0)
  {
    return null
  }

  const range = selection.getRangeAt(0)
  return {
    node: range.startContainer,
    offset: range.startOffset
  }
}

/**
 * 设置光标到指定位置
 * @param node 目标节点
 * @param offset 偏移量
 */
export function setCursorPosition(node: Node, offset: number): void
{
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  
  try
  {
    range.setStart(node, offset)
    range.setEnd(node, offset)
    
    selection.removeAllRanges()
    selection.addRange(range)
  }
  catch (error)
  {
    console.error('设置光标位置失败:', error)
  }
}

/**
 * 保存光标位置
 * @param container 容器元素
 */
export function saveCursorPosition(container: HTMLElement): CursorPosition | null
{
  const position = getCursorPosition()
  if (!position) return null

  // 确保光标在指定容器内
  if (!container.contains(position.node))
  {
    return null
  }

  return position
}

/**
 * 恢复光标位置
 * @param position 光标位置信息
 */
export function restoreCursorPosition(position: CursorPosition | null): void
{
  if (!position) return
  setCursorPosition(position.node, position.offset)
}

/**
 * 移动光标到元素开始
 * @param element 目标元素
 */
export function moveCursorToStart(element: HTMLElement): void
{
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(true) // true = 折叠到开始

  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 移动光标到元素末尾
 * @param element 目标元素
 */
export function moveCursorToEnd(element: HTMLElement): void
{
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false) // false = 折叠到末尾

  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 获取光标前的文本内容
 * @param container 容器元素
 */
export function getTextBeforeCursor(container: HTMLElement): string
{
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return ''

  const range = selection.getRangeAt(0)
  const preRange = range.cloneRange()
  preRange.selectNodeContents(container)
  preRange.setEnd(range.startContainer, range.startOffset)

  return preRange.toString()
}

/**
 * 获取光标后的文本内容
 * @param container 容器元素
 */
export function getTextAfterCursor(container: HTMLElement): string
{
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return ''

  const range = selection.getRangeAt(0)
  const postRange = range.cloneRange()
  postRange.selectNodeContents(container)
  postRange.setStart(range.endContainer, range.endOffset)

  return postRange.toString()
}

/**
 * 检查光标是否在元素末尾
 * @param container 容器元素
 */
export function isCursorAtEnd(container: HTMLElement): boolean
{
  const afterText = getTextAfterCursor(container)
  return afterText.length === 0
}

/**
 * 检查光标是否在元素开始
 * @param container 容器元素
 */
export function isCursorAtStart(container: HTMLElement): boolean
{
  const beforeText = getTextBeforeCursor(container)
  return beforeText.length === 0
}

