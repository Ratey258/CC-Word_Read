/**
 * 应用常量定义
 */

/**
 * 应用信息
 */
export const APP_INFO = {
  NAME: 'CC Word Reader',
  VERSION: '3.0.0',
  DESCRIPTION: 'Word风格的小说阅读伪装工具'
} as const

/**
 * 文件限制
 */
export const FILE_LIMITS = {
  /** 最大文件大小（字节）：50MB */
  MAX_SIZE: 50 * 1024 * 1024,
  /** 支持的文件格式 */
  SUPPORTED_FORMATS: ['txt', 'docx', 'md'] as const,
  /** 文件类型 MIME */
  MIME_TYPES: {
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    md: 'text/markdown'
  } as const
} as const

/**
 * 阅读器默认配置
 */
export const READER_DEFAULTS = {
  /** 每次输出字符数 */
  CHARS_PER_OUTPUT: 5,
  /** 自动保存间隔（毫秒）*/
  AUTO_SAVE_INTERVAL: 5000,
  /** 启用 IME */
  ENABLE_IME: true,
  /** 启用自动保存 */
  AUTO_SAVE: true
} as const

/**
 * 编辑器默认配置
 */
export const EDITOR_DEFAULTS = {
  /** 字体 */
  FONT_FAMILY: 'Calibri, "Microsoft YaHei", "Segoe UI", sans-serif',
  /** 字号 */
  FONT_SIZE: 14,
  /** 行高 */
  LINE_HEIGHT: 1.5,
  /** 显示行号 */
  SHOW_LINE_NUMBERS: false,
  /** 自动换行 */
  WORD_WRAP: true
} as const

/**
 * 窗口默认配置
 */
export const WINDOW_DEFAULTS = {
  /** 默认宽度 */
  WIDTH: 1200,
  /** 默认高度 */
  HEIGHT: 800,
  /** 最小宽度 */
  MIN_WIDTH: 800,
  /** 最小高度 */
  MIN_HEIGHT: 600,
  /** 缩放比例 */
  ZOOM_LEVEL: 100
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  /** 当前小说 */
  CURRENT_NOVEL: 'current_novel',
  /** 阅读进度 */
  READING_PROGRESS: 'reading_progress',
  /** 应用设置 */
  APP_SETTINGS: 'app_settings',
  /** 书签列表 */
  BOOKMARKS: 'bookmarks',
  /** 最近打开 */
  RECENT_FILES: 'recent_files',
  /** 历史记录 */
  HISTORY: 'history'
} as const

/**
 * 快捷键定义
 */
export const SHORTCUTS = {
  /** 导入文件 */
  IMPORT: 'Ctrl+O',
  /** 保存进度 */
  SAVE: 'Ctrl+S',
  /** 暂停/继续 */
  TOGGLE_PAUSE: 'Ctrl+P',
  /** 跳转 */
  JUMP_TO: 'Ctrl+G',
  /** 清空内容 */
  CLEAR: 'Ctrl+L',
  /** 退出 */
  QUIT: 'Ctrl+Q'
} as const

/**
 * 事件名称
 */
export const EVENTS = {
  /** 小说加载 */
  NOVEL_LOADED: 'novel:loaded',
  /** 开始阅读 */
  READING_START: 'reading:start',
  /** 暂停阅读 */
  READING_PAUSE: 'reading:pause',
  /** 停止阅读 */
  READING_STOP: 'reading:stop',
  /** 进度更新 */
  PROGRESS_UPDATE: 'progress:update',
  /** 字符输出 */
  CHARS_OUTPUT: 'chars:output'
} as const

/**
 * UI 常量
 */
export const UI = {
  /** Word 主题色 */
  PRIMARY_COLOR: '#2b579a',
  /** Ribbon 高度 */
  RIBBON_HEIGHT: 120,
  /** 标题栏高度 */
  TITLEBAR_HEIGHT: 32,
  /** 状态栏高度 */
  STATUSBAR_HEIGHT: 24,
  /** A4 纸张宽度（像素，96dpi） */
  A4_WIDTH: 794,
  /** A4 纸张高度（像素，96dpi） */
  A4_HEIGHT: 1123
} as const

/**
 * 正则表达式
 */
export const REGEX = {
  /** 章节标题 */
  CHAPTER_TITLE: /^第[零一二三四五六七八九十百千万\d]+[章回节]/,
  /** 空白行 */
  BLANK_LINE: /^\s*$/,
  /** 中文字符 */
  CHINESE_CHAR: /[\u4e00-\u9fa5]/g
} as const

/**
 * 编码格式
 */
export const ENCODINGS = [
  'UTF-8',
  'GBK',
  'GB2312',
  'Big5',
  'UTF-16LE',
  'UTF-16BE'
] as const

