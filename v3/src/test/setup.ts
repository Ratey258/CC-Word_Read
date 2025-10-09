/**
 * Vitest 测试环境设置文件
 * 在所有测试运行前执行
 */

import { vi, beforeEach, afterEach } from 'vitest'

// Mock Tauri API
(globalThis as any).__TAURI__ = {
  // Mock 基础函数
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path: string) => path),
}

// Mock Window API
if (typeof window !== 'undefined') 
{
  // Mock localStorage
  const localStorageMock = (() => 
{
    let store: Record<string, string> = {}
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => 
{
        store[key] = value.toString()
      },
      removeItem: (key: string) => 
{
        delete store[key]
      },
      clear: () => 
{
        store = {}
      },
      get length() 
{
        return Object.keys(store).length
      },
      key: (index: number) => 
{
        const keys = Object.keys(store)
        return keys[index] || null
      }
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // Mock IndexedDB
  Object.defineProperty(window, 'indexedDB', {
    value: {},
    writable: true
  })
}

// 全局测试钩子
beforeEach(() => 
{
  // 每个测试前清空 localStorage
  localStorage.clear()
  
  // 重置所有 mock
  vi.clearAllMocks()
})

afterEach(() => 
{
  // 测试后清理
  vi.restoreAllMocks()
})

