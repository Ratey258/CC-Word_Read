/**
 * 设置相关类型定义
 */

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US'

/**
 * 编辑器设置
 */
export interface EditorSettings {
  /** 字体 */
  fontFamily: string
  /** 字号 */
  fontSize: number
  /** 行高 */
  lineHeight: number
  /** 是否显示行号 */
  showLineNumbers: boolean
  /** 是否自动换行 */
  wordWrap: boolean
  /** 是否显示页面标记线 */
  showPageMarks: boolean
}

/**
 * 窗口设置
 */
export interface WindowSettings {
  /** 窗口宽度 */
  width: number
  /** 窗口高度 */
  height: number
  /** 是否全屏 */
  fullscreen: boolean
  /** 是否最大化 */
  maximized: boolean
  /** 缩放比例 */
  zoomLevel: number
}

/**
 * 应用设置
 */
export interface AppSettings {
  /** 主题 */
  theme: Theme
  /** 语言 */
  language: Language
  /** 编辑器设置 */
  editor: EditorSettings
  /** 窗口设置 */
  window: WindowSettings
  /** 是否启用自动保存 */
  autoSave: boolean
  /** 自动保存间隔（秒） */
  autoSaveInterval: number
  /** 是否在启动时自动检查更新 */
  autoCheckUpdates: boolean
}

