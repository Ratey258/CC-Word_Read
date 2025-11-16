/**
 * 错误处理服务
 * 统一的错误处理和上报机制
 */

import { createLogger } from './logger'

const logger = createLogger('ErrorHandler')

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  FILE_SYSTEM = 'FILE_SYSTEM',
  PARSE = 'PARSE',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public context?: Record<string, unknown>,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  enableNotification: boolean
  enableLogging: boolean
  enableReporting: boolean
}

/**
 * 错误处理器类
 */
class ErrorHandler {
  private config: ErrorHandlerConfig = {
    enableNotification: true,
    enableLogging: true,
    enableReporting: false
  }

  /**
   * 配置错误处理器
   */
  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 处理错误
   */
  handle(error: Error | AppError | unknown, context?: string): void {
    // 日志记录
    if (this.config.enableLogging) {
      this.logError(error, context)
    }

    // 用户通知
    if (this.config.enableNotification) {
      this.notifyUser(error)
    }

    // 错误上报（可选）
    if (this.config.enableReporting) {
      this.reportError(error, context)
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: Error | AppError | unknown, context?: string): void {
    const ctx = context || 'Unknown'

    if (error instanceof AppError) {
      logger.error(
        ctx,
        `[${error.type}] ${error.message}`,
        error.originalError || error,
        error.context
      )
    } else if (error instanceof Error) {
      logger.error(ctx, error.message, error)
    } else {
      logger.error(ctx, '未知错误', error)
    }
  }

  /**
   * 通知用户
   */
  private notifyUser(error: Error | AppError | unknown): void {
    let message = '发生了一个错误'

    if (error instanceof AppError) {
      message = this.getErrorMessage(error)
    } else if (error instanceof Error) {
      message = error.message
    }

    // 这里可以集成 UI Store 的通知系统
    // 暂时使用 console
    console.warn('用户通知:', message)
  }

  /**
   * 获取用户友好的错误消息
   */
  private getErrorMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '网络连接失败，请检查网络设置'
      case ErrorType.FILE_SYSTEM:
        return '文件操作失败，请检查文件权限'
      case ErrorType.PARSE:
        return '文件解析失败，请确认文件格式正确'
      case ErrorType.VALIDATION:
        return '数据验证失败，请检查输入内容'
      case ErrorType.STORAGE:
        return '数据保存失败，请稍后重试'
      default:
        return error.message || '发生了未知错误'
    }
  }

  /**
   * 上报错误（可扩展集成 Sentry 等服务）
   */
  private reportError(error: Error | AppError | unknown, context?: string): void {
    // 这里可以集成错误上报服务
    logger.debug('ErrorReporting', '错误上报', { error, context })
  }

  /**
   * 创建特定类型的错误
   */
  createError(
    type: ErrorType,
    message: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ): AppError {
    return new AppError(type, message, context, originalError)
  }
}

/**
 * 全局错误处理器实例
 */
export const errorHandler = new ErrorHandler()

/**
 * 便捷的错误处理函数
 */
export function handleError(error: Error | AppError | unknown, context?: string): void {
  errorHandler.handle(error, context)
}

/**
 * 创建错误
 */
export function createError(
  type: ErrorType,
  message: string,
  context?: Record<string, unknown>,
  originalError?: Error
): AppError {
  return errorHandler.createError(type, message, context, originalError)
}
