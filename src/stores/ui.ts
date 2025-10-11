/**
 * UI 状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Ribbon 标签页类型
 */
export type RibbonTab = 'home' | 'insert' | 'design' | 'layout' | 'view'

/**
 * 对话框类型
 */
export type DialogType = 'import' | 'jumpTo' | 'settings' | 'about' | null

export const useUIStore = defineStore('ui', () => {
  // ===== State =====
  
  /** 当前激活的 Ribbon 标签页 */
  const activeRibbonTab = ref<RibbonTab>('home')
  
  /** Ribbon 是否折叠 */
  const isRibbonCollapsed = ref<boolean>(false)
  
  /** 当前打开的对话框 */
  const activeDialog = ref<DialogType>(null)
  
  /** 状态栏是否可见 */
  const isStatusBarVisible = ref<boolean>(true)
  
  /** 侧边栏是否可见 */
  const isSidebarVisible = ref<boolean>(false)
  
  /** 侧边栏类型 */
  const sidebarType = ref<'bookmarks' | 'history' | null>(null)
  
  /** 加载状态 */
  const isLoading = ref<boolean>(false)
  
  /** 加载提示文本 */
  const loadingText = ref<string>('')
  
  /** 通知消息列表 */
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>>([])
  
  /** 是否显示欢迎页 */
  const showWelcome = ref<boolean>(true)
  
  /** 成功对话框配置 */
  const successDialog = ref<{
    show: boolean
    title?: string
    message?: string
    confirmText?: string
  }>({
    show: false
  })
  
  /** 是否显示新手引导 */
  const showOnboarding = ref<boolean>(false)
  
  // ===== Getters =====
  
  /** 是否有打开的对话框 */
  const hasActiveDialog = computed(() => activeDialog.value !== null)
  
  /** 是否有通知 */
  const hasNotifications = computed(() => notifications.value.length > 0)
  
  // ===== Actions =====
  
  /**
   * 切换 Ribbon 标签页
   * @param tab 标签页名称
   */
  function setActiveRibbonTab(tab: RibbonTab): void {
    activeRibbonTab.value = tab
    
    // 如果 Ribbon 折叠了，展开它
    if (isRibbonCollapsed.value) {
      isRibbonCollapsed.value = false
    }
  }
  
  /**
   * 切换 Ribbon 折叠状态
   */
  function toggleRibbonCollapse(): void {
    isRibbonCollapsed.value = !isRibbonCollapsed.value
  }
  
  /**
   * 打开对话框
   * @param type 对话框类型
   */
  function openDialog(type: Exclude<DialogType, null>): void {
    activeDialog.value = type
  }
  
  /**
   * 关闭对话框
   */
  function closeDialog(): void {
    activeDialog.value = null
  }
  
  /**
   * 切换状态栏可见性
   */
  function toggleStatusBar(): void {
    isStatusBarVisible.value = !isStatusBarVisible.value
  }
  
  /**
   * 打开侧边栏
   * @param type 侧边栏类型
   */
  function openSidebar(type: 'bookmarks' | 'history'): void {
    isSidebarVisible.value = true
    sidebarType.value = type
  }
  
  /**
   * 关闭侧边栏
   */
  function closeSidebar(): void {
    isSidebarVisible.value = false
    sidebarType.value = null
  }
  
  /**
   * 切换侧边栏
   * @param type 侧边栏类型
   */
  function toggleSidebar(type: 'bookmarks' | 'history'): void {
    if (isSidebarVisible.value && sidebarType.value === type) {
      closeSidebar()
    } else {
      openSidebar(type)
    }
  }
  
  /**
   * 显示加载状态
   * @param text 提示文本
   */
  function showLoading(text = '加载中...'): void {
    isLoading.value = true
    loadingText.value = text
  }
  
  /**
   * 隐藏加载状态
   */
  function hideLoading(): void {
    isLoading.value = false
    loadingText.value = ''
  }
  
  /**
   * 显示通知
   * @param type 通知类型
   * @param message 消息内容
   * @param duration 显示时长（毫秒），0 表示不自动关闭
   */
  function showNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration = 3000
  ): string {
    const id = `notification-${Date.now()}-${Math.random()}`
    
    notifications.value.push({
      id,
      type,
      message,
      duration
    })
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  /**
   * 移除通知
   * @param id 通知ID
   */
  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  /**
   * 清空所有通知
   */
  function clearNotifications(): void {
    notifications.value = []
  }
  
  /**
   * 显示成功消息
   * @param message 消息内容
   */
  function showSuccess(message: string): void {
    showNotification('success', message)
  }
  
  /**
   * 显示错误消息
   * @param message 消息内容
   */
  function showError(message: string): void {
    showNotification('error', message, 5000)
  }
  
  /**
   * 显示警告消息
   * @param message 消息内容
   */
  function showWarning(message: string): void {
    showNotification('warning', message)
  }
  
  /**
   * 显示信息消息
   * @param message 消息内容
   */
  function showInfo(message: string): void {
    showNotification('info', message)
  }
  
  /**
   * 隐藏欢迎页
   */
  function hideWelcome(): void {
    showWelcome.value = false
  }
  
  /**
   * 显示成功对话框
   * @param options 对话框配置
   */
  function showSuccessDialog(options: {
    title?: string
    message?: string
    confirmText?: string
  } = {}): void {
    successDialog.value = {
      show: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText
    }
  }
  
  /**
   * 隐藏成功对话框
   */
  function hideSuccessDialog(): void {
    successDialog.value.show = false
  }
  
  /**
   * 显示新手引导
   */
  function showOnboardingGuide(): void {
    showOnboarding.value = true
  }
  
  /**
   * 隐藏新手引导
   */
  function hideOnboardingGuide(): void {
    showOnboarding.value = false
  }
  
  /**
   * 重置 UI 状态
   */
  function reset(): void {
    activeRibbonTab.value = 'home'
    isRibbonCollapsed.value = false
    activeDialog.value = null
    isSidebarVisible.value = false
    sidebarType.value = null
    isLoading.value = false
    loadingText.value = ''
    clearNotifications()
  }
  
  return {
    // State
    activeRibbonTab,
    isRibbonCollapsed,
    activeDialog,
    isStatusBarVisible,
    isSidebarVisible,
    sidebarType,
    isLoading,
    loadingText,
    notifications,
    showWelcome,
    successDialog,
    showOnboarding,
    
    // Getters
    hasActiveDialog,
    hasNotifications,
    
    // Actions
    setActiveRibbonTab,
    toggleRibbonCollapse,
    openDialog,
    closeDialog,
    toggleStatusBar,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    showLoading,
    hideLoading,
    showNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideWelcome,
    showSuccessDialog,
    hideSuccessDialog,
    showOnboardingGuide,
    hideOnboardingGuide,
    reset
  }
})

