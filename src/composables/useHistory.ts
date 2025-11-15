/**
 * 历史记录功能 Composable
 */

import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useNovelStore } from '@/stores/novel'
import { useUIStore } from '@/stores/ui'
import { useDocumentParser } from './useDocumentParser'
import { useFileSystem } from './useFileSystem'
import type { HistoryItem } from '@/types/history'
import type { Novel, NovelFormat } from '@/types/novel'
import { validateNovelContent } from '@/utils/validator'

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
    // 立即设置历史恢复标志，在任何异步操作之前
    // 这是最关键的保护，必须在第一行就设置
    console.log('[History] ========== 开始历史恢复流程 ==========')
    console.log('[History] 立即设置历史恢复标志')
    novelStore.isRestoringFromHistory = true
    console.log('[History] 标志已设置，当前值:', novelStore.isRestoringFromHistory)
    
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
        const result = await reimportFromPath(item.filePath)
        
        if (!result.content) {
          // 根据错误类型提供不同的处理方式
          uiStore.hideLoading()
          
          if (result.error === 'not-found') {
            // 文件不存在 - 提供重新选择或删除的选项
            const action = await showFileNotFoundDialog(item)
            if (action === 'reselect') {
              // 用户选择重新选择文件
              await handleRelocateFile(item)
            } else if (action === 'remove') {
              // 用户选择删除历史记录
              historyStore.removeHistoryItem(item.id)
              uiStore.showSuccess('已删除无效的历史记录')
            }
          } else if (result.error === 'permission') {
            uiStore.showError('没有权限访问该文件，请检查文件权限')
          } else if (result.error === 'format') {
            uiStore.showWarning('该文件格式需要重新导入，请使用"打开文件"功能')
          } else {
            uiStore.showError(result.errorMessage || '无法读取文件，请重新导入')
          }
          return
        }
        
        novel = {
          id: item.id,
          content: result.content,
          totalLength: result.content.length,
          metadata: {
            title: item.title,
            author: item.author,
            format: item.format,
            fileSize: new Blob([result.content]).size,
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
      // 加载小说（这会重置位置到0）
      // 传递文件路径以便下次可以重新导入
      // 传递 isHistoryRestore=true 以避免 Editor 清空内容
      await novelStore.loadNovel(novel, item.filePath || undefined, true)
      
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
      
      // 在整个恢复流程结束后重置标志
      // 延迟一段时间以确保所有异步操作都已完成
      setTimeout(() => {
        console.log('[History] 恢复流程完成，重置历史恢复标志')
        novelStore.isRestoringFromHistory = false
      }, 500)
    }
  }
  
  /**
   * 显示文件不存在对话框
   * @param item 历史记录项
   * @returns 用户选择的操作
   */
  async function showFileNotFoundDialog(item: HistoryItem): Promise<'reselect' | 'remove' | 'cancel'> {
    return new Promise((resolve) => {
      const fileName = item.filePath?.split(/[\\/]/).pop() || item.title
      const message = `文件未找到：${fileName}\n\n原路径：${item.filePath}\n\n该文件可能已被移动或删除。`
      const options = '\n\n请选择：\n1. 重新选择文件位置\n2. 删除此历史记录\n3. 取消'
      
      // 使用自定义对话框（如果可用）或浏览器原生对话框
      if (window.__TAURI__) {
        import('@tauri-apps/plugin-dialog').then(({ ask, confirm }) => {
          // 先询问是否重新选择
          ask(message + '\n\n是否要重新选择该文件？', {
            title: '文件未找到',
            kind: 'warning',
            okLabel: '重新选择',
            cancelLabel: '删除记录'
          }).then(reselect => {
            if (reselect) {
              resolve('reselect')
            } else {
              // 确认是否删除
              confirm('确定要删除此历史记录吗？', {
                title: '确认删除',
                kind: 'warning',
                okLabel: '删除',
                cancelLabel: '取消'
              }).then(shouldRemove => {
                resolve(shouldRemove ? 'remove' : 'cancel')
              })
            }
          })
        })
      } else {
        // 浏览器环境使用原生对话框
        const choice = confirm(message + options)
        if (choice) {
          const remove = confirm('确定要删除此历史记录吗？')
          resolve(remove ? 'remove' : 'cancel')
        } else {
          resolve('cancel')
        }
      }
    })
  }

  /**
   * 处理重新定位文件
   * @param item 历史记录项
   */
  async function handleRelocateFile(item: HistoryItem): Promise<void> {
    try {
      uiStore.showLoading('请选择新的文件位置...')
      
      // 提前设置历史恢复标志
      console.log('[History] 设置历史恢复标志（重新定位文件）')
      novelStore.isRestoringFromHistory = true
      
      // 打开文件选择对话框
      const fileSystem = useFileSystem()
      
      const result = await fileSystem.openFileDialog({
        title: '选择文档文件',
        filters: [
          {
            name: '支持的文件',
            extensions: ['txt', 'docx', 'md']
          }
        ]
      })
      
      if (!result) {
        uiStore.hideLoading()
        return
      }
      
      // 读取新文件内容
      const { name: fileName, path: newPath, content: rawContent } = result
      
      // 解析文件
      const parsedDoc = await documentParser.parseDocument(rawContent, fileName)
      
      // 验证内容
      const validation = validateNovelContent(parsedDoc.text)
      if (!validation.valid) {
        uiStore.hideLoading()
        uiStore.showError(validation.message || '文件内容无效')
        return
      }
      
      // 提取文件格式
      const format = getFileFormat(fileName)
      
      // 创建 Novel 对象
      const novel: Novel = {
        id: item.id, // 保持相同的 ID
        content: parsedDoc.text,
        totalLength: parsedDoc.text.length,
        metadata: {
          title: item.title, // 保持原标题
          author: item.author,
          format: format,
          fileSize: new Blob([parsedDoc.text]).size,
          createdAt: item.createdAt,
          updatedAt: Date.now(),
          chapters: undefined
        }
      }
      
      // 保存原有的阅读位置
      const savedPosition = item.progress.currentPosition
      
      // 加载到当前阅读器（这会重置位置到0）
      // 传递 isHistoryRestore=true 以避免 Editor 清空内容
      await novelStore.loadNovel(novel, newPath || undefined, true)
      
      // 等待 Vue 更新 DOM
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 恢复阅读进度
      if (savedPosition > 0 && savedPosition < novel.totalLength) {
        console.log('[History] 恢复阅读位置:', savedPosition)
        
        // 获取编辑器元素
        const editorEl = document.querySelector('.document-content') as HTMLElement
        if (editorEl) {
          // 填充已读内容到编辑器
          const readContent = novel.content.substring(0, savedPosition)
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
        novelStore.updatePosition(savedPosition)
        
        // 更新历史记录以恢复正确的进度
        await new Promise(resolve => setTimeout(resolve, 50))
        historyStore.updateProgress(item.id, savedPosition)
      }
      
      uiStore.hideLoading()
      
      // 计算进度百分比
      const progressPercentage = Math.round((savedPosition / novel.totalLength) * 100)
      uiStore.showSuccess(`文件已重新加载，阅读进度已保留 (${progressPercentage}%)`)
    } catch (error) {
      console.error('[History] 重新定位文件失败:', error)
      uiStore.hideLoading()
      uiStore.showError('文件选择取消或失败')
    }
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns 文件是否存在
   */
  async function checkFileExists(filePath: string): Promise<boolean> {
    try {
      if (!window.__TAURI__) {
        return false
      }
      
      const { exists } = await import('@tauri-apps/plugin-fs')
      return await exists(filePath)
    } catch (error) {
      console.error('[History] 检查文件存在性失败:', error)
      return false
    }
  }

  /**
   * 从文件路径重新导入文件
   * @param filePath 文件路径
   * @returns 文件内容和错误信息
   */
  async function reimportFromPath(filePath: string): Promise<{
    content: string | null
    error?: 'not-found' | 'permission' | 'format' | 'unknown'
    errorMessage?: string
  }> {
    try {
      // 检查是否在 Tauri 环境
      if (!window.__TAURI__) {
        console.warn('[History] 不在 Tauri 环境，无法从路径读取')
        return { 
          content: null, 
          error: 'unknown',
          errorMessage: '浏览器环境不支持路径访问'
        }
      }
      
      // 检查文件是否存在
      const fileExists = await checkFileExists(filePath)
      if (!fileExists) {
        console.warn('[History] 文件不存在:', filePath)
        return { 
          content: null, 
          error: 'not-found',
          errorMessage: '文件不存在或已被移动/删除'
        }
      }
      
      // 提取文件名和格式
      const fileName = filePath.split(/[\\/]/).pop() || ''
      const format = getFileFormat(fileName)
      
      // 如果是 docx 或其他需要解析的格式
      if (format === 'docx') {
        console.warn('[History] DOCX 格式需要重新导入')
        return { 
          content: null, 
          error: 'format',
          errorMessage: 'DOCX 格式需要重新导入'
        }
      }
      
      // 读取文件内容
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(filePath)
      
      // 对于文本文件，可以直接使用
      const parsedDoc = await documentParser.parseDocument(content, fileName)
      return { content: parsedDoc.text }
    } catch (error) {
      console.error('[History] 从路径重新导入失败:', error)
      
      // 分析错误类型
      const errorMsg = (error as Error)?.message || String(error)
      if (errorMsg.includes('permission') || errorMsg.includes('denied')) {
        return { 
          content: null, 
          error: 'permission',
          errorMessage: '没有权限访问该文件'
        }
      }
      
      return { 
        content: null, 
        error: 'unknown',
        errorMessage: `读取文件失败: ${errorMsg}`
      }
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

