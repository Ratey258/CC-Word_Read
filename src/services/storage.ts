/**
 * 存储服务
 * 统一的数据持久化抽象层，支持 IndexedDB 和 localStorage
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createLogger } from './logger'

const logger = createLogger('StorageService')

/**
 * 数据库 Schema 定义
 */
interface NovelDB extends DBSchema {
  novels: {
    key: string
    value: {
      id: string
      content: string
      metadata: unknown
      chapters?: unknown[]
      createdAt: number
      updatedAt: number
    }
  }
  history: {
    key: string
    value: {
      id: string
      novelId: string
      position: number
      percentage: number
      lastReadAt: number
      filePath?: string
    }
  }
  settings: {
    key: string
    value: unknown
  }
}

/**
 * 存储服务类
 */
class StorageService {
  private db: IDBPDatabase<NovelDB> | null = null
  private readonly DB_NAME = 'cc-word-reader'
  private readonly DB_VERSION = 1

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<NovelDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // 创建小说存储
          if (!db.objectStoreNames.contains('novels')) {
            db.createObjectStore('novels', { keyPath: 'id' })
          }

          // 创建历史记录存储
          if (!db.objectStoreNames.contains('history')) {
            db.createObjectStore('history', { keyPath: 'id' })
          }

          // 创建设置存储
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings')
          }
        }
      })
      logger.info('数据库初始化成功')
    } catch (error) {
      logger.error('数据库初始化失败', error)
      throw error
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<IDBPDatabase<NovelDB>> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  /**
   * 保存数据到 IndexedDB
   */
  async set<T>(store: keyof NovelDB, key: string, value: T): Promise<void> {
    try {
      const db = await this.ensureDB()
      await db.put(store as 'novels' | 'history' | 'settings', value as never, key as never)
      logger.debug(`数据已保存: ${store}/${key}`)
    } catch (error) {
      logger.error(`保存数据失败: ${store}/${key}`, error)
      // 降级到 localStorage
      this.setToLocalStorage(`${store}:${key}`, value)
    }
  }

  /**
   * 从 IndexedDB 获取数据
   */
  async get<T>(store: keyof NovelDB, key: string): Promise<T | null> {
    try {
      const db = await this.ensureDB()
      const value = await db.get(store as 'novels' | 'history' | 'settings', key as never)
      return (value as T) || null
    } catch (error) {
      logger.error(`获取数据失败: ${store}/${key}`, error)
      // 降级到 localStorage
      return this.getFromLocalStorage<T>(`${store}:${key}`)
    }
  }

  /**
   * 从 IndexedDB 删除数据
   */
  async delete(store: keyof NovelDB, key: string): Promise<void> {
    try {
      const db = await this.ensureDB()
      await db.delete(store as 'novels' | 'history' | 'settings', key as never)
      logger.debug(`数据已删除: ${store}/${key}`)
    } catch (error) {
      logger.error(`删除数据失败: ${store}/${key}`, error)
      // 降级到 localStorage
      this.deleteFromLocalStorage(`${store}:${key}`)
    }
  }

  /**
   * 获取所有数据
   */
  async getAll<T>(store: keyof NovelDB): Promise<T[]> {
    try {
      const db = await this.ensureDB()
      const values = await db.getAll(store as 'novels' | 'history' | 'settings')
      return values as T[]
    } catch (error) {
      logger.error(`获取所有数据失败: ${store}`, error)
      return []
    }
  }

  /**
   * 清空存储
   */
  async clear(store: keyof NovelDB): Promise<void> {
    try {
      const db = await this.ensureDB()
      await db.clear(store as 'novels' | 'history' | 'settings')
      logger.info(`存储已清空: ${store}`)
    } catch (error) {
      logger.error(`清空存储失败: ${store}`, error)
    }
  }

  /**
   * 降级：保存到 localStorage
   */
  private setToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error(`localStorage 保存失败: ${key}`, error)
    }
  }

  /**
   * 降级：从 localStorage 获取
   */
  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error(`localStorage 获取失败: ${key}`, error)
      return null
    }
  }

  /**
   * 降级：从 localStorage 删除
   */
  private deleteFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      logger.error(`localStorage 删除失败: ${key}`, error)
    }
  }

  /**
   * 从旧的 localStorage 迁移数据
   */
  async migrateFromLocalStorage(): Promise<void> {
    logger.info('开始迁移 localStorage 数据...')

    try {
      // 迁移当前小说
      const currentNovel = localStorage.getItem('current_novel')
      if (currentNovel) {
        const novel = JSON.parse(currentNovel)
        await this.set('novels', novel.id, {
          ...novel,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        logger.info('当前小说已迁移')
      }

      // 迁移历史记录
      const history = localStorage.getItem('history')
      if (history) {
        const historyItems = JSON.parse(history)
        for (const item of historyItems) {
          await this.set('history', item.id, item)
        }
        logger.info(`历史记录已迁移: ${historyItems.length} 条`)
      }

      // 迁移设置
      const settings = localStorage.getItem('app_settings')
      if (settings) {
        await this.set('settings', 'app_settings', JSON.parse(settings))
        logger.info('应用设置已迁移')
      }

      logger.info('数据迁移完成')
    } catch (error) {
      logger.error('数据迁移失败', error)
    }
  }
}

/**
 * 全局存储服务实例
 */
export const storage = new StorageService()

/**
 * 初始化存储服务
 */
export async function initStorage(): Promise<void> {
  await storage.init()
  // 可选：迁移旧数据
  // await storage.migrateFromLocalStorage()
}
