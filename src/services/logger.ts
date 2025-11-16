/**
 * 日志服务
 * 统一的日志管理系统，支持日志级别和环境区分
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableTimestamp: boolean
  prefix?: string
}

class Logger {
  private config: LoggerConfig = {
    level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
    enableConsole: true,
    enableTimestamp: true
  }

  /**
   * 配置日志器
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 格式化日志消息
   */
  private format(level: string, context: string, message: string): string {
    const timestamp = this.config.enableTimestamp ? `[${new Date().toISOString()}]` : ''
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''
    return `${timestamp}${prefix}[${level}][${context}] ${message}`
  }

  /**
   * 输出日志
   */
  private log(
    level: LogLevel,
    levelName: string,
    context: string,
    message: string,
    ...args: unknown[]
  ): void {
    if (level < this.config.level || !this.config.enableConsole) {
      return
    }

    const formattedMessage = this.format(levelName, context, message)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...args)
        break
      case LogLevel.INFO:
        console.info(formattedMessage, ...args)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args)
        break
    }
  }

  /**
   * Debug 级别日志
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', context, message, ...args)
  }

  /**
   * Info 级别日志
   */
  info(context: string, message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'INFO', context, message, ...args)
  }

  /**
   * Warn 级别日志
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, 'WARN', context, message, ...args)
  }

  /**
   * Error 级别日志
   */
  error(context: string, message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, 'ERROR', context, message, error.message, error.stack, ...args)
    } else {
      this.log(LogLevel.ERROR, 'ERROR', context, message, error, ...args)
    }
  }

  /**
   * 创建带上下文的日志器
   */
  createContextLogger(context: string) {
    return {
      debug: (message: string, ...args: unknown[]) => this.debug(context, message, ...args),
      info: (message: string, ...args: unknown[]) => this.info(context, message, ...args),
      warn: (message: string, ...args: unknown[]) => this.warn(context, message, ...args),
      error: (message: string, error?: Error | unknown, ...args: unknown[]) =>
        this.error(context, message, error, ...args)
    }
  }
}

/**
 * 全局日志器实例
 */
export const logger = new Logger()

/**
 * 为特定模块创建日志器
 */
export function createLogger(context: string) {
  return logger.createContextLogger(context)
}
