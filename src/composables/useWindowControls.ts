/**
 * 窗口控制 Composable
 * 提供窗口最小化、最大化、关闭等功能
 * 支持 Tauri 2.x 和浏览器环境
 * 
 * @description
 * 重新设计的窗口控制系统，使用Tauri 2.x最新API
 * 参考官方文档：https://v2.tauri.app/reference/javascript/api/namespacewindow/
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { createLogger } from '@/services/logger'

const logger = createLogger('WindowControls')
import type { UnlistenFn } from '@tauri-apps/api/event'

// 检测是否在 Tauri 环境中
const isTauri = (): boolean => {
  // 方法1: 检查 window.__TAURI__ 对象
  const hasTauriGlobal = typeof window !== 'undefined' && '__TAURI__' in window
  
  // 方法2: 检查 window.__TAURI_INTERNALS__ (Tauri 2.x 新增)
  const hasTauriInternals = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  
  // 方法3: 尝试调用 getCurrentWebviewWindow 看是否抛出异常
  let canGetWindow = false
  try {
    const testWindow = getCurrentWebviewWindow()
    canGetWindow = testWindow !== null && testWindow !== undefined
  } catch {
    canGetWindow = false
  }
  
  const result = hasTauriGlobal || hasTauriInternals || canGetWindow
  
  logger.debug('Tauri 环境检测', {
    hasWindow: typeof window !== 'undefined',
    hasTauriGlobal,
    hasTauriInternals,
    canGetWindow
  })
  
  return result
}

// 窗口状态接口
interface WindowState {
  isMaximized: boolean
  isFullscreen: boolean
  isFocused: boolean
  isMinimized: boolean
  isVisible: boolean
}

export function useWindowControls() {
  // 窗口状态
  const windowState = ref<WindowState>({
    isMaximized: false,
    isFullscreen: false,
    isFocused: true,
    isMinimized: false,
    isVisible: true
  })

  // 事件监听器清理函数
  const unlistenFunctions = ref<UnlistenFn[]>([])

  // 是否支持窗口控制
  const supportsWindowControls = computed(() => isTauri())

  /**
   * 最小化窗口
   */
  const minimize = async (): Promise<void> => {
    if (!isTauri()) {
      logger.warn('浏览器模式：最小化功能仅在 Tauri 桌面应用中可用')
      return
    }

    try {
      const window = getCurrentWebviewWindow()
      await window.minimize()
      logger.debug('窗口最小化成功')
    } catch (error) {
      logger.error('窗口最小化失败', error)
    }
  }

  /**
   * 最大化/还原窗口
   */
  const toggleMaximize = async (): Promise<void> => {
    if (!isTauri()) {
      // 浏览器环境：使用全屏 API
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(err => logger.error('全屏请求失败', err))
        windowState.value.isMaximized = true
      } else {
        await document.exitFullscreen()
        windowState.value.isMaximized = false
      }
      return
    }

    try {
      const window = getCurrentWebviewWindow()
      await window.toggleMaximize()
      // 立即更新状态
      windowState.value.isMaximized = await window.isMaximized()
      logger.debug('窗口最大化/还原成功', { isMaximized: windowState.value.isMaximized })
    } catch (error) {
      logger.error('窗口最大化/还原失败', error)
    }
  }

  /**
   * 关闭窗口
   * 根据 Tauri 2.x 官方文档，推荐使用 destroy() 而不是 close()
   * destroy() 会立即销毁窗口，而 close() 可能需要特殊处理
   */
  const close = async (): Promise<void> => {
    logger.debug('开始关闭窗口')
    
    if (!isTauri()) {
      logger.debug('浏览器模式：尝试关闭标签页')
      // 在浏览器中，window.close() 只能关闭通过脚本打开的窗口
      window.close()
      return
    }

    try {
      const appWindow = getCurrentWebviewWindow()
      logger.debug('调用 destroy() 关闭窗口')
      await appWindow.destroy()
      logger.debug('窗口已成功关闭')
    } catch (error) {
      logger.error('窗口关闭失败', error)
    }
  }

  /**
   * 切换全屏
   */
  const toggleFullscreen = async (): Promise<void> => {
    if (!isTauri()) {
      // 浏览器环境：使用全屏 API
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        windowState.value.isFullscreen = true
      } else {
        await document.exitFullscreen()
        windowState.value.isFullscreen = false
      }
      return
    }

    try {
      const window = getCurrentWebviewWindow()
      const isFullscreen = await window.isFullscreen()
      await window.setFullscreen(!isFullscreen)
      windowState.value.isFullscreen = !isFullscreen
      logger.debug('全屏切换成功', { isFullscreen: windowState.value.isFullscreen })
    } catch (error) {
      logger.error('全屏切换失败', error)
    }
  }

  /**
   * 设置窗口标题
   */
  const setTitle = async (title: string): Promise<void> => {
    if (!isTauri()) {
      document.title = title
      return
    }

    try {
      const window = getCurrentWebviewWindow()
      await window.setTitle(title)
      logger.debug('设置标题成功', { title })
    } catch (error) {
      logger.error('设置标题失败', error)
    }
  }

  /**
   * 显示窗口
   */
  const show = async (): Promise<void> => {
    if (!isTauri()) return

    try {
      const window = getCurrentWebviewWindow()
      await window.show()
      windowState.value.isVisible = true
      logger.debug('显示窗口成功')
    } catch (error) {
      logger.error('显示窗口失败', error)
    }
  }

  /**
   * 隐藏窗口
   */
  const hide = async (): Promise<void> => {
    if (!isTauri()) return

    try {
      const window = getCurrentWebviewWindow()
      await window.hide()
      windowState.value.isVisible = false
      logger.debug('隐藏窗口成功')
    } catch (error) {
      logger.error('隐藏窗口失败', error)
    }
  }

  /**
   * 设置窗口是否可调整大小
   */
  const setResizable = async (resizable: boolean): Promise<void> => {
    if (!isTauri()) return

    try {
      const window = getCurrentWebviewWindow()
      await window.setResizable(resizable)
      logger.debug('设置可调整大小成功', { resizable })
    } catch (error) {
      logger.error('设置可调整大小失败', error)
    }
  }

  /**
   * 更新窗口状态
   */
  const updateWindowState = async (): Promise<void> => {
    if (!isTauri()) {
      // 浏览器环境：检查全屏状态
      windowState.value.isFullscreen = !!document.fullscreenElement
      windowState.value.isMaximized = !!document.fullscreenElement
      return
    }

    try {
      const window = getCurrentWebviewWindow()
      
      // 批量获取窗口状态
      const [isMaximized, isFullscreen, isFocused, isMinimized, isVisible] = await Promise.all([
        window.isMaximized(),
        window.isFullscreen(),
        window.isFocused(),
        window.isMinimized(),
        window.isVisible()
      ])

      windowState.value = {
        isMaximized,
        isFullscreen,
        isFocused,
        isMinimized,
        isVisible
      }
    } catch (error) {
      logger.error('更新窗口状态失败', error)
    }
  }

  /**
   * 监听窗口事件
   */
  const setupEventListeners = async (): Promise<void> => {
    if (!isTauri()) {
      // 浏览器环境事件监听
      const handleFullscreenChange = () => {
        windowState.value.isFullscreen = !!document.fullscreenElement
        windowState.value.isMaximized = !!document.fullscreenElement
      }

      const handleFocus = () => {
        windowState.value.isFocused = true
      }

      const handleBlur = () => {
        windowState.value.isFocused = false
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)
      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)

      // 清理函数
      onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('blur', handleBlur)
      })
      return
    }

    try {
      const window = getCurrentWebviewWindow()

      // 监听窗口焦点事件
      const unlistenFocus = await window.onFocusChanged(({ payload: focused }) => {
        windowState.value.isFocused = focused
        logger.debug('窗口焦点变化', { focused })
      })

      // 监听窗口大小调整事件
      const unlistenResized = await window.onResized(() => {
        updateWindowState()
        logger.debug('窗口大小调整')
      })

      // 监听窗口移动事件
      const unlistenMoved = await window.onMoved(() => {
        logger.debug('窗口位置移动')
      })

      // 监听窗口关闭请求事件（可用于阻止关闭）
      const unlistenCloseRequested = await window.onCloseRequested(async (_event) => {
        logger.debug('窗口关闭请求')
        // 如果需要阻止关闭，可以使用: _event.preventDefault()
      })

      // 存储清理函数
      unlistenFunctions.value.push(
        unlistenFocus,
        unlistenResized,
        unlistenMoved,
        unlistenCloseRequested
      )

      logger.debug('事件监听器设置成功')
    } catch (error) {
      logger.error('设置事件监听器失败', error)
    }
  }

  /**
   * 清理事件监听器
   */
  const cleanup = (): void => {
    unlistenFunctions.value.forEach(unlisten => {
      try {
        unlisten()
      } catch (error) {
        logger.error('清理事件监听器失败', error)
      }
    })
    unlistenFunctions.value = []
  }

  // 组件挂载时初始化
  onMounted(async () => {
    logger.info('初始化窗口控制', {
      isTauri: isTauri(),
      hasTauriGlobal: typeof window !== 'undefined' ? !!window.__TAURI__ : false
    })
    
    await updateWindowState()
    await setupEventListeners()
    
    logger.info('窗口控制初始化完成')
  })

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
    logger.debug('窗口控制已清理')
  })

  return {
    // 状态
    windowState,
    supportsWindowControls,
    
    // 计算属性
    isMaximized: computed(() => windowState.value.isMaximized),
    isFullscreen: computed(() => windowState.value.isFullscreen),
    isFocused: computed(() => windowState.value.isFocused),
    isMinimized: computed(() => windowState.value.isMinimized),
    isVisible: computed(() => windowState.value.isVisible),

    // 方法
    minimize,
    toggleMaximize,
    close,
    toggleFullscreen,
    setTitle,
    show,
    hide,
    setResizable,
    updateWindowState,
    
    // 工具方法
    isTauri: () => isTauri()
  }
}
