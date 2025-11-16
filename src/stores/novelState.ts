/**
 * 小说状态定义和计算属性
 */

import { ref, computed } from 'vue'
import type { Novel, NovelMetadata, Bookmark, Chapter } from '@/types/novel'

/**
 * 内容标准化函数
 */
export function normalizeContent(rawContent: string): string {
  if (!rawContent) return ''

  return rawContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
}

/**
 * 创建小说状态
 */
export function createNovelState() {
  // ===== State =====
  
  /** 当前小说 */
  const currentNovel = ref<Novel | null>(null)
  
  /** 小说内容 */
  const content = ref<string>('')
  
  /** 当前阅读位置 */
  const currentPosition = ref<number>(0)
  
  /** 编辑器实际内容长度（用于页面计算） */
  const editorContentLength = ref<number>(0)
  
  /** 书签列表 */
  const bookmarks = ref<Bookmark[]>([])
  
  /** 最近打开的文件列表 */
  const recentFiles = ref<NovelMetadata[]>([])
  
  /** 显示的文件名（用于标题栏显示） */
  const displayName = ref<string>('文档-Word')
  
  /** 是否正在从历史记录恢复（用于避免 Editor 清空内容） */
  const isRestoringFromHistory = ref<boolean>(false)
  
  /** 章节列表 */
  const chapters = ref<Chapter[]>([])
  
  /** 当前章节索引 */
  const currentChapterIndex = ref<number>(-1)
  
  // ===== Getters =====
  
  /** 小说总长度 */
  const totalLength = computed(() => content.value.length)
  
  /** 阅读进度（百分比） */
  const progress = computed(() => {
    if (totalLength.value === 0) return 0
    return (currentPosition.value / totalLength.value) * 100
  })
  
  /** 阅读进度百分比（整数） */
  const progressPercent = computed(() => {
    return Math.round(progress.value)
  })
  
  /** 剩余字符数 */
  const remainingChars = computed(() => {
    return totalLength.value - currentPosition.value
  })
  
  /** 是否已加载小说 */
  const hasNovel = computed(() => currentNovel.value !== null)
  
  /** 小说元数据 */
  const metadata = computed(() => currentNovel.value?.metadata || null)
  
  /** 是否有章节 */
  const hasChapters = computed(() => chapters.value.length > 0)
  
  /** 章节总数 */
  const chapterCount = computed(() => chapters.value.length)
  
  return {
    // State
    currentNovel,
    content,
    currentPosition,
    editorContentLength,
    bookmarks,
    recentFiles,
    displayName,
    isRestoringFromHistory,
    chapters,
    currentChapterIndex,
    
    // Getters
    totalLength,
    progress,
    progressPercent,
    remainingChars,
    hasNovel,
    metadata,
    hasChapters,
    chapterCount
  }
}
