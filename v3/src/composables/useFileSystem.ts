/**
 * 文件系统操作 Composable
 * 提供文件读写、对话框等功能
 * 支持 Tauri 和浏览器环境
 */

import { ref } from 'vue'

// ESLint 全局类型定义
/* global HTMLInputElement */

// 检测是否在 Tauri 环境中
const isTauri = () => '__TAURI__' in window

// 文件类型定义
export interface FileResult
{
  path: string | null
  name: string
  content: string
  size: number
  file?: File // 原始 File 对象（仅浏览器环境）
}

export interface FileDialogOptions
{
  title?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  defaultPath?: string
  multiple?: boolean
}

export function useFileSystem()
{
  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 打开文件选择对话框
   */
  const openFileDialog = async (options: FileDialogOptions = {}): Promise<FileResult | null> =>
  {
    isLoading.value = true
    error.value = null

    try
    {
      if (isTauri())
      {
        // Tauri 环境：使用 Tauri 对话框
        const { open } = await import('@tauri-apps/plugin-dialog')
        const { readTextFile } = await import('@tauri-apps/plugin-fs')

        const selected = await open({
          title: options.title || '选择文件',
          filters: options.filters || [
            { name: '文本文件', extensions: ['txt'] },
            { name: 'EPUB 电子书', extensions: ['epub'] },
            { name: '所有文件', extensions: ['*'] }
          ],
          defaultPath: options.defaultPath,
          multiple: false
        })

        if (!selected || Array.isArray(selected))
        {
          return null
        }

        // 读取文件内容
        const content = await readTextFile(selected)
        const name = selected.split(/[/\\]/).pop() || 'unknown'

        return {
          path: selected,
          name,
          content,
          size: content.length
        }
      }
      else
      {
        // 浏览器环境：使用 File API
        return new Promise((resolve) =>
        {
          const input = document.createElement('input')
          input.type = 'file'
          
          // 设置文件类型过滤
          if (options.filters && options.filters.length > 0)
          {
            const extensions = options.filters
              .flatMap(f => f.extensions)
              .filter(ext => ext !== '*')
              .map(ext => `.${ext}`)
            input.accept = extensions.join(',')
          }

          input.onchange = async (e) =>
          {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            
            if (!file)
            {
              resolve(null)
              return
            }

            // 对于文本文件，读取内容；对于二进制文件（如 docx），保留 File 对象
            const ext = file.name.split('.').pop()?.toLowerCase()
            let content = ''
            
            // 只为纯文本格式读取内容
            if (ext === 'txt' || ext === 'md')
            {
              content = await file.text()
            }

            resolve({
              path: null, // 浏览器环境无法获取真实路径
              name: file.name,
              content,
              size: file.size,
              file // 保留原始 File 对象供后续解析使用
            })
          }

          input.click()
        })
      }
    }
    catch (err)
    {
      error.value = err instanceof Error ? err.message : '文件打开失败'
      console.error('Failed to open file:', err)
      return null
    }
    finally
    {
      isLoading.value = false
    }
  }

  /**
   * 保存文件对话框
   */
  const saveFileDialog = async (
    content: string,
    options: FileDialogOptions & { defaultFileName?: string } = {}
  ): Promise<boolean> =>
  {
    isLoading.value = true
    error.value = null

    try
    {
      if (isTauri())
      {
        // Tauri 环境：使用 Tauri 保存对话框
        const { save } = await import('@tauri-apps/plugin-dialog')
        const { writeTextFile } = await import('@tauri-apps/plugin-fs')

        const filePath = await save({
          title: options.title || '保存文件',
          filters: options.filters || [
            { name: '文本文件', extensions: ['txt'] },
            { name: '所有文件', extensions: ['*'] }
          ],
          defaultPath: options.defaultFileName
        })

        if (!filePath)
        {
          return false
        }

        await writeTextFile(filePath, content)
        return true
      }
      else
      {
        // 浏览器环境：使用下载方式保存
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = options.defaultFileName || 'document.txt'
        a.click()
        URL.revokeObjectURL(url)
        return true
      }
    }
    catch (err)
    {
      error.value = err instanceof Error ? err.message : '文件保存失败'
      console.error('Failed to save file:', err)
      return false
    }
    finally
    {
      isLoading.value = false
    }
  }

  /**
   * 读取文件（通过路径）
   */
  const readFile = async (path: string): Promise<string | null> =>
  {
    if (!isTauri())
    {
      error.value = '浏览器环境不支持直接读取文件路径'
      return null
    }

    isLoading.value = true
    error.value = null

    try
    {
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(path)
      return content
    }
    catch (err)
    {
      error.value = err instanceof Error ? err.message : '文件读取失败'
      console.error('Failed to read file:', err)
      return null
    }
    finally
    {
      isLoading.value = false
    }
  }

  /**
   * 写入文件（通过路径）
   */
  const writeFile = async (path: string, content: string): Promise<boolean> =>
  {
    if (!isTauri())
    {
      error.value = '浏览器环境不支持直接写入文件路径'
      return false
    }

    isLoading.value = true
    error.value = null

    try
    {
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')
      await writeTextFile(path, content)
      return true
    }
    catch (err)
    {
      error.value = err instanceof Error ? err.message : '文件写入失败'
      console.error('Failed to write file:', err)
      return false
    }
    finally
    {
      isLoading.value = false
    }
  }

  /**
   * 检查文件是否存在
   */
  const fileExists = async (path: string): Promise<boolean> =>
  {
    if (!isTauri())
    {
      return false
    }

    try
    {
      const { exists } = await import('@tauri-apps/plugin-fs')
      return await exists(path)
    }
    catch (err)
    {
      console.error('Failed to check file existence:', err)
      return false
    }
  }

  /**
   * 获取应用数据目录
   */
  const getAppDataDir = async (): Promise<string | null> =>
  {
    if (!isTauri())
    {
      return null
    }

    try
    {
      const { appDataDir } = await import('@tauri-apps/api/path')
      return await appDataDir()
    }
    catch (err)
    {
      console.error('Failed to get app data directory:', err)
      return null
    }
  }

  /**
   * 获取应用配置目录
   */
  const getAppConfigDir = async (): Promise<string | null> =>
  {
    if (!isTauri())
    {
      return null
    }

    try
    {
      const { appConfigDir } = await import('@tauri-apps/api/path')
      return await appConfigDir()
    }
    catch (err)
    {
      console.error('Failed to get app config directory:', err)
      return null
    }
  }

  return {
    // 状态
    isLoading,
    error,

    // 方法
    openFileDialog,
    saveFileDialog,
    readFile,
    writeFile,
    fileExists,
    getAppDataDir,
    getAppConfigDir
  }
}

