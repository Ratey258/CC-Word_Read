/**
 * 书签相关类型定义
 */

/**
 * 书签接口
 */
export interface Bookmark {
  /** 书签ID */
  id: string
  
  /** 所属小说ID */
  novelId: string
  
  /** 书签位置（字符位置） */
  position: number
  
  /** 书签标题 */
  title: string
  
  /** 书签备注 */
  note?: string
  
  /** 创建时间 */
  createdAt: Date
  
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 创建书签的数据（不包含自动生成的字段）
 */
export type CreateBookmarkData = Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>

/**
 * 更新书签的数据（不包含不可更新的字段）
 */
export type UpdateBookmarkData = Partial<Omit<Bookmark, 'id' | 'createdAt'>>

