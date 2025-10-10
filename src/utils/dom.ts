/**
 * DOM 操作工具函数
 */

/**
 * 获取选区（Selection）
 */
export function getSelection(): Selection | null
{
  return window.getSelection()
}

/**
 * 获取光标所在的 Range
 */
export function getRange(): Range | null
{
  const selection = getSelection()
  if (!selection || selection.rangeCount === 0)
  {
    return null
  }
  return selection.getRangeAt(0)
}

/**
 * 设置光标位置到指定节点的末尾
 * @param node 目标节点
 */
export function setCursorToEnd(node: Node): void
{
  const selection = getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(node)
  range.collapse(false) // false = 折叠到末尾

  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 在光标位置插入文本
 * @param text 要插入的文本
 */
export function insertTextAtCursor(text: string): void
{
  const selection = getSelection()
  if (!selection) return

  const range = selection.getRangeAt(0)
  range.deleteContents()

  const textNode = document.createTextNode(text)
  range.insertNode(textNode)

  // 移动光标到插入文本的末尾
  range.setStartAfter(textNode)
  range.setEndAfter(textNode)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 获取元素的文本内容（不包含 HTML 标签）
 * @param element HTML 元素
 */
export function getTextContent(element: HTMLElement): string
{
  return element.textContent || ''
}

/**
 * 清空元素内容
 * @param element HTML 元素
 */
export function clearElement(element: HTMLElement): void
{
  element.innerHTML = ''
}

/**
 * 滚动到元素底部
 * @param element 可滚动元素
 */
export function scrollToBottom(element: HTMLElement): void
{
  element.scrollTop = element.scrollHeight
}

/**
 * 检查元素是否在可视区域内
 * @param element HTML 元素
 */
export function isInViewport(element: HTMLElement): boolean
{
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 获取元素相对于文档的偏移位置
 * @param element HTML 元素
 */
export function getOffset(element: HTMLElement): { top: number; left: number }
{
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  }
}

/**
 * 平滑滚动到指定元素
 * @param element 目标元素
 * @param options 滚动选项
 */
export function smoothScrollTo(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void
{
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options
  })
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
{
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return function (this: unknown, ...args: Parameters<T>)
  {
    if (timer) clearTimeout(timer)
    
    timer = setTimeout(() =>
    {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
{
  let lastTime = 0
  
  return function (this: unknown, ...args: Parameters<T>)
  {
    const now = Date.now()
    
    if (now - lastTime >= delay)
    {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

