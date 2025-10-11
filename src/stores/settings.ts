/**
 * 设置状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings, Theme, Language } from '@/types/settings'
import { STORAGE_KEYS, EDITOR_DEFAULTS, WINDOW_DEFAULTS } from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  // ===== State =====
  
  /** 应用设置 */
  const settings = ref<AppSettings>({
    theme: 'light',
    language: 'zh-CN',
    editor: {
      fontFamily: EDITOR_DEFAULTS.FONT_FAMILY,
      fontSize: EDITOR_DEFAULTS.FONT_SIZE,
      lineHeight: EDITOR_DEFAULTS.LINE_HEIGHT,
      showLineNumbers: EDITOR_DEFAULTS.SHOW_LINE_NUMBERS,
      wordWrap: EDITOR_DEFAULTS.WORD_WRAP,
      showPageMarks: EDITOR_DEFAULTS.SHOW_PAGE_MARKS
    },
    window: {
      width: WINDOW_DEFAULTS.WIDTH,
      height: WINDOW_DEFAULTS.HEIGHT,
      fullscreen: false,
      maximized: false,
      zoomLevel: WINDOW_DEFAULTS.ZOOM_LEVEL
    },
    autoSave: true,
    autoSaveInterval: 5
  })
  
  /** 是否首次使用 */
  const isFirstTime = ref<boolean>(true)
  
  // ===== Actions =====
  
  /**
   * 设置主题
   * @param theme 主题类型
   */
  function setTheme(theme: Theme): void {
    settings.value.theme = theme
    applyTheme(theme)
    saveSettings()
  }
  
  /**
   * 应用主题
   * @param theme 主题类型
   */
  function applyTheme(theme: Theme): void {
    const effectiveTheme = theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
    
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }
  
  /**
   * 设置语言
   * @param language 语言类型
   */
  function setLanguage(language: Language): void {
    settings.value.language = language
    saveSettings()
  }
  
  /**
   * 更新编辑器设置
   * @param editorSettings 编辑器设置（部分）
   */
  function updateEditorSettings(editorSettings: Partial<AppSettings['editor']>): void {
    settings.value.editor = { ...settings.value.editor, ...editorSettings }
    saveSettings()
  }
  
  /**
   * 设置字号
   * @param fontSize 字号
   */
  function setFontSize(fontSize: number): void {
    if (fontSize >= 10 && fontSize <= 32) {
      settings.value.editor.fontSize = fontSize
      saveSettings()
    }
  }
  
  /**
   * 设置字体
   * @param fontFamily 字体
   */
  function setFontFamily(fontFamily: string): void {
    settings.value.editor.fontFamily = fontFamily
    saveSettings()
  }
  
  /**
   * 更新窗口设置
   * @param windowSettings 窗口设置（部分）
   */
  function updateWindowSettings(windowSettings: Partial<AppSettings['window']>): void {
    settings.value.window = { ...settings.value.window, ...windowSettings }
    saveSettings()
  }
  
  /**
   * 设置缩放比例
   * @param zoomLevel 缩放比例（50-200）
   */
  function setZoomLevel(zoomLevel: number): void {
    if (zoomLevel >= 50 && zoomLevel <= 200) {
      settings.value.window.zoomLevel = zoomLevel
      applyZoom(zoomLevel)
      saveSettings()
    }
  }
  
  /**
   * 应用缩放
   * @param zoomLevel 缩放比例
   */
  function applyZoom(zoomLevel: number): void {
    document.documentElement.style.zoom = `${zoomLevel}%`
  }
  
  /**
   * 切换全屏
   */
  function toggleFullscreen(): void {
    settings.value.window.fullscreen = !settings.value.window.fullscreen
    saveSettings()
  }
  
  /**
   * 切换自动保存
   */
  function toggleAutoSave(): void {
    settings.value.autoSave = !settings.value.autoSave
    saveSettings()
  }
  
  /**
   * 设置自动保存间隔
   * @param interval 间隔（秒）
   */
  function setAutoSaveInterval(interval: number): void {
    if (interval >= 1 && interval <= 60) {
      settings.value.autoSaveInterval = interval
      saveSettings()
    }
  }
  
  /**
   * 标记已完成首次使用引导
   */
  function completeOnboarding(): void {
    isFirstTime.value = false
    saveSettings()
  }
  
  
  /**
   * 重置为默认设置
   */
  function resetToDefaults(): void {
    settings.value = {
      theme: 'light',
      language: 'zh-CN',
      editor: {
        fontFamily: EDITOR_DEFAULTS.FONT_FAMILY,
        fontSize: EDITOR_DEFAULTS.FONT_SIZE,
        lineHeight: EDITOR_DEFAULTS.LINE_HEIGHT,
        showLineNumbers: EDITOR_DEFAULTS.SHOW_LINE_NUMBERS,
        wordWrap: EDITOR_DEFAULTS.WORD_WRAP,
        showPageMarks: EDITOR_DEFAULTS.SHOW_PAGE_MARKS
      },
      window: {
        width: WINDOW_DEFAULTS.WIDTH,
        height: WINDOW_DEFAULTS.HEIGHT,
        fullscreen: false,
        maximized: false,
        zoomLevel: WINDOW_DEFAULTS.ZOOM_LEVEL
      },
      autoSave: true,
      autoSaveInterval: 5
    }
    
    saveSettings()
    applyTheme(settings.value.theme)
    applyZoom(settings.value.window.zoomLevel)
  }
  
  /**
   * 保存设置到本地存储
   */
  function saveSettings(): void {
    const data = {
      settings: settings.value,
      isFirstTime: isFirstTime.value
    }
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(data))
  }
  
  /**
   * 从本地存储加载设置
   */
  function loadSettings(): void {
    const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
    if (!data) return
    
    try {
      const parsed = JSON.parse(data)
      if (parsed.settings) {
        settings.value = parsed.settings
      }
      
      // 加载首次使用标记
      if (parsed.isFirstTime !== undefined) {
        isFirstTime.value = parsed.isFirstTime
      }
      
      // 应用设置
      applyTheme(settings.value.theme)
      applyZoom(settings.value.window.zoomLevel)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
  
  // ===== 初始化 =====
  
  // 自动加载设置
  loadSettings()
  
  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (settings.value.theme === 'auto') {
        applyTheme('auto')
      }
    })
  }
  
  return {
    // State
    settings,
    isFirstTime,
    
    // Actions
    setTheme,
    setLanguage,
    updateEditorSettings,
    setFontSize,
    setFontFamily,
    updateWindowSettings,
    setZoomLevel,
    toggleFullscreen,
    toggleAutoSave,
    setAutoSaveInterval,
    completeOnboarding,
    resetToDefaults,
    saveSettings,
    loadSettings
  }
})

