/**
 * 窗口控制 Composable
 * 提供窗口最小化、最大化、关闭等功能
 * 支持 Tauri 和浏览器环境
 */

import { ref, computed, onMounted } from 'vue'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

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
    console.log('🔍 [Minimize] 开始执行最小化操作')
    console.log('🔍 [Minimize] isTauri():', isTauri())
    console.log('🔍 [Minimize] window.__TAURI__:', window.__TAURI__)
    
    if (isTauri())
    {
      try
      {
        const currentWindow = getCurrentWebviewWindow()
        console.log('🔍 [Minimize] currentWindow 对象:', currentWindow)
        console.log('🔍 [Minimize] currentWindow.label:', currentWindow.label)
        console.log('🔍 [Minimize] 调用 minimize() 方法...')
        
        const result = await currentWindow.minimize()
        console.log('✅ [Minimize] 最小化成功, 结果:', result)
      }
      catch (error)
      {
        console.error('❌ [Minimize] 最小化失败:', error)
        console.error('❌ [Minimize] 错误详情:', JSON.stringify(error, null, 2))
      }
    }
    else
    {
      // 浏览器环境：尝试使用 Window Management API（实验性功能）
      console.warn('⚠️ 窗口最小化功能仅在 Tauri 桌面应用中可用。当前为浏览器预览模式，窗口控制功能不可用。')
      console.warn('💡 提示：请在 Tauri 应用窗口（非浏览器 DevTools）中测试此功能。')
    }
  }

  /**
   * 最大化/还原窗口
   */
  const toggleMaximize = async () =>
  {
    console.log('🔍 [Maximize] 开始执行最大化/还原操作')
    console.log('🔍 [Maximize] isTauri():', isTauri())
    
    if (isTauri())
    {
      try
      {
        const currentWindow = getCurrentWebviewWindow()
        console.log('🔍 [Maximize] currentWindow 对象:', currentWindow)
        console.log('🔍 [Maximize] currentWindow.label:', currentWindow.label)
        console.log('🔍 [Maximize] 调用 toggleMaximize() 方法...')
        
        await currentWindow.toggleMaximize()
        windowState.value.isMaximized = await currentWindow.isMaximized()
        console.log('✅ [Maximize] 最大化/还原成功, isMaximized:', windowState.value.isMaximized)
      }
      catch (error)
      {
        console.error('❌ [Maximize] 最大化/还原失败:', error)
        console.error('❌ [Maximize] 错误详情:', JSON.stringify(error, null, 2))
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
    console.log('🔍 [Close] 开始执行关闭操作')
    console.log('🔍 [Close] isTauri():', isTauri())
    
    if (isTauri())
    {
      try
      {
        const currentWindow = getCurrentWebviewWindow()
        console.log('🔍 [Close] currentWindow 对象:', currentWindow)
        console.log('🔍 [Close] currentWindow.label:', currentWindow.label)
        
        // 先隐藏窗口，避免白屏（关键！）
        console.log('🔍 [Close] 调用 hide() 隐藏窗口...')
        await currentWindow.hide()
        console.log('✅ [Close] 窗口已隐藏')
        
        // 立即关闭窗口
        console.log('🔍 [Close] 调用 close() 方法...')
        await currentWindow.close()
        console.log('✅ [Close] 关闭成功')
      }
      catch (error)
      {
        console.error('❌ [Close] 关闭失败:', error)
        console.error('❌ [Close] 错误详情:', JSON.stringify(error, null, 2))
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
        const currentWindow = getCurrentWebviewWindow()
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
        await getCurrentWebviewWindow().setTitle(title)
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
        const currentWindow = getCurrentWebviewWindow()
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
        const currentWindow = getCurrentWebviewWindow()
        
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

