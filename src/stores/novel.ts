/**
 * 小说状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { Novel, NovelMetadata, Bookmark, ReadingProgress, Chapter } from '@/types/novel'
import { STORAGE_KEYS } from '@/utils/constants'
import { useHistoryStore } from './history'
import { parseChapters, findChapterByPosition } from '@/utils/chapterParser'

export const useNovelStore = defineStore('novel', () => {
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
  
  /** 当前章节 */
  const currentChapter = computed(() => {
    if (currentChapterIndex.value >= 0 && currentChapterIndex.value < chapters.value.length) {
      return chapters.value[currentChapterIndex.value]
    }
    // 如果没有设置当前章节，根据阅读位置自动查找
    if (hasChapters.value && currentPosition.value >= 0) {
      return findChapterByPosition(chapters.value, currentPosition.value)
    }
    return null
  })
  
  /** 章节总数 */
  const chapterCount = computed(() => chapters.value.length)
  
  // ===== Actions =====
  
  /**
   * 加载小说
   * @param novel 小说对象
   * @param filePath 文件路径（可选，Tauri环境）
   * @param isHistoryRestore 是否是从历史记录恢复（默认 false）
   */
  async function loadNovel(novel: Novel, filePath?: string, isHistoryRestore = false): Promise<void> {
    // 如果是从历史记录恢复，先设置标志并等待 Vue 处理
    if (isHistoryRestore) {
      console.log('[NovelStore] 设置历史恢复标志')
      isRestoringFromHistory.value = true
      // 使用 nextTick 确保 Vue 已经更新所有依赖这个状态的组件
      await nextTick()
      // 再等待一次，确保所有 watch 都已经执行完毕
      await nextTick()
      console.log('[NovelStore] Vue 已处理响应式更新')
    }
    
    currentNovel.value = novel
    content.value = novel.content
    currentPosition.value = 0
    
    // 解析章节（如果小说对象中没有章节信息）
    if (!novel.chapters || novel.chapters.length === 0) {
      chapters.value = parseChapters(novel.content)
      // 更新小说对象中的章节信息
      if (currentNovel.value) {
        currentNovel.value.chapters = chapters.value
      }
    } else {
      chapters.value = novel.chapters
    }
    
    // 重置当前章节索引
    currentChapterIndex.value = -1
    
    // 保持默认显示名称为"文档-Word"，不使用导入的文件名
    displayName.value = '文档-Word'
    
    // 保存到本地存储
    saveToStorage()
    
    // 添加到最近打开列表
    addToRecentFiles(novel.metadata)
    
    // 添加到历史记录（仅在非历史恢复时添加）
    if (!isHistoryRestore) {
      const historyStore = useHistoryStore()
      historyStore.addToHistory(novel, filePath)
    }
    
    // 注意：isRestoringFromHistory 标志由调用方在恢复完成后重置
    // 不在这里重置，以确保整个恢复流程（包括恢复已读内容等）完成后才重置
  }
  
  /**
   * 清空当前小说
   */
  function clearNovel(): void {
    currentNovel.value = null
    content.value = ''
    currentPosition.value = 0
    bookmarks.value = []
    chapters.value = []
    currentChapterIndex.value = -1
    displayName.value = '文档-Word'
  }
  
  /**
   * 设置显示的文件名
   * @param name 新的显示名称
   */
  function setDisplayName(name: string): void {
    displayName.value = name || '文档-Word'
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, displayName.value)
  }
  
  /**
   * 更新阅读位置
   * @param position 新位置
   */
  function updatePosition(position: number): void {
    if (position >= 0 && position <= totalLength.value) {
      currentPosition.value = position
      saveProgress()
      
      // 同步到历史记录
      if (currentNovel.value) {
        const historyStore = useHistoryStore()
        historyStore.updateProgress(currentNovel.value.id, position)
      }
    }
  }
  
  /**
   * 跳转到指定位置
   * @param position 目标位置
   */
  function jumpTo(position: number): void {
    updatePosition(position)
  }
  
  /**
   * 添加书签
   * @param bookmark 书签对象
   */
  function addBookmark(bookmark: Bookmark): void {
    bookmarks.value.push(bookmark)
    saveBookmarks()
  }
  
  /**
   * 删除书签
   * @param bookmarkId 书签ID
   */
  function removeBookmark(bookmarkId: string): void {
    const index = bookmarks.value.findIndex(b => b.id === bookmarkId)
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }
  
  /**
   * 获取书签
   * @param bookmarkId 书签ID
   */
  function getBookmark(bookmarkId: string): Bookmark | undefined {
    return bookmarks.value.find(b => b.id === bookmarkId)
  }
  
  /**
   * 保存阅读进度
   */
  function saveProgress(): void {
    if (!currentNovel.value) return
    
    const progressData: ReadingProgress = {
      novelId: currentNovel.value.id,
      currentPosition: currentPosition.value,
      percentage: progress.value,
      lastReadAt: Date.now()
    }
    
    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progressData))
  }
  
  /**
   * 加载阅读进度
   */
  function loadProgress(): void {
    const data = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS)
    if (!data || !currentNovel.value) return
    
    try {
      const progressData: ReadingProgress = JSON.parse(data)
      if (progressData.novelId === currentNovel.value.id) {
        currentPosition.value = progressData.currentPosition
      }
    } catch (error) {
      console.error('加载进度失败:', error)
    }
  }
  
  /**
   * 保存书签到本地存储
   */
  function saveBookmarks(): void {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks.value))
  }
  
  /**
   * 加载书签
   */
  function loadBookmarks(): void {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (!data) return
    
    try {
      bookmarks.value = JSON.parse(data)
    } catch (error) {
      console.error('加载书签失败:', error)
    }
  }
  
  /**
   * 保存到本地存储
   */
  function saveToStorage(): void {
    if (currentNovel.value) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_NOVEL, JSON.stringify(currentNovel.value))
    }
  }
  
  /**
   * 从本地存储加载
   */
  async function loadFromStorage(): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_NOVEL)
    if (!data) return
    
    try {
      const novel: Novel = JSON.parse(data)
      // 页面刷新时也需要设置恢复标志，避免 Editor 清空内容
      console.log('[NovelStore] 从存储加载，设置恢复标志')
      isRestoringFromHistory.value = true
      await nextTick()
      await nextTick()
      
      await loadNovel(novel, undefined, true) // 传递 isHistoryRestore=true
      loadProgress()
      loadBookmarks()
      
      // 延迟重置标志，确保 Editor 已恢复内容
      setTimeout(() => {
        console.log('[NovelStore] 存储加载完成，重置恢复标志')
        isRestoringFromHistory.value = false
      }, 500)
    } catch (error) {
      console.error('加载小说失败:', error)
      isRestoringFromHistory.value = false
    }
  }
  
  /**
   * 添加到最近文件列表
   * @param metadata 小说元数据
   */
  function addToRecentFiles(metadata: NovelMetadata): void {
    // 移除重复项
    recentFiles.value = recentFiles.value.filter(f => f.title !== metadata.title)
    
    // 添加到开头
    recentFiles.value.unshift(metadata)
    
    // 限制数量（最多10个）
    if (recentFiles.value.length > 10) {
      recentFiles.value = recentFiles.value.slice(0, 10)
    }
    
    // 保存
    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(recentFiles.value))
  }
  
  /**
   * 加载最近文件列表
   */
  function loadRecentFiles(): void {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_FILES)
    if (!data) return
    
    try {
      recentFiles.value = JSON.parse(data)
    } catch (error) {
      console.error('加载最近文件失败:', error)
    }
  }
  
  /**
   * 加载显示名称
   */
  function loadDisplayName(): void {
    const data = localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME)
    if (data) {
      displayName.value = data
    }
  }
  
  /**
   * 更新编辑器内容长度
   * @param length 编辑器当前内容的字符数
   */
  function updateEditorContentLength(length: number): void {
    editorContentLength.value = length
  }
  
  /**
   * 跳转到指定章节
   * @param chapterIndex 章节索引
   */
  function jumpToChapter(chapterIndex: number): void {
    if (chapterIndex >= 0 && chapterIndex < chapters.value.length) {
      const chapter = chapters.value[chapterIndex]
      currentChapterIndex.value = chapterIndex
      
      // 触发清空编辑器事件
      window.dispatchEvent(new CustomEvent('clear-editor'))
      
      // 稍微延迟更新位置，确保编辑器已经清空
      setTimeout(() => {
        updatePosition(chapter.startPosition)
      }, 50)
    }
  }
  
  /**
   * 跳转到下一章节
   */
  function jumpToNextChapter(): void {
    if (hasChapters.value) {
      const currentIndex = currentChapterIndex.value >= 0 ? currentChapterIndex.value : 
        chapters.value.findIndex(chapter => 
          currentPosition.value >= chapter.startPosition && currentPosition.value < chapter.endPosition
        )
      
      const nextIndex = currentIndex + 1
      if (nextIndex < chapters.value.length) {
        jumpToChapter(nextIndex)
      }
    }
  }
  
  /**
   * 跳转到上一章节
   */
  function jumpToPrevChapter(): void {
    if (hasChapters.value) {
      const currentIndex = currentChapterIndex.value >= 0 ? currentChapterIndex.value : 
        chapters.value.findIndex(chapter => 
          currentPosition.value >= chapter.startPosition && currentPosition.value < chapter.endPosition
        )
      
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        jumpToChapter(prevIndex)
      }
    }
  }
  
  /**
   * 重新解析章节
   */
  function reparseChapters(): void {
    if (content.value) {
      chapters.value = parseChapters(content.value)
      if (currentNovel.value) {
        currentNovel.value.chapters = chapters.value
      }
      // 重置当前章节索引
      currentChapterIndex.value = -1
      saveToStorage()
    }
  }
  
  // ===== 初始化 =====
  
  // 自动加载数据
  loadFromStorage()
  loadRecentFiles()
  loadDisplayName()
  
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
    currentChapter,
    chapterCount,
    
    // Actions
    loadNovel,
    clearNovel,
    setDisplayName,
    updatePosition,
    updateEditorContentLength,
    jumpTo,
    addBookmark,
    removeBookmark,
    getBookmark,
    saveProgress,
    loadProgress,
    saveBookmarks,
    loadBookmarks,
    loadFromStorage,
    loadRecentFiles,
    jumpToChapter,
    jumpToNextChapter,
    jumpToPrevChapter,
    reparseChapters
  }
})

