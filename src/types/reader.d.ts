/**
 * 阅读器相关类型定义
 */

/**
 * 阅读器状态
 */
export type ReaderState = 'idle' | 'reading' | 'paused' | 'stopped'

/**
 * 输出模式
 */
export type OutputMode = 'normal' | 'fast' | 'custom'

/**
 * 阅读器配置
 */
export interface ReaderConfig {
  /** 每次输出字符数 */
  charsPerOutput: number
  /** 输出模式 */
  outputMode: OutputMode
  /** 是否启用中文输入法兼容 */
  enableIME: boolean
  /** 是否自动保存进度 */
  autoSave: boolean
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: number
}

/**
 * 输出事件数据
 */
export interface OutputEvent {
  /** 输出的字符 */
  chars: string
  /** 当前位置 */
  position: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 键盘事件数据
 */
export interface KeyboardEventData {
  /** 按键 */
  key: string
  /** 是否按下 Ctrl */
  ctrlKey: boolean
  /** 是否按下 Alt */
  altKey: boolean
  /** 是否按下 Shift */
  shiftKey: boolean
}

/**
 * 统计信息
 */
export interface Statistics {
  /** 已输出字数 */
  outputChars: number
  /** 剩余字数 */
  remainingChars: number
  /** 阅读时长（秒） */
  readingDuration: number
  /** 平均速度（字/分钟） */
  averageSpeed: number
  /** 会话开始时间 */
  sessionStartAt: number
}

/**
 * IME 组合事件数据
 */
export interface CompositionEventData {
  /** 组合的文本 */
  data: string
  /** 事件类型 */
  type: 'start' | 'update' | 'end'
}

