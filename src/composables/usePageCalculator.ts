/**
 * 页码计算器 Composable
 * 根据字符数和编辑器设置动态计算页数
 * 支持基于编辑器实际内容的页面计算
 */

import { computed } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { useSettingsStore } from '@/stores/settings'

export function usePageCalculator()
{
  const novelStore = useNovelStore()
  const settingsStore = useSettingsStore()

  /**
   * 计算每页可容纳的字符数
   * 基于A4纸张尺寸和当前编辑器设置
   */
  const charsPerPage = computed(() =>
  {
    // A4 尺寸常量（单位：像素，96 DPI）
    const A4_WIDTH_CM = 21
    const A4_HEIGHT_CM = 29.7
    const PADDING_CM = 2.54 * 2 // 上下或左右边距总和
    const CM_TO_PX = 37.795275591 // 1cm = 37.795px (96 DPI)

    // 内容区域尺寸（像素）
    const contentWidthPx = (A4_WIDTH_CM - PADDING_CM) * CM_TO_PX
    const contentHeightPx = (A4_HEIGHT_CM - PADDING_CM) * CM_TO_PX

    // 获取当前编辑器设置
    const fontSize = settingsStore.settings.editor.fontSize || 14 // pt
    const lineHeight = settingsStore.settings.editor.lineHeight || 1.6

    // 将pt转换为px (1pt ≈ 1.333px at 96 DPI)
    const fontSizePx = fontSize * 1.333

    // 计算每行的高度
    const lineHeightPx = fontSizePx * lineHeight

    // 计算每页可以容纳的行数
    const linesPerPage = Math.floor(contentHeightPx / lineHeightPx)

    // 计算每行可以容纳的字符数（估算）
    // 中文字符宽度 ≈ 字号大小
    // 这里使用一个保守的估算：每行字符数 = 宽度 / 字号
    const charsPerLine = Math.floor(contentWidthPx / fontSizePx)

    // 每页字符数 = 每页行数 × 每行字符数
    const totalCharsPerPage = linesPerPage * charsPerLine

    return totalCharsPerPage > 0 ? totalCharsPerPage : 1000 // 防止除零
  })

  /**
   * 计算总页数
   * 优先使用编辑器实际内容长度，如果没有则使用小说总长度
   */
  const totalPages = computed(() =>
  {
    // 优先使用编辑器实际内容长度
    const editorLength = novelStore.editorContentLength
    
    // 如果有编辑器内容，基于实际内容计算页数
    if (editorLength > 0)
    {
      return Math.ceil(editorLength / charsPerPage.value)
    }
    
    // 否则，如果有加载的小说，使用小说总长度
    if (novelStore.hasNovel)
    {
      const totalChars = novelStore.totalLength
      if (totalChars === 0) return 1
      return Math.ceil(totalChars / charsPerPage.value)
    }
    
    // 默认至少1页
    return 1
  })

  /**
   * 计算当前页码
   * 优先基于编辑器实际内容位置，否则使用阅读进度
   */
  const currentPage = computed(() =>
  {
    // 优先使用编辑器实际内容长度来计算当前页
    const editorLength = novelStore.editorContentLength
    
    if (editorLength > 0)
    {
      const page = Math.ceil(editorLength / charsPerPage.value)
      return Math.min(page, totalPages.value)
    }
    
    // 如果没有编辑器内容，使用阅读进度
    if (!novelStore.hasNovel) return 1

    const currentPos = novelStore.currentPosition
    if (currentPos === 0) return 1

    const page = Math.ceil(currentPos / charsPerPage.value)
    return Math.min(page, totalPages.value)
  })

  /**
   * 计算当前页的进度（当前页内的百分比）
   */
  const currentPageProgress = computed(() =>
  {
    if (!novelStore.hasNovel) return 0

    const currentPos = novelStore.currentPosition
    const pageStartPos = (currentPage.value - 1) * charsPerPage.value
    const posInPage = currentPos - pageStartPos

    return (posInPage / charsPerPage.value) * 100
  })

  /**
   * 跳转到指定页
   * @param pageNumber 目标页码
   */
  function jumpToPage(pageNumber: number): void
  {
    if (pageNumber < 1 || pageNumber > totalPages.value)
    {
      console.warn('页码超出范围')
      return
    }

    const targetPosition = (pageNumber - 1) * charsPerPage.value
    novelStore.updatePosition(targetPosition)
  }

  /**
   * 下一页
   */
  function nextPage(): void
  {
    if (currentPage.value < totalPages.value)
    {
      jumpToPage(currentPage.value + 1)
    }
  }

  /**
   * 上一页
   */
  function previousPage(): void
  {
    if (currentPage.value > 1)
    {
      jumpToPage(currentPage.value - 1)
    }
  }

  return {
    // 计算属性
    charsPerPage,
    totalPages,
    currentPage,
    currentPageProgress,

    // 方法
    jumpToPage,
    nextPage,
    previousPage
  }
}

