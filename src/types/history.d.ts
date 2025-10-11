/**
 * 历史记录相关类型定义
 */

import type { NovelFormat } from './novel'
import type { ReadingProgress } from './novel'

/**
 * 历史记录项
 */
export interface HistoryItem {
  /** 小说ID */
  id: string
  /** 文件标题 */
  title: string
  /** 作者 */
  author?: string
  /** 文件格式 */
  format: NovelFormat
  /** 文件大小（字节） */
  fileSize: number
  /** 总字数 */
  totalLength: number
  /** 文件路径（Tauri 环境可用） */
  filePath?: string
  /** 阅读进度 */
  progress: ReadingProgress
  /** 创建时间（首次导入） */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 是否已完成阅读 */
  isCompleted: boolean
  /** 小说内容（可选，用于快速恢复） */
  content?: string
}

/**
 * 历史记录配置
 */
export interface HistoryConfig {
  /** 最大历史记录数 */
  maxItems: number
  /** 是否自动清理旧记录 */
  autoCleanup: boolean
  /** 保留天数（超过此天数的历史将被清理） */
  retentionDays: number
  /** 是否缓存内容 */
  cacheContent: boolean
  /** 是否在加载时验证文件存在性（仅 Tauri 环境） */
  validateFileExists: boolean
  /** 是否自动清理无效文件的历史记录 */
  autoRemoveInvalid: boolean
}

/**
 * 历史记录排序方式
 */
export type HistorySortBy = 'lastAccessed' | 'title' | 'progress' | 'createdAt'

/**
 * 历史记录筛选器
 */
export interface HistoryFilter {
  /** 搜索关键词 */
  keyword?: string
  /** 文件格式 */
  format?: NovelFormat
  /** 是否仅显示已完成 */
  completedOnly?: boolean
}

