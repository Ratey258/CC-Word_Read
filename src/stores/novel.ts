/**
 * 小说状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Novel, NovelMetadata, Bookmark, ReadingProgress } from '@/types/novel'
import { STORAGE_KEYS } from '@/utils/constants'

export const useNovelStore = defineStore('novel', () =>
{
  // ===== State =====
  
  /** 当前小说 */
  const currentNovel = ref<Novel | null>(null)
  
  /** 小说内容 */
  const content = ref<string>('')
  
  /** 当前阅读位置 */
  const currentPosition = ref<number>(0)
  
  /** 书签列表 */
  const bookmarks = ref<Bookmark[]>([])
  
  /** 最近打开的文件列表 */
  const recentFiles = ref<NovelMetadata[]>([])
  
  // ===== Getters =====
  
  /** 小说总长度 */
  const totalLength = computed(() => content.value.length)
  
  /** 阅读进度（百分比） */
  const progress = computed(() =>
  {
    if (totalLength.value === 0) return 0
    return (currentPosition.value / totalLength.value) * 100
  })
  
  /** 阅读进度百分比（整数） */
  const progressPercent = computed(() =>
  {
    return Math.round(progress.value)
  })
  
  /** 剩余字符数 */
  const remainingChars = computed(() =>
  {
    return totalLength.value - currentPosition.value
  })
  
  /** 是否已加载小说 */
  const hasNovel = computed(() => currentNovel.value !== null)
  
  /** 小说元数据 */
  const metadata = computed(() => currentNovel.value?.metadata || null)
  
  // ===== Actions =====
  
  /**
   * 加载小说
   * @param novel 小说对象
   */
  function loadNovel(novel: Novel): void
  {
    currentNovel.value = novel
    content.value = novel.content
    currentPosition.value = 0
    
    // 保存到本地存储
    saveToStorage()
    
    // 添加到最近打开列表
    addToRecentFiles(novel.metadata)
  }
  
  /**
   * 清空当前小说
   */
  function clearNovel(): void
  {
    currentNovel.value = null
    content.value = ''
    currentPosition.value = 0
    bookmarks.value = []
  }
  
  /**
   * 更新阅读位置
   * @param position 新位置
   */
  function updatePosition(position: number): void
  {
    if (position >= 0 && position <= totalLength.value)
    {
      currentPosition.value = position
      saveProgress()
    }
  }
  
  /**
   * 跳转到指定位置
   * @param position 目标位置
   */
  function jumpTo(position: number): void
  {
    updatePosition(position)
  }
  
  /**
   * 添加书签
   * @param bookmark 书签对象
   */
  function addBookmark(bookmark: Bookmark): void
  {
    bookmarks.value.push(bookmark)
    saveBookmarks()
  }
  
  /**
   * 删除书签
   * @param bookmarkId 书签ID
   */
  function removeBookmark(bookmarkId: string): void
  {
    const index = bookmarks.value.findIndex(b => b.id === bookmarkId)
    if (index !== -1)
    {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }
  
  /**
   * 获取书签
   * @param bookmarkId 书签ID
   */
  function getBookmark(bookmarkId: string): Bookmark | undefined
  {
    return bookmarks.value.find(b => b.id === bookmarkId)
  }
  
  /**
   * 保存阅读进度
   */
  function saveProgress(): void
  {
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
  function loadProgress(): void
  {
    const data = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS)
    if (!data || !currentNovel.value) return
    
    try
    {
      const progressData: ReadingProgress = JSON.parse(data)
      if (progressData.novelId === currentNovel.value.id)
      {
        currentPosition.value = progressData.currentPosition
      }
    }
    catch (error)
    {
      console.error('加载进度失败:', error)
    }
  }
  
  /**
   * 保存书签到本地存储
   */
  function saveBookmarks(): void
  {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks.value))
  }
  
  /**
   * 加载书签
   */
  function loadBookmarks(): void
  {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (!data) return
    
    try
    {
      bookmarks.value = JSON.parse(data)
    }
    catch (error)
    {
      console.error('加载书签失败:', error)
    }
  }
  
  /**
   * 保存到本地存储
   */
  function saveToStorage(): void
  {
    if (currentNovel.value)
    {
      localStorage.setItem(STORAGE_KEYS.CURRENT_NOVEL, JSON.stringify(currentNovel.value))
    }
  }
  
  /**
   * 从本地存储加载
   */
  function loadFromStorage(): void
  {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_NOVEL)
    if (!data) return
    
    try
    {
      const novel: Novel = JSON.parse(data)
      loadNovel(novel)
      loadProgress()
      loadBookmarks()
    }
    catch (error)
    {
      console.error('加载小说失败:', error)
    }
  }
  
  /**
   * 添加到最近文件列表
   * @param metadata 小说元数据
   */
  function addToRecentFiles(metadata: NovelMetadata): void
  {
    // 移除重复项
    recentFiles.value = recentFiles.value.filter(f => f.title !== metadata.title)
    
    // 添加到开头
    recentFiles.value.unshift(metadata)
    
    // 限制数量（最多10个）
    if (recentFiles.value.length > 10)
    {
      recentFiles.value = recentFiles.value.slice(0, 10)
    }
    
    // 保存
    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(recentFiles.value))
  }
  
  /**
   * 加载最近文件列表
   */
  function loadRecentFiles(): void
  {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_FILES)
    if (!data) return
    
    try
    {
      recentFiles.value = JSON.parse(data)
    }
    catch (error)
    {
      console.error('加载最近文件失败:', error)
    }
  }
  
  // ===== 初始化 =====
  
  // 自动加载数据
  loadFromStorage()
  loadRecentFiles()
  
  return {
    // State
    currentNovel,
    content,
    currentPosition,
    bookmarks,
    recentFiles,
    
    // Getters
    totalLength,
    progress,
    progressPercent,
    remainingChars,
    hasNovel,
    metadata,
    
    // Actions
    loadNovel,
    clearNovel,
    updatePosition,
    jumpTo,
    addBookmark,
    removeBookmark,
    getBookmark,
    saveProgress,
    loadProgress,
    saveBookmarks,
    loadBookmarks,
    loadFromStorage,
    loadRecentFiles
  }
})

