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
  cacheContent: !window.__TAURI__,
  // 在 Tauri 环境下启用文件存在性验证
  validateFileExists: !!window.__TAURI__,
  // 默认不自动删除无效记录，让用户选择
  autoRemoveInvalid: false
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
  const recentItems = computed(() => {
    // 先复制数组再排序，避免修改原数组
    const items = [...historyItems.value]
    return items
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
      .slice(0, 10)
  })
  
  // ===== Actions =====
  
  /**
   * 添加或更新历史记录
   * @param novel 小说对象
   * @param filePath 文件路径（可选，Tauri环境）
   */
  function addToHistory(novel: Novel, filePath?: string): void {
    // 查找现有记录：优先通过文件路径，其次通过标题+文件大小，最后通过ID
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
    
    // 如果通过路径没找到，尝试通过标题和文件大小查找（更可靠的去重）
    if (existingIndex < 0 && novel.metadata.title && novel.metadata.fileSize) {
      existingIndex = historyItems.value.findIndex(item => 
        item.title === novel.metadata.title && 
        item.fileSize === novel.metadata.fileSize
      )
    }
    
    // 最后尝试通过 ID 查找
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
    console.log('[HistoryStore] 清空历史记录')
    historyItems.value = []
    // 确保立即保存到 localStorage
    saveToStorage()
    // 额外验证：确保 localStorage 已清空
    console.log('[HistoryStore] 清空后验证:', localStorage.getItem(STORAGE_KEYS.HISTORY))
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
   * 去重历史记录（删除重复项，保留最新的）
   */
  function deduplicateHistory(): void {
    const seen = new Map<string, number>()
    const uniqueItems: HistoryItem[] = []
    
    // 按最后访问时间降序排序（最新的在前）
    const sorted = [...historyItems.value].sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
    
    for (const item of sorted) {
      // 生成唯一标识：优先使用路径，其次使用标题+文件大小
      const key = item.filePath 
        ? item.filePath.replace(/\\/g, '/') 
        : `${item.title}|${item.fileSize}`
      
      if (!seen.has(key)) {
        seen.set(key, 1)
        uniqueItems.push(item)
      } else {
        console.log('[HistoryStore] 发现重复项:', item.title, key)
      }
    }
    
    if (uniqueItems.length < historyItems.value.length) {
      console.log('[HistoryStore] 去重:', historyItems.value.length, '->', uniqueItems.length)
      historyItems.value = uniqueItems
      saveToStorage()
    }
  }
  
  /**
   * 验证并清理无效的历史记录（文件不存在的记录）
   * 仅在 Tauri 环境且启用 validateFileExists 配置时有效
   */
  async function validateAndCleanup(): Promise<void> {
    if (!config.value.validateFileExists || !window.__TAURI__) {
      return
    }
    
    console.log('[HistoryStore] 开始验证文件存在性...')
    
    try {
      const { exists } = await import('@tauri-apps/plugin-fs')
      const invalidItems: HistoryItem[] = []
      
      // 检查每个有路径的历史记录
      for (const item of historyItems.value) {
        if (item.filePath) {
          const fileExists = await exists(item.filePath)
          if (!fileExists) {
            console.log('[HistoryStore] 文件不存在:', item.filePath)
            invalidItems.push(item)
          }
        }
      }
      
      if (invalidItems.length > 0) {
        console.log(`[HistoryStore] 发现 ${invalidItems.length} 个无效记录`)
        
        if (config.value.autoRemoveInvalid) {
          // 自动删除无效记录
          historyItems.value = historyItems.value.filter(
            item => !invalidItems.some(invalid => invalid.id === item.id)
          )
          saveToStorage()
          console.log(`[HistoryStore] 已自动清理 ${invalidItems.length} 个无效记录`)
        } else {
          // 只记录，不自动删除
          console.log('[HistoryStore] 自动清理已禁用，无效记录将在用户访问时处理')
        }
      }
    } catch (error) {
      console.error('[HistoryStore] 验证文件存在性失败:', error)
    }
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
        
        // 加载后立即去重
        deduplicateHistory()
      }
      if (data.config) {
        config.value = { ...DEFAULT_CONFIG, ...data.config }
      }
      
      // 加载后自动清理过期记录
      if (config.value.autoCleanup) {
        cleanupOldItems()
      }
      
      // 验证并清理无效文件（异步执行，不阻塞加载）
      if (config.value.validateFileExists) {
        validateAndCleanup().catch(error => {
          console.error('[HistoryStore] 验证清理失败:', error)
        })
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
    deduplicateHistory,
    validateAndCleanup,
    sortHistory,
    searchHistory,
    updateConfig,
    loadFromStorage,
    saveToStorage,
    reset
  }
})

