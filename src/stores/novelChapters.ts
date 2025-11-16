/**
 * 小说章节管理功能
 */

import type { Ref } from 'vue'
import type { Novel, Chapter } from '@/types/novel'
import { parseChapters, findChapterByPosition } from '@/utils/chapterParser'
import { emit } from '@/services/eventBus'
import { useUIStore } from './ui'
import { computed } from 'vue'

/**
 * 创建章节管理功能
 */
export function createNovelChapters(state: {
  currentNovel: Ref<Novel | null>
  content: Ref<string>
  currentPosition: Ref<number>
  chapters: Ref<Chapter[]>
  currentChapterIndex: Ref<number>
  hasChapters: Ref<boolean>
}, actions: {
  updatePosition: (position: number) => void
  saveToStorage: () => void
}) {
  /**
   * 当前章节
   */
  const currentChapter = computed(() => {
    if (state.currentChapterIndex.value >= 0 && state.currentChapterIndex.value < state.chapters.value.length) {
      return state.chapters.value[state.currentChapterIndex.value]
    }
    // 如果没有设置当前章节，根据阅读位置自动查找
    if (state.hasChapters.value && state.currentPosition.value >= 0) {
      return findChapterByPosition(state.chapters.value, state.currentPosition.value)
    }
    return null
  })
  
  /**
   * 跳转到指定章节
   * @param chapterIndex 章节索引
   */
  function jumpToChapter(chapterIndex: number): void {
    if (chapterIndex >= 0 && chapterIndex < state.chapters.value.length) {
      const chapter = state.chapters.value[chapterIndex]
      state.currentChapterIndex.value = chapterIndex
      
      // 显示章节跳转通知
      const uiStore = useUIStore()
      uiStore.showSuccess(`${chapter.title}`)
      
      // 触发清空编辑器事件
      emit('editor:clear')
      
      // 稍微延迟更新位置，确保编辑器已经清空
      setTimeout(() => {
        actions.updatePosition(chapter.startPosition)
      }, 50)
    }
  }
  
  /**
   * 跳转到下一章节
   */
  function jumpToNextChapter(): void {
    if (state.hasChapters.value) {
      const currentIndex = state.currentChapterIndex.value >= 0 ? state.currentChapterIndex.value : 
        state.chapters.value.findIndex(chapter => 
          state.currentPosition.value >= chapter.startPosition && state.currentPosition.value < chapter.endPosition
        )
      
      const nextIndex = currentIndex + 1
      if (nextIndex < state.chapters.value.length) {
        jumpToChapter(nextIndex)
      }
    }
  }
  
  /**
   * 跳转到上一章节
   */
  function jumpToPrevChapter(): void {
    if (state.hasChapters.value) {
      const currentIndex = state.currentChapterIndex.value >= 0 ? state.currentChapterIndex.value : 
        state.chapters.value.findIndex(chapter => 
          state.currentPosition.value >= chapter.startPosition && state.currentPosition.value < chapter.endPosition
        )
      
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        jumpToChapter(prevIndex)
      }
    }
  }
  
  /**
   * 重新解析章节
   */
  function reparseChapters(): void {
    if (state.content.value) {
      state.chapters.value = parseChapters(state.content.value)
      if (state.currentNovel.value) {
        state.currentNovel.value.chapters = state.chapters.value
      }
      // 重置当前章节索引
      state.currentChapterIndex.value = -1
      actions.saveToStorage()
    }
  }
  
  return {
    currentChapter,
    jumpToChapter,
    jumpToNextChapter,
    jumpToPrevChapter,
    reparseChapters
  }
}
