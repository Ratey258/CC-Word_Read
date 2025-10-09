/**
 * 小说相关类型定义
 */

/**
 * 小说元数据
 */
export interface NovelMetadata {
  /** 小说标题 */
  title: string
  /** 作者 */
  author?: string
  /** 章节数 */
  chapters?: number
  /** 创建时间 */
  createdAt: number
  /** 最后修改时间 */
  updatedAt: number
  /** 文件大小（字节） */
  fileSize: number
  /** 文件格式 */
  format: NovelFormat
}

/**
 * 小说格式
 */
export type NovelFormat = 'txt' | 'docx' | 'md' | 'unknown'

/**
 * 小说内容
 */
export interface Novel {
  /** 唯一标识 */
  id: string
  /** 小说内容 */
  content: string
  /** 元数据 */
  metadata: NovelMetadata
  /** 总字数 */
  totalLength: number
}

/**
 * 书签
 */
export interface Bookmark {
  /** 书签ID */
  id: string
  /** 小说ID */
  novelId: string
  /** 书签名称 */
  name: string
  /** 字符位置 */
  position: number
  /** 创建时间 */
  createdAt: number
  /** 备注 */
  note?: string
}

/**
 * 阅读进度
 */
export interface ReadingProgress {
  /** 小说ID */
  novelId: string
  /** 当前位置 */
  currentPosition: number
  /** 进度百分比 */
  percentage: number
  /** 最后阅读时间 */
  lastReadAt: number
}

/**
 * 文件导入选项
 */
export interface ImportOptions {
  /** 是否保留格式 */
  preserveFormatting?: boolean
  /** 编码格式（仅TXT） */
  encoding?: string
  /** 最大文件大小（MB） */
  maxFileSize?: number
}

