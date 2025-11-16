/**
 * 小说本地存储相关功能
 */

import type { Ref } from 'vue'
import { nextTick } from 'vue'
import type { Novel, NovelMetadata, Bookmark, ReadingProgress } from '@/types/novel'
import { STORAGE_KEYS } from '@/utils/constants'
import { createLogger } from '@/services/logger'

const logger = createLogger('NovelStorage')

/**
 * 创建存储相关功能
 */
export function createNovelStorage(state: {
  currentNovel: Ref<Novel | null>
  currentPosition: Ref<number>
  bookmarks: Ref<Bookmark[]>
  recentFiles: Ref<NovelMetadata[]>
  displayName: Ref<string>
  isRestoringFromHistory: Ref<boolean>
  progress: Ref<number>
}) {
  /**
   * 保存阅读进度
   */
  function saveProgress(): void {
    if (!state.currentNovel.value) return
    
    const progressData: ReadingProgress = {
      novelId: state.currentNovel.value.id,
      currentPosition: state.currentPosition.value,
      percentage: state.progress.value,
      lastReadAt: Date.now()
    }
    
    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progressData))
  }
  
  /**
   * 加载阅读进度
   */
  function loadProgress(): void {
    const data = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS)
    if (!data || !state.currentNovel.value) return
    
    try {
      const progressData: ReadingProgress = JSON.parse(data)
      if (progressData.novelId === state.currentNovel.value.id) {
        state.currentPosition.value = progressData.currentPosition
      }
    } catch (error) {
      logger.error('加载进度失败', error)
    }
  }
  
  /**
   * 保存书签到本地存储
   */
  function saveBookmarks(): void {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(state.bookmarks.value))
  }
  
  /**
   * 加载书签
   */
  function loadBookmarks(): void {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (!data) return
    
    try {
      state.bookmarks.value = JSON.parse(data)
    } catch (error) {
      logger.error('加载书签失败', error)
    }
  }
  
  /**
   * 保存到本地存储
   */
  function saveToStorage(): void {
    if (state.currentNovel.value) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_NOVEL, JSON.stringify(state.currentNovel.value))
    }
  }
  
  /**
   * 添加到最近文件列表
   * @param metadata 小说元数据
   */
  function addToRecentFiles(metadata: NovelMetadata): void {
    // 移除重复项
    state.recentFiles.value = state.recentFiles.value.filter(f => f.title !== metadata.title)
    
    // 添加到开头
    state.recentFiles.value.unshift(metadata)
    
    // 限制数量（最多10个）
    if (state.recentFiles.value.length > 10) {
      state.recentFiles.value = state.recentFiles.value.slice(0, 10)
    }
    
    // 保存
    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(state.recentFiles.value))
  }
  
  /**
   * 加载最近文件列表
   */
  function loadRecentFiles(): void {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_FILES)
    if (!data) return
    
    try {
      state.recentFiles.value = JSON.parse(data)
    } catch (error) {
      logger.error('加载最近文件失败', error)
    }
  }
  
  /**
   * 加载显示名称
   */
  function loadDisplayName(): void {
    const data = localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME)
    if (data) {
      state.displayName.value = data
    }
  }
  
  /**
   * 设置显示的文件名
   * @param name 新的显示名称
   */
  function setDisplayName(name: string): void {
    state.displayName.value = name || '文档-Word'
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, state.displayName.value)
  }
  
  /**
   * 从本地存储加载
   * @param loadNovelFn 加载小说的函数
   */
  async function loadFromStorage(loadNovelFn: (novel: Novel, filePath?: string, isHistoryRestore?: boolean) => Promise<void>): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_NOVEL)
    if (!data) return
    
    try {
      const novel: Novel = JSON.parse(data)
      // 页面刷新时也需要设置恢复标志，避免 Editor 清空内容
      logger.debug('从存储加载，设置恢复标志')
      state.isRestoringFromHistory.value = true
      await nextTick()
      await nextTick()
      
      await loadNovelFn(novel, undefined, true) // 传递 isHistoryRestore=true
      loadProgress()
      loadBookmarks()
      
      // 延迟重置标志，确保 Editor 已恢复内容
      setTimeout(() => {
        logger.debug('存储加载完成，重置恢复标志')
        state.isRestoringFromHistory.value = false
      }, 500)
    } catch (error) {
      logger.error('加载小说失败', error)
      state.isRestoringFromHistory.value = false
    }
  }
  
  return {
    saveProgress,
    loadProgress,
    saveBookmarks,
    loadBookmarks,
    saveToStorage,
    addToRecentFiles,
    loadRecentFiles,
    loadDisplayName,
    setDisplayName,
    loadFromStorage
  }
}
