/**
 * 进度提示服务
 * 统一管理加载进度和用户反馈
 */

import { ref, computed } from 'vue'
import { createLogger } from './logger'

const logger = createLogger('ProgressService')

export interface ProgressState {
  isLoading: boolean
  message: string
  progress: number // 0-100
  total: number
  current: number
  canCancel: boolean
}

class ProgressService {
  private state = ref<ProgressState>({
    isLoading: false,
    message: '',
    progress: 0,
    total: 0,
    current: 0,
    canCancel: false
  })

  private cancelCallback: (() => void) | null = null

  /**
   * 获取进度状态（只读）
   */
  get progressState() {
    return computed(() => this.state.value)
  }

  /**
   * 开始加载
   */
  start(message: string, total = 0, canCancel = false): void {
    logger.debug('开始加载', { message, total, canCancel })
    this.state.value = {
      isLoading: true,
      message,
      progress: 0,
      total,
      current: 0,
      canCancel
    }
  }

  /**
   * 更新进度
   */
  update(current: number, message?: string): void {
    if (!this.state.value.isLoading) return

    const { total } = this.state.value
    const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0

    this.state.value = {
      ...this.state.value,
      current,
      progress,
      message: message || this.state.value.message
    }

    logger.debug('更新进度', { current, total, progress: progress.toFixed(1) })
  }

  /**
   * 完成加载
   */
  complete(message?: string): void {
    logger.debug('完成加载', { message })
    this.state.value = {
      ...this.state.value,
      isLoading: false,
      progress: 100,
      message: message || '完成'
    }

    // 延迟清空状态
    setTimeout(() => {
      if (!this.state.value.isLoading) {
        this.reset()
      }
    }, 1000)
  }

  /**
   * 取消加载
   */
  cancel(): void {
    logger.debug('取消加载')
    if (this.cancelCallback) {
      this.cancelCallback()
    }
    this.reset()
  }

  /**
   * 设置取消回调
   */
  setCancelCallback(callback: () => void): void {
    this.cancelCallback = callback
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.state.value = {
      isLoading: false,
      message: '',
      progress: 0,
      total: 0,
      current: 0,
      canCancel: false
    }
    this.cancelCallback = null
  }

  /**
   * 创建带进度的异步任务包装器
   */
  async withProgress<T>(
    task: (updateProgress: (current: number, message?: string) => void) => Promise<T>,
    message: string,
    total: number,
    canCancel = false
  ): Promise<T> {
    this.start(message, total, canCancel)

    try {
      const result = await task((current, msg) => this.update(current, msg))
      this.complete()
      return result
    } catch (error) {
      logger.error('任务执行失败', error)
      this.reset()
      throw error
    }
  }

  /**
   * 分块处理大数据
   */
  async processInChunks<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: {
      message: string
      chunkSize?: number
      onProgress?: (current: number, total: number) => void
    }
  ): Promise<R[]> {
    const { message, chunkSize = 100, onProgress } = options
    const total = items.length
    const results: R[] = []

    this.start(message, total)

    try {
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, Math.min(i + chunkSize, items.length))
        
        // 处理当前块
        const chunkResults = await Promise.all(
          chunk.map((item, idx) => processor(item, i + idx))
        )
        
        results.push(...chunkResults)

        // 更新进度
        const current = Math.min(i + chunkSize, items.length)
        this.update(current)
        
        if (onProgress) {
          onProgress(current, total)
        }

        // 让出主线程，避免阻塞 UI
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      this.complete()
      return results
    } catch (error) {
      logger.error('分块处理失败', error)
      this.reset()
      throw error
    }
  }
}

/**
 * 全局进度服务实例
 */
export const progressService = new ProgressService()

/**
 * 便捷函数：开始加载
 */
export function startProgress(message: string, total = 0, canCancel = false): void {
  progressService.start(message, total, canCancel)
}

/**
 * 便捷函数：更新进度
 */
export function updateProgress(current: number, message?: string): void {
  progressService.update(current, message)
}

/**
 * 便捷函数：完成加载
 */
export function completeProgress(message?: string): void {
  progressService.complete(message)
}

/**
 * 便捷函数：取消加载
 */
export function cancelProgress(): void {
  progressService.cancel()
}
