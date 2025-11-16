/**
 * 小说状态管理 Store（重构版）
 */

import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import type { Novel, Bookmark } from '@/types/novel'
import { parseChapters } from '@/utils/chapterParser'
import { useHistoryStore } from './history'
import { createNovelState, normalizeContent } from './novelState'
import { createNovelStorage } from './novelStorage'
import { createNovelChapters } from './novelChapters'
import { createLogger } from '@/services/logger'

const logger = createLogger('NovelStore')

export const useNovelStore = defineStore('novel', () => {
  // 创建状态
  const state = createNovelState()
  
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
      logger.debug('设置历史恢复标志')
      state.isRestoringFromHistory.value = true
      // 使用 nextTick 确保 Vue 已经更新所有依赖这个状态的组件
      await nextTick()
      // 再等待一次，确保所有 watch 都已经执行完毕
      await nextTick()
      logger.debug('Vue 已处理响应式更新')
    }
    
    const normalizedContent = normalizeContent(novel.content)

    state.currentNovel.value = {
      ...novel,
      content: normalizedContent
    }
    state.content.value = normalizedContent
    state.currentPosition.value = 0
    
    // 解析章节（如果小说对象中没有章节信息）
    if (!novel.chapters || novel.chapters.length === 0) {
      // 使用标准化后的内容解析章节，确保章节位置与实际阅读内容一致
      state.chapters.value = parseChapters(normalizedContent)
      // 更新小说对象中的章节信息
      if (state.currentNovel.value) {
        state.currentNovel.value.chapters = state.chapters.value
      }
    } else {
      state.chapters.value = novel.chapters
    }
    
    // 重置当前章节索引
    state.currentChapterIndex.value = -1
    
    // 保持默认显示名称为"文档-Word"，不使用导入的文件名
    state.displayName.value = '文档-Word'
    
    // 保存到本地存储
    storage.saveToStorage()
    
    // 添加到最近打开列表
    storage.addToRecentFiles(novel.metadata)
    
    // 添加到历史记录（仅在非历史恢复时添加）
    if (!isHistoryRestore) {
      const historyStore = useHistoryStore()
      historyStore.addToHistory(novel, filePath)
    }
    
    // 注意：isRestoringFromHistory 标志由调用方在恢复完成后重置
    // 不在这里重置，以确保整个恢复流程（包括恢复已读内容等）完成后才重置
  }
  
  /**
   * 设置历史恢复标志
   * @param flag 是否正在从历史记录恢复
   */
  function setRestoringFromHistory(flag: boolean): void {
    state.isRestoringFromHistory.value = flag
  }
  
  /**
   * 清空当前小说
   */
  function clearNovel(): void {
    state.currentNovel.value = null
    state.content.value = ''
    state.currentPosition.value = 0
    state.bookmarks.value = []
    state.chapters.value = []
    state.currentChapterIndex.value = -1
    state.displayName.value = '文档-Word'
  }
  
  /**
   * 更新阅读位置
   * @param position 新位置
   */
  function updatePosition(position: number): void {
    if (position >= 0 && position <= state.totalLength.value) {
      state.currentPosition.value = position
      storage.saveProgress()
      
      // 同步到历史记录
      if (state.currentNovel.value) {
        const historyStore = useHistoryStore()
        historyStore.updateProgress(state.currentNovel.value.id, position)
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
    state.bookmarks.value.push(bookmark)
    storage.saveBookmarks()
  }
  
  /**
   * 删除书签
   * @param bookmarkId 书签ID
   */
  function removeBookmark(bookmarkId: string): void {
    const index = state.bookmarks.value.findIndex(b => b.id === bookmarkId)
    if (index !== -1) {
      state.bookmarks.value.splice(index, 1)
      storage.saveBookmarks()
    }
  }
  
  /**
   * 获取书签
   * @param bookmarkId 书签ID
   */
  function getBookmark(bookmarkId: string): Bookmark | undefined {
    return state.bookmarks.value.find(b => b.id === bookmarkId)
  }
  
  /**
   * 更新编辑器内容长度
   * @param length 编辑器当前内容的字符数
   */
  function updateEditorContentLength(length: number): void {
    state.editorContentLength.value = length
  }
  
  // 创建存储功能
  const storage = createNovelStorage({
    currentNovel: state.currentNovel,
    currentPosition: state.currentPosition,
    bookmarks: state.bookmarks,
    recentFiles: state.recentFiles,
    displayName: state.displayName,
    isRestoringFromHistory: state.isRestoringFromHistory,
    progress: state.progress
  })
  
  // 创建章节功能
  const chapters = createNovelChapters(
    {
      currentNovel: state.currentNovel,
      content: state.content,
      currentPosition: state.currentPosition,
      chapters: state.chapters,
      currentChapterIndex: state.currentChapterIndex,
      hasChapters: state.hasChapters
    },
    {
      updatePosition,
      saveToStorage: storage.saveToStorage
    }
  )
  
  // ===== 初始化 =====
  
  // 自动加载数据
  storage.loadFromStorage(loadNovel)
  storage.loadRecentFiles()
  storage.loadDisplayName()
  
  return {
    // State
    currentNovel: state.currentNovel,
    content: state.content,
    currentPosition: state.currentPosition,
    editorContentLength: state.editorContentLength,
    bookmarks: state.bookmarks,
    recentFiles: state.recentFiles,
    displayName: state.displayName,
    isRestoringFromHistory: state.isRestoringFromHistory,
    chapters: state.chapters,
    currentChapterIndex: state.currentChapterIndex,
    
    // Getters
    totalLength: state.totalLength,
    progress: state.progress,
    progressPercent: state.progressPercent,
    remainingChars: state.remainingChars,
    hasNovel: state.hasNovel,
    metadata: state.metadata,
    hasChapters: state.hasChapters,
    currentChapter: chapters.currentChapter,
    chapterCount: state.chapterCount,
    
    // Actions
    loadNovel,
    clearNovel,
    setDisplayName: storage.setDisplayName,
    setRestoringFromHistory,
    updatePosition,
    updateEditorContentLength,
    jumpTo,
    addBookmark,
    removeBookmark,
    getBookmark,
    saveProgress: storage.saveProgress,
    loadProgress: storage.loadProgress,
    saveBookmarks: storage.saveBookmarks,
    loadBookmarks: storage.loadBookmarks,
    loadFromStorage: () => storage.loadFromStorage(loadNovel),
    loadRecentFiles: storage.loadRecentFiles,
    jumpToChapter: chapters.jumpToChapter,
    jumpToNextChapter: chapters.jumpToNextChapter,
    jumpToPrevChapter: chapters.jumpToPrevChapter,
    reparseChapters: chapters.reparseChapters
  }
})
