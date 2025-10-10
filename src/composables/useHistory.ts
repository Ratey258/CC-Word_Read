/**
 * 历史记录功能 Composable
 */

import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useNovelStore } from '@/stores/novel'
import { useUIStore } from '@/stores/ui'
import { useDocumentParser } from './useDocumentParser'
import type { HistoryItem } from '@/types/history'
import type { Novel, NovelFormat } from '@/types/novel'

export function useHistory() {
  const historyStore = useHistoryStore()
  const novelStore = useNovelStore()
  const uiStore = useUIStore()
  const documentParser = useDocumentParser()
  
  // ===== Computed =====
  
  /** 最近打开的记录 */
  const recentItems = computed(() => historyStore.recentItems)
  
  /** 是否有历史记录 */
  const hasHistory = computed(() => historyStore.hasHistory)
  
  // ===== Methods =====
  
  /**
   * 从历史记录恢复阅读
   * @param item 历史记录项
   */
  async function loadFromHistory(item: HistoryItem): Promise<void> {
    try {
      console.log('[History] 开始加载历史记录:', item.title, item.id)
      uiStore.showLoading('正在加载小说...')
      
      let novel: Novel
      
      // 优先使用缓存内容
      if (item.content) {
        console.log('[History] 使用缓存内容，长度:', item.content.length)
        novel = {
          id: item.id,
          content: item.content,
          totalLength: item.totalLength,
          metadata: {
            title: item.title,
            author: item.author,
            format: item.format,
            fileSize: item.fileSize,
            createdAt: item.createdAt,
            updatedAt: item.lastAccessedAt,
            chapters: undefined
          }
        }
      } else if (item.filePath) {
        // 如果有文件路径，尝试重新读取文件
        console.log('[History] 从文件路径重新读取:', item.filePath)
        const content = await reimportFromPath(item.filePath)
        if (!content) {
          uiStore.showError('无法读取文件，请重新导入')
          uiStore.hideLoading()
          return
        }
        
        novel = {
          id: item.id,
          content: content,
          totalLength: content.length,
          metadata: {
            title: item.title,
            author: item.author,
            format: item.format,
            fileSize: new Blob([content]).size,
            createdAt: item.createdAt,
            updatedAt: Date.now(),
            chapters: undefined
          }
        }
      } else {
        // 没有内容也没有路径
        console.warn('[History] 内容未缓存且无文件路径')
        const isBrowser = !window.__TAURI__
        const errorMsg = isBrowser 
          ? '浏览器环境下内容未缓存，请重新导入文件'
          : '内容不可用，请重新导入文件'
        uiStore.showWarning(errorMsg)
        uiStore.hideLoading()
        return
      }
      
      console.log('[History] 加载小说，内容长度:', novel.content.length)
      // 加载小说（这会重置位置到0并添加到历史记录）
      // 传递文件路径以便下次可以重新导入
      novelStore.loadNovel(novel, item.filePath || undefined)
      
      // 等待 Vue 更新 DOM
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 立即恢复阅读位置和已读内容
      if (item.progress.currentPosition > 0) {
        console.log('[History] 恢复阅读位置:', item.progress.currentPosition)
        
        // 获取编辑器元素
        const editorEl = document.querySelector('.document-content') as HTMLElement
        if (editorEl) {
          // 填充已读内容到编辑器
          const readContent = novel.content.substring(0, item.progress.currentPosition)
          editorEl.textContent = readContent
          console.log('[History] 已恢复已读内容，长度:', readContent.length)
          
          // 将光标移到末尾
          const range = document.createRange()
          const selection = window.getSelection()
          if (selection && editorEl.childNodes.length > 0) {
            range.selectNodeContents(editorEl)
            range.collapse(false) // 折叠到末尾
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
        
        // 更新位置
        novelStore.updatePosition(item.progress.currentPosition)
        
        // 更新历史记录以恢复正确的进度
        await new Promise(resolve => setTimeout(resolve, 50))
        historyStore.updateProgress(item.id, item.progress.currentPosition)
      }
      
      // 显示恢复信息
      const progressPercent = Math.round(item.progress.percentage)
      console.log('[History] 加载完成，进度:', progressPercent + '%')
      uiStore.showSuccess(`已恢复到 ${progressPercent}% 的阅读位置`)
      
      uiStore.hideWelcome()
    } catch (error) {
      console.error('[History] 从历史记录加载失败:', error)
      uiStore.showError('加载失败，请重新导入文件')
    } finally {
      uiStore.hideLoading()
    }
  }
  
  /**
   * 从文件路径重新导入文件
   * @param filePath 文件路径
   * @returns 文件内容，失败返回 null
   */
  async function reimportFromPath(filePath: string): Promise<string | null> {
    try {
      // 检查是否在 Tauri 环境
      if (!window.__TAURI__) {
        console.warn('[History] 不在 Tauri 环境，无法从路径读取')
        return null
      }
      
      // 提取文件名和格式
      const fileName = filePath.split(/[\\/]/).pop() || ''
      const format = getFileFormat(fileName)
      
      // 读取文件内容
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(filePath)
      
      // 如果是 docx 或其他需要解析的格式
      if (format === 'docx') {
        console.warn('[History] DOCX 格式需要重新导入')
        return null
      }
      
      // 对于文本文件，可以直接使用
      const parsedDoc = await documentParser.parseDocument(content, fileName)
      return parsedDoc.text
    } catch (error) {
      console.error('[History] 从路径重新导入失败:', error)
      return null
    }
  }
  
  /**
   * 获取文件格式
   * @param fileName 文件名
   * @returns 文件格式
   */
  function getFileFormat(fileName: string): NovelFormat {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'txt':
        return 'txt'
      case 'md':
        return 'md'
      case 'docx':
        return 'docx'
      default:
        return 'txt'
    }
  }
  
  /**
   * 删除历史记录
   * @param novelId 小说ID
   */
  function removeHistory(novelId: string): void {
    historyStore.removeHistoryItem(novelId)
    uiStore.showSuccess('已删除历史记录')
  }
  
  /**
   * 清空所有历史记录
   */
  function clearAllHistory(): void {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      historyStore.clearHistory()
      uiStore.showSuccess('已清空历史记录')
    }
  }
  
  /**
   * 格式化时间显示
   * @param timestamp 时间戳
   */
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes} 分钟前`
    } else if (hours < 24) {
      return `${hours} 小时前`
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }
  
  /**
   * 格式化文件大小
   * @param bytes 字节数
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
  }
  
  /**
   * 获取文件格式图标
   * @param format 文件格式
   */
  function getFormatIcon(format: string): string {
    switch (format) {
      case 'txt':
        return '📄'
      case 'docx':
        return '📘'
      case 'md':
        return '📝'
      default:
        return '📄'
    }
  }
  
  return {
    // Computed
    recentItems,
    hasHistory,
    
    // Methods
    loadFromHistory,
    removeHistory,
    clearAllHistory,
    formatTime,
    formatFileSize,
    getFormatIcon
  }
}

