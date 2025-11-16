/**
 * 事件总线服务
 * 使用 mitt 替代 window 事件
 */

import mitt, { type Emitter } from 'mitt'

/**
 * 应用事件类型定义
 */
export type AppEvents = {
  // 书签相关
  'bookmarks:show': void
  'bookmarks:add': void
  
  // 编辑器相关
  'editor:clear': void
  'editor:showAll': void
  
  // 对话框相关
  'dialog:about': void
  'dialog:chapters': void
  
  // 更新相关
  'update:check': void
  
  // 小说相关
  'novel:loaded': { id: string; title: string }
  'novel:progress': { position: number; percentage: number }
  
  // 阅读器相关
  'reader:start': void
  'reader:pause': void
  'reader:resume': void
  'reader:stop': void
}

/**
 * 全局事件总线实例
 */
export const eventBus: Emitter<AppEvents> = mitt<AppEvents>()

/**
 * 类型安全的事件发射器
 */
export function emit<K extends keyof AppEvents>(
  event: K,
  ...args: AppEvents[K] extends void ? [] : [AppEvents[K]]
): void {
  if (args.length === 0) {
    eventBus.emit(event, undefined as AppEvents[K])
  } else {
    eventBus.emit(event, args[0])
  }
}

/**
 * 类型安全的事件监听器
 */
export function on<K extends keyof AppEvents>(
  event: K,
  handler: (data: AppEvents[K]) => void
): void {
  eventBus.on(event, handler)
}

/**
 * 类型安全的一次性事件监听器
 */
export function once<K extends keyof AppEvents>(
  event: K,
  handler: (data: AppEvents[K]) => void
): void {
  const wrappedHandler = (data: AppEvents[K]) => {
    handler(data)
    eventBus.off(event, wrappedHandler)
  }
  eventBus.on(event, wrappedHandler)
}

/**
 * 移除事件监听器
 */
export function off<K extends keyof AppEvents>(
  event: K,
  handler?: (data: AppEvents[K]) => void
): void {
  if (handler) {
    eventBus.off(event, handler)
  } else {
    eventBus.all.delete(event)
  }
}

/**
 * 清除所有事件监听器
 */
export function clearAll(): void {
  eventBus.all.clear()
}
