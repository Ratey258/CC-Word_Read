/**
 * 键盘快捷键管理 Composable
 */

import { onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useFileImporter } from '@/composables/useFileImporter'
import { useNovelReader } from '@/composables/useNovelReader'

export interface ShortcutHandler {
  /** 快捷键组合（如 'Ctrl+O'） */
  combination: string
  /** 处理函数 */
  handler: (event: KeyboardEvent) => void
  /** 描述 */
  description?: string
  /** 是否启用 */
  enabled?: boolean
}

export function useKeyboardShortcuts() {
  const settingsStore = useSettingsStore()
  const novelStore = useNovelStore()
  const readerStore = useReaderStore()
  
  const { importFile } = useFileImporter()
  const { startReading, pauseReading, resumeReading } = useNovelReader()

  /**
   * 解析键盘事件为快捷键字符串
   * @param event 键盘事件
   * @returns 快捷键字符串（如 'Ctrl+O'）
   */
  function parseKeyboardEvent(event: KeyboardEvent): string {
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    if (event.metaKey) parts.push('Meta')
    
    // 获取实际按键
    const key = event.key
    if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key.toUpperCase())
    }
    
    return parts.join('+')
  }

  /**
   * 检查快捷键是否匹配
   * @param event 键盘事件
   * @param combination 快捷键组合
   * @returns 是否匹配
   */
  function matchesShortcut(event: KeyboardEvent, combination: string): boolean {
    const eventCombo = parseKeyboardEvent(event)
    return eventCombo === combination.toUpperCase()
  }

  /**
   * 注册的快捷键处理器
   */
  const shortcuts: ShortcutHandler[] = [
    // 文件操作
    {
      combination: 'Ctrl+O',
      description: '打开文件',
      handler: (event) => {
        event.preventDefault()
        importFile()
      }
    },
    {
      combination: 'Ctrl+S',
      description: '保存进度',
      handler: (event) => {
        event.preventDefault()
        if (novelStore.hasNovel) {
          novelStore.saveProgress()
        }
      }
    },
    
    // 阅读控制
    {
      combination: 'Ctrl+P',
      description: '暂停/继续',
      handler: (event) => {
        event.preventDefault()
        if (readerStore.isReading && !readerStore.isPaused) {
          pauseReading()
        } else if (readerStore.isPaused) {
          resumeReading()
        }
      }
    },
    {
      combination: 'Ctrl+Enter',
      description: '开始阅读',
      handler: (event) => {
        event.preventDefault()
        if (novelStore.hasNovel && !readerStore.isReading) {
          startReading()
        }
      }
    },
    
    // 导航快捷键
    {
      combination: 'Ctrl+G',
      description: '跳转到指定位置',
      handler: (event) => {
        event.preventDefault()
        // 触发跳转对话框（由 UI 组件处理）
        window.dispatchEvent(new CustomEvent('show-jump-dialog'))
      }
    },
    {
      combination: 'Ctrl+Home',
      description: '跳到开头',
      handler: (event) => {
        event.preventDefault()
        if (novelStore.hasNovel) {
          novelStore.jumpTo(0)
        }
      }
    },
    {
      combination: 'Ctrl+End',
      description: '跳到末尾',
      handler: (event) => {
        event.preventDefault()
        if (novelStore.hasNovel && novelStore.content) {
          novelStore.jumpTo(novelStore.content.length)
        }
      }
    },
    
    // 书签操作
    {
      combination: 'Ctrl+D',
      description: '添加书签',
      handler: (event) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('add-bookmark'))
      }
    },
    {
      combination: 'Ctrl+B',
      description: '显示书签列表',
      handler: (event) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('show-bookmarks'))
      }
    },
    
    // 编辑器操作
    {
      combination: 'Ctrl+L',
      description: '清空编辑器',
      handler: (event) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('clear-editor'))
      }
    },
    
    // 设置
    {
      combination: 'Ctrl+,',
      description: '打开设置',
      handler: (event) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('show-settings'))
      }
    },
    
    // 帮助
    {
      combination: 'Shift+?',
      description: '显示快捷键帮助',
      handler: (event) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('show-shortcuts-help'))
      }
    }
  ]

  /**
   * 全局键盘事件处理
   * @param event 键盘事件
   */
  function handleGlobalKeyDown(event: KeyboardEvent): void {
    // 如果快捷键被禁用，不处理
    if (!settingsStore.settings.enableShortcuts) {
      return
    }

    // 检查是否在输入框中
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable

    // 遍历所有快捷键
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut.combination)) {
        // 如果在输入框中，只处理特定快捷键
        if (isInput) {
          // 只允许这些快捷键在输入框中工作
          const allowedInInput = ['Ctrl+S', 'Ctrl+P', 'Ctrl+G', 'Ctrl+D', 'Ctrl+B']
          if (!allowedInInput.includes(shortcut.combination)) {
            continue
          }
        }
        
        shortcut.handler(event)
        return
      }
    }
  }

  /**
   * 获取快捷键帮助信息
   * @returns 快捷键列表
   */
  function getShortcutHelp(): ShortcutHandler[] {
    return shortcuts.filter(s => s.description)
  }

  /**
   * 生命周期
   */
  onMounted(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown)
  })

  return {
    shortcuts,
    parseKeyboardEvent,
    matchesShortcut,
    getShortcutHelp
  }
}

