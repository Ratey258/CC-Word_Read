/**
 * 历史记录状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryItem, HistoryConfig, HistorySortBy } from '@/types/history'
import type { Novel } from '@/types/novel'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * 默认历史配置
 */
const DEFAULT_CONFIG: HistoryConfig = {
  maxItems: 50,
  autoCleanup: true,
  retentionDays: 30,
  // 浏览器环境必须缓存内容（无法通过路径重新读取）
  // Tauri 环境可以不缓存（可以通过路径重新读取）
  cacheContent: !window.__TAURI__
}

export const useHistoryStore = defineStore('history', () => {
  // ===== State =====
  
  /** 历史记录列表 */
  const historyItems = ref<HistoryItem[]>([])
  
  /** 历史配置 */
  const config = ref<HistoryConfig>(DEFAULT_CONFIG)
  
  // ===== Getters =====
  
  /** 历史记录总数 */
  const totalItems = computed(() => historyItems.value.length)
  
  /** 是否有历史记录 */
  const hasHistory = computed(() => historyItems.value.length > 0)
  
  /** 最近打开的记录（最多10条） */
  const recentItems = computed(() => 
    historyItems.value
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
      .slice(0, 10)
  )
  
  // ===== Actions =====
  
  /**
   * 添加或更新历史记录
   * @param novel 小说对象
   * @param filePath 文件路径（可选，Tauri环境）
   */
  function addToHistory(novel: Novel, filePath?: string): void {
    // 优先通过文件路径查找现有记录，如果没有路径则通过 ID 查找
    let existingIndex = -1
    if (filePath) {
      // 标准化路径进行比较
      const normalizedPath = filePath.replace(/\\/g, '/')
      existingIndex = historyItems.value.findIndex(item => {
        if (!item.filePath) return false
        const itemPath = item.filePath.replace(/\\/g, '/')
        return itemPath === normalizedPath
      })
    }
    
    // 如果通过路径没找到，再尝试通过 ID 查找
    if (existingIndex < 0) {
      existingIndex = historyItems.value.findIndex(item => item.id === novel.id)
    }
    
    // 浏览器环境必须缓存内容，否则无法重新加载
    const shouldCache = config.value.cacheContent || !window.__TAURI__
    
    // 如果找到现有记录，保留其 ID 和进度
    const existingItem = existingIndex >= 0 ? historyItems.value[existingIndex] : null
    
    const historyItem: HistoryItem = {
      id: existingItem?.id ?? novel.id, // 保留原有ID
      title: novel.metadata.title,
      author: novel.metadata.author,
      format: novel.metadata.format,
      fileSize: novel.metadata.fileSize,
      totalLength: novel.totalLength,
      filePath,
      progress: existingItem?.progress ?? { // 保留原有进度
        novelId: existingItem?.id ?? novel.id,
        currentPosition: 0,
        percentage: 0,
        lastReadAt: Date.now()
      },
      createdAt: existingItem?.createdAt ?? Date.now(),
      lastAccessedAt: Date.now(),
      isCompleted: existingItem?.isCompleted ?? false,
      content: shouldCache ? novel.content : undefined
    }
    
    if (existingIndex >= 0) {
      // 更新现有记录
      historyItems.value[existingIndex] = historyItem
    } else {
      // 添加新记录
      historyItems.value.unshift(historyItem)
      
      // 检查是否超过最大数量
      if (historyItems.value.length > config.value.maxItems) {
        historyItems.value = historyItems.value.slice(0, config.value.maxItems)
      }
    }
    
    // 自动清理旧记录
    if (config.value.autoCleanup) {
      cleanupOldItems()
    }
    
    saveToStorage()
  }
  
  /**
   * 更新历史记录的阅读进度
   * @param novelId 小说ID
   * @param currentPosition 当前位置
   */
  function updateProgress(novelId: string, currentPosition: number): void {
    const item = historyItems.value.find(h => h.id === novelId)
    if (!item) return
    
    const percentage = (currentPosition / item.totalLength) * 100
    
    item.progress = {
      novelId,
      currentPosition,
      percentage,
      lastReadAt: Date.now()
    }
    
    item.lastAccessedAt = Date.now()
    item.isCompleted = percentage >= 99 // 99%以上视为已完成
    
    saveToStorage()
  }
  
  /**
   * 获取指定历史记录
   * @param novelId 小说ID
   */
  function getHistoryItem(novelId: string): HistoryItem | undefined {
    return historyItems.value.find(item => item.id === novelId)
  }
  
  /**
   * 通过文件路径获取历史记录
   * @param filePath 文件路径
   */
  function getHistoryItemByPath(filePath: string): HistoryItem | undefined {
    if (!filePath) return undefined
    // 标准化路径（处理不同操作系统的路径分隔符）
    const normalizedPath = filePath.replace(/\\/g, '/')
    return historyItems.value.find(item => {
      if (!item.filePath) return false
      const itemPath = item.filePath.replace(/\\/g, '/')
      return itemPath === normalizedPath
    })
  }
  
  /**
   * 删除指定历史记录
   * @param novelId 小说ID
   */
  function removeHistoryItem(novelId: string): void {
    const index = historyItems.value.findIndex(item => item.id === novelId)
    if (index >= 0) {
      historyItems.value.splice(index, 1)
      saveToStorage()
    }
  }
  
  /**
   * 清空所有历史记录
   */
  function clearHistory(): void {
    historyItems.value = []
    saveToStorage()
  }
  
  /**
   * 清理过期的历史记录
   */
  function cleanupOldItems(): void {
    if (!config.value.autoCleanup) return
    
    const now = Date.now()
    const maxAge = config.value.retentionDays * 24 * 60 * 60 * 1000
    
    historyItems.value = historyItems.value.filter(item => {
      const age = now - item.lastAccessedAt
      return age < maxAge
    })
  }
  
  /**
   * 排序历史记录
   * @param sortBy 排序方式
   */
  function sortHistory(sortBy: HistorySortBy): HistoryItem[] {
    const sorted = [...historyItems.value]
    
    switch (sortBy) {
      case 'lastAccessed':
        return sorted.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
      case 'progress':
        return sorted.sort((a, b) => b.progress.percentage - a.progress.percentage)
      case 'createdAt':
        return sorted.sort((a, b) => b.createdAt - a.createdAt)
      default:
        return sorted
    }
  }
  
  /**
   * 搜索历史记录
   * @param keyword 关键词
   */
  function searchHistory(keyword: string): HistoryItem[] {
    if (!keyword.trim()) return historyItems.value
    
    const lowerKeyword = keyword.toLowerCase()
    return historyItems.value.filter(item =>
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.author?.toLowerCase().includes(lowerKeyword)
    )
  }
  
  /**
   * 更新配置
   * @param newConfig 新配置（部分）
   */
  function updateConfig(newConfig: Partial<HistoryConfig>): void {
    config.value = { ...config.value, ...newConfig }
    saveToStorage()
  }
  
  /**
   * 保存到本地存储
   */
  function saveToStorage(): void {
    try {
      const data = {
        items: historyItems.value,
        config: config.value
      }
      const jsonStr = JSON.stringify(data)
      console.log('[HistoryStore] 保存历史记录:', historyItems.value.length, '条', jsonStr.length, '字节')
      localStorage.setItem(STORAGE_KEYS.HISTORY, jsonStr)
      console.log('[HistoryStore] 保存成功')
    } catch (error) {
      console.error('[HistoryStore] 保存历史记录失败:', error)
    }
  }
  
  /**
   * 从本地存储加载
   */
  function loadFromStorage(): void {
    try {
      console.log('[HistoryStore] 开始加载历史记录')
      console.log('[HistoryStore] 当前环境:', window.__TAURI__ ? 'Tauri' : '浏览器')
      console.log('[HistoryStore] localStorage可用:', typeof localStorage !== 'undefined')
      
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
      console.log('[HistoryStore] 存储的数据:', saved ? `找到 ${saved.length} 字节` : '未找到')
      
      if (!saved) return
      
      const data = JSON.parse(saved)
      console.log('[HistoryStore] 解析的数据:', data)
      
      if (data.items && Array.isArray(data.items)) {
        historyItems.value = data.items
        console.log('[HistoryStore] 成功加载', data.items.length, '条历史记录')
      }
      if (data.config) {
        config.value = { ...DEFAULT_CONFIG, ...data.config }
      }
      
      // 加载后自动清理
      if (config.value.autoCleanup) {
        cleanupOldItems()
      }
    } catch (error) {
      console.error('[HistoryStore] 加载历史记录失败:', error)
    }
  }
  
  /**
   * 重置状态
   */
  function reset(): void {
    historyItems.value = []
    config.value = DEFAULT_CONFIG
  }
  
  // ===== 初始化 =====
  
  // 自动加载历史记录
  loadFromStorage()
  
  return {
    // State
    historyItems,
    config,
    
    // Getters
    totalItems,
    hasHistory,
    recentItems,
    
    // Actions
    addToHistory,
    updateProgress,
    getHistoryItem,
    getHistoryItemByPath,
    removeHistoryItem,
    clearHistory,
    cleanupOldItems,
    sortHistory,
    searchHistory,
    updateConfig,
    loadFromStorage,
    saveToStorage,
    reset
  }
})

