/**
 * 统一错误处理器
 */

import { useUIStore } from '@/stores/ui'

export enum ErrorType {
  FILE_IMPORT = 'FILE_IMPORT',
  FILE_PARSE = 'FILE_PARSE',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  details?: unknown
}

/**
 * 统一错误处理器
 */
export function handleError(error: AppError): void {
  const uiStore = useUIStore()
  
  // 记录错误日志
  console.error(`[${error.type}]`, error.message, error.originalError)
  
  // 根据错误类型显示友好的用户提示
  const userMessage = getUserFriendlyMessage(error)
  uiStore.showError(userMessage)
}

/**
 * 将错误转换为用户友好的消息
 */
function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.FILE_IMPORT:
      return `文件导入失败：${error.message}`
    
    case ErrorType.FILE_PARSE:
      return `文件解析失败：${error.message}。请确保文件格式正确。`
    
    case ErrorType.STORAGE:
      return `保存数据失败：${error.message}。请检查存储空间。`
    
    case ErrorType.NETWORK:
      return `网络请求失败：${error.message}。请检查网络连接。`
    
    default:
      return `操作失败：${error.message}`
  }
}

/**
 * 创建 AppError
 */
export function createError(
  type: ErrorType,
  message: string,
  originalError?: Error,
  details?: unknown
): AppError {
  return {
    type,
    message,
    originalError,
    details
  }
}

