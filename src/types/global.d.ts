/**
 * 全局类型定义
 */

/**
 * Tauri API 全局声明
 */
declare global {
  interface Window {
    __TAURI__?: {
      invoke: <T = unknown>(cmd: string, args?: Record<string, unknown>) => Promise<T>
      convertFileSrc: (filePath: string, protocol?: string) => string
    }
    __TAURI_INTERNALS__?: Record<string, unknown>
  }

  const __TAURI__: Window['__TAURI__']
  const __TAURI_INTERNALS__: Window['__TAURI_INTERNALS__']
  
  // 从 package.json 注入的版本号（通过 Vite define 配置）
  // eslint-disable-next-line no-var
  var __APP_VERSION__: string
}

/**
 * 环境变量类型
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly TAURI_DEBUG: string
  readonly TAURI_PLATFORM: string
  readonly TAURI_ARCH: string
  readonly TAURI_FAMILY: string
  readonly TAURI_PLATFORM_VERSION: string
  readonly TAURI_PLATFORM_TYPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 导出 ImportMeta 以消除未使用警告
export type { ImportMeta }

/**
 * 通用回调函数
 */
export type Callback<T = void> = (data: T) => void

/**
 * 异步回调函数
 */
export type AsyncCallback<T = void> = (data: T) => Promise<void>

/**
 * 可选字段
 */
export type Optional<T> = T | undefined

/**
 * 可为空字段
 */
export type Nullable<T> = T | null

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度部分可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 值类型提取
 */
export type ValueOf<T> = T[keyof T]

/**
 * 数组元素类型提取
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

export {}

