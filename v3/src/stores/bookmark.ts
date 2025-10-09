/**
 * 书签状态管理
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Bookmark } from '@/types/bookmark'
import { STORAGE_KEYS } from '@/utils/constants'

/**
 * 存储的书签类型（日期字段为时间戳）
 */
interface StoredBookmark extends Omit<Bookmark, 'createdAt' | 'updatedAt'> {
  createdAt: number
  updatedAt: number
}

export const useBookmarkStore = defineStore('bookmark', () =>
{
  // ===== State =====
  
  /** 所有书签 */
  const bookmarks = ref<Bookmark[]>([])

  // ===== Computed =====
  
  /** 书签总数 */
  const totalBookmarks = computed(() => bookmarks.value.length)

  /** 是否有书签 */
  const hasBookmarks = computed(() => bookmarks.value.length > 0)

  // ===== Methods =====

  /**
   * 添加书签
   * @param data 书签数据
   */
  function addBookmark(data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): void
  {
    const bookmark: Bookmark = {
      id: generateBookmarkId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    bookmarks.value.push(bookmark)
    saveToStorage()
  }

  /**
   * 删除书签
   * @param bookmarkId 书签ID
   */
  function removeBookmark(bookmarkId: string): void
  {
    const index = bookmarks.value.findIndex((b: Bookmark) => b.id === bookmarkId)
    if (index !== -1)
    {
      bookmarks.value.splice(index, 1)
      saveToStorage()
    }
  }

  /**
   * 更新书签
   * @param bookmarkId 书签ID
   * @param updates 更新数据
   */
  function updateBookmark(bookmarkId: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>): void
  {
    const bookmark = bookmarks.value.find((b: Bookmark) => b.id === bookmarkId)
    if (bookmark)
    {
      Object.assign(bookmark, updates, { updatedAt: new Date() })
      saveToStorage()
    }
  }

  /**
   * 获取指定小说的书签
   * @param novelId 小说ID
   * @returns 书签数组
   */
  function getBookmarksByNovel(novelId: string): Bookmark[]
  {
    return bookmarks.value
      .filter((b: Bookmark) => b.novelId === novelId)
      .sort((a: Bookmark, b: Bookmark) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * 删除指定小说的所有书签
   * @param novelId 小说ID
   */
  function removeBookmarksByNovel(novelId: string): void
  {
    bookmarks.value = bookmarks.value.filter((b: Bookmark) => b.novelId !== novelId)
    saveToStorage()
  }

  /**
   * 清空所有书签
   */
  function clearAllBookmarks(): void
  {
    bookmarks.value = []
    saveToStorage()
  }

  /**
   * 生成书签ID
   * @returns 书签ID
   */
  function generateBookmarkId(): string
  {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 保存到本地存储
   */
  function saveToStorage(): void
  {
    try
    {
      const data = bookmarks.value.map((b: Bookmark) => ({
        ...b,
        createdAt: b.createdAt.getTime(),
        updatedAt: b.updatedAt.getTime()
      }))
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data))
    }
    catch (error)
    {
      console.error('Failed to save bookmarks:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromStorage(): void
  {
    try
    {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
      if (saved)
      {
        const data = JSON.parse(saved) as StoredBookmark[]
        bookmarks.value = data.map((b: StoredBookmark) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        }))
      }
    }
    catch (error)
    {
      console.error('Failed to load bookmarks:', error)
    }
  }

  /**
   * 重置状态
   */
  function reset(): void
  {
    bookmarks.value = []
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    // State
    bookmarks,

    // Computed
    totalBookmarks,
    hasBookmarks,

    // Methods
    addBookmark,
    removeBookmark,
    updateBookmark,
    getBookmarksByNovel,
    removeBookmarksByNovel,
    clearAllBookmarks,
    loadFromStorage,
    saveToStorage,
    reset
  }
})

