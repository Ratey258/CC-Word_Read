/**
 * 文件导入逻辑 Composable
 */

import { ref } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { useUIStore } from '@/stores/ui'
import { useFileSystem } from './useFileSystem'
import { useDocumentParser } from './useDocumentParser'
import { validateFile, validateNovelContent } from '@/utils/validator'
import type { Novel, NovelFormat } from '@/types/novel'
import { nanoid } from 'nanoid'

export function useFileImporter()
{
  const novelStore = useNovelStore()
  const uiStore = useUIStore()
  const fileSystem = useFileSystem()
  const documentParser = useDocumentParser()

  // ===== State =====
  
  /** 是否正在导入 */
  const isImporting = ref(false)

  /** 是否正在拖拽文件 */
  const isDragging = ref(false)

  /** 拖拽计数器（用于处理嵌套元素） */
  let dragCounter = 0

  // ===== Methods =====

  /**
   * 打开文件选择对话框并导入文件
   */
  async function importFile(): Promise<void>
  {
    try
    {
      // 打开文件选择对话框
      const result = await fileSystem.openFileDialog({
        title: '选择文档文件',
        filters: [
          {
            name: '支持的文件',
            extensions: ['txt', 'docx', 'md']
          },
          {
            name: '文本文件',
            extensions: ['txt']
          },
          {
            name: 'Word 文档',
            extensions: ['docx']
          },
          {
            name: 'Markdown',
            extensions: ['md']
          }
        ]
      })

      if (!result) return

      // 导入文件
      await importFileFromResult(result)
    }
    catch (error)
    {
      console.error('文件选择失败:', error)
      uiStore.showError('文件选择失败')
    }
  }

  /**
   * 导入文件内容
   * @param fileResult 文件结果对象
   */
  async function importFileFromResult(
    fileResult: { name: string; content: string; file?: File; path: string | null }
  ): Promise<void>
  {
    if (isImporting.value) return

    isImporting.value = true
    uiStore.showLoading('正在导入文件...')

    try
    {
      const { name: fileName, content, file } = fileResult

      // 解析文档
      let parsedDoc
      if (file)
      {
        // 浏览器环境：使用 File 对象
        parsedDoc = await documentParser.parseDocument(file, fileName)
      }
      else
      {
        // Tauri 环境：使用文本内容
        parsedDoc = await documentParser.parseDocument(content, fileName)
      }

      // 验证内容
      const validation = validateNovelContent(parsedDoc.text)
      if (!validation.valid)
      {
        throw new Error(validation.message)
      }

      // 提取文件信息
      const format = getFileFormat(fileName)

      // 创建小说对象
      const novel: Novel = {
        id: nanoid(),
        content: parsedDoc.text,
        totalLength: parsedDoc.text.length,
        metadata: {
          title: fileName.replace(/\.[^/.]+$/, ''), // 移除扩展名
          author: undefined,
          chapters: undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          fileSize: new Blob([parsedDoc.text]).size,
          format,
          // 保存 HTML 格式内容（如果有）
          htmlContent: parsedDoc.hasFormatting ? parsedDoc.html : undefined
        }
      }

      // 加载小说
      novelStore.loadNovel(novel)

      const formatInfo = parsedDoc.hasFormatting ? '（已保留格式）' : ''
      uiStore.showSuccess(`导入成功：${novel.metadata.title}${formatInfo}`)
      uiStore.hideWelcome()
    }
    catch (error)
    {
      console.error('文件导入失败:', error)
      uiStore.showError(
        error instanceof Error ? error.message : '文件导入失败'
      )
    }
    finally
    {
      isImporting.value = false
      uiStore.hideLoading()
    }
  }

  /**
   * 处理文件拖放
   * @param event 拖放事件
   */
  async function handleFileDrop(event: DragEvent): Promise<void>
  {
    event.preventDefault()

    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return

    const file = files[0]

    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid)
    {
      uiStore.showError(validation.message || '文件验证失败')
      return
    }

    // 读取文件内容
    const content = await readFileContent(file)

    // 创建小说对象
    const novel: Novel = {
      id: nanoid(),
      content,
      totalLength: content.length,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: undefined,
        chapters: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fileSize: file.size,
        format: validation.format || 'unknown'
      }
    }

    // 加载小说
    novelStore.loadNovel(novel)
    uiStore.showSuccess(`导入成功：${novel.metadata.title}`)
    uiStore.hideWelcome()
  }

  /**
   * 读取文件内容
   * @param file 文件对象
   */
  async function readFileContent(file: File): Promise<string>
  {
    return new Promise((resolve, reject) =>
    {
      const reader = new FileReader()

      reader.onload = (e) =>
      {
        const content = e.target?.result as string
        resolve(content)
      }

      reader.onerror = () =>
      {
        reject(new Error('文件读取失败'))
      }

      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
   * 获取文件格式
   * @param fileName 文件名
   */
  function getFileFormat(fileName: string): NovelFormat
  {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    switch (ext)
    {
      case 'txt':
        return 'txt'
      case 'docx':
        return 'docx'
      case 'md':
        return 'md'
      default:
        return 'unknown'
    }
  }

  /**
   * 导入示例小说（用于演示）
   */
  async function importSampleNovel(): Promise<void>
  {
    const sampleContent = `第一章 开始

这是一个示例小说的开始。

在一个风和日丽的早晨，主人公踏上了冒险的旅程。

第二章 冒险

旅途中充满了未知和惊喜...

（这只是一个演示文本，实际使用时请导入真实的小说文件）`

    const novel: Novel = {
      id: nanoid(),
      content: sampleContent,
      totalLength: sampleContent.length,
      metadata: {
        title: '示例小说',
        author: '示例作者',
        chapters: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fileSize: new Blob([sampleContent]).size,
        format: 'txt'
      }
    }

    novelStore.loadNovel(novel)
    uiStore.showSuccess('已加载示例小说')
    uiStore.hideWelcome()
  }

  /**
   * 处理拖拽进入
   */
  function handleDragEnter(event: DragEvent): void
  {
    event.preventDefault()
    dragCounter++
    if (dragCounter === 1)
    {
      isDragging.value = true
    }
  }

  /**
   * 处理拖拽离开
   */
  function handleDragLeave(event: DragEvent): void
  {
    event.preventDefault()
    dragCounter--
    if (dragCounter === 0)
    {
      isDragging.value = false
    }
  }

  /**
   * 处理拖拽放置
   */
  async function handleDrop(event: DragEvent): Promise<void>
  {
    event.preventDefault()
    dragCounter = 0
    isDragging.value = false

    await handleFileDrop(event)
  }

  return {
    // State
    isImporting,
    isDragging,

    // Methods
    importFile,
    importFileFromResult,
    handleFileDrop,
    importSampleNovel,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  }
}

