/**
 * 窗口控制 Composable
 * 提供窗口最小化、最大化、关闭等功能
 * 支持 Tauri 和浏览器环境
 */

import { ref, computed, onMounted } from 'vue'

// 检测是否在 Tauri 环境中
const isTauri = () => '__TAURI__' in window

// 窗口状态
interface WindowState
{
  isMaximized: boolean
  isFullscreen: boolean
  isFocused: boolean
}

export function useWindowControls()
{
  // 窗口状态
  const windowState = ref<WindowState>({
    isMaximized: false,
    isFullscreen: false,
    isFocused: true
  })

  // 是否支持窗口控制
  const supportsWindowControls = computed(() => isTauri())

  /**
   * 最小化窗口
   */
  const minimize = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().minimize()
      }
      catch (error)
      {
        console.error('Failed to minimize window:', error)
      }
    }
    else
    {
      // 浏览器环境：尝试使用 Window Management API（实验性功能）
      console.log('Minimize window (browser mode - not supported)')
    }
  }

  /**
   * 最大化/还原窗口
   */
  const toggleMaximize = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()
        await currentWindow.toggleMaximize()
        windowState.value.isMaximized = await currentWindow.isMaximized()
      }
      catch (error)
      {
        console.error('Failed to toggle maximize:', error)
      }
    }
    else
    {
      // 浏览器环境：使用全屏 API
      if (!document.fullscreenElement)
      {
        document.documentElement.requestFullscreen().catch(err =>
        {
          console.error('Failed to enter fullscreen:', err)
        })
        windowState.value.isMaximized = true
      }
      else
      {
        document.exitFullscreen()
        windowState.value.isMaximized = false
      }
    }
  }

  /**
   * 关闭窗口
   */
  const close = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().close()
      }
      catch (error)
      {
        console.error('Failed to close window:', error)
      }
    }
    else
    {
      // 浏览器环境：关闭当前标签页/窗口
      window.close()
    }
  }

  /**
   * 切换全屏
   */
  const toggleFullscreen = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()
        const isFullscreen = await currentWindow.isFullscreen()
        await currentWindow.setFullscreen(!isFullscreen)
        windowState.value.isFullscreen = !isFullscreen
      }
      catch (error)
      {
        console.error('Failed to toggle fullscreen:', error)
      }
    }
    else
    {
      // 浏览器环境：使用全屏 API
      if (!document.fullscreenElement)
      {
        document.documentElement.requestFullscreen()
        windowState.value.isFullscreen = true
      }
      else
      {
        document.exitFullscreen()
        windowState.value.isFullscreen = false
      }
    }
  }

  /**
   * 设置窗口标题
   */
  const setTitle = async (title: string) =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().setTitle(title)
      }
      catch (error)
      {
        console.error('Failed to set window title:', error)
      }
    }
    else
    {
      // 浏览器环境：设置页面标题
      document.title = title
    }
  }

  /**
   * 获取窗口状态
   */
  const updateWindowState = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()
        windowState.value.isMaximized = await currentWindow.isMaximized()
        windowState.value.isFullscreen = await currentWindow.isFullscreen()
      }
      catch (error)
      {
        console.error('Failed to update window state:', error)
      }
    }
    else
    {
      // 浏览器环境：检查全屏状态
      windowState.value.isFullscreen = !!document.fullscreenElement
    }
  }

  /**
   * 监听窗口事件
   */
  const setupEventListeners = async () =>
  {
    if (isTauri())
    {
      try
      {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()
        
        // 监听窗口焦点变化
        await currentWindow.listen('tauri://focus', () =>
        {
          windowState.value.isFocused = true
        })

        await currentWindow.listen('tauri://blur', () =>
        {
          windowState.value.isFocused = false
        })

        // 监听窗口大小变化
        await currentWindow.listen('tauri://resize', async () =>
        {
          await updateWindowState()
        })
      }
      catch (error)
      {
        console.error('Failed to setup window event listeners:', error)
      }
    }
    else
    {
      // 浏览器环境：监听全屏变化
      document.addEventListener('fullscreenchange', () =>
      {
        windowState.value.isFullscreen = !!document.fullscreenElement
        windowState.value.isMaximized = !!document.fullscreenElement
      })

      // 监听窗口焦点
      window.addEventListener('focus', () =>
      {
        windowState.value.isFocused = true
      })

      window.addEventListener('blur', () =>
      {
        windowState.value.isFocused = false
      })
    }
  }

  // 组件挂载时初始化
  onMounted(async () =>
  {
    await updateWindowState()
    await setupEventListeners()
  })

  return {
    // 状态
    windowState,
    supportsWindowControls,
    isMaximized: computed(() => windowState.value.isMaximized),
    isFullscreen: computed(() => windowState.value.isFullscreen),
    isFocused: computed(() => windowState.value.isFocused),

    // 方法
    minimize,
    toggleMaximize,
    close,
    toggleFullscreen,
    setTitle,
    updateWindowState
  }
}

