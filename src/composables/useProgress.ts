/**
 * 进度管理 Composable
 */

import { computed, watch } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { useReaderStore } from '@/stores/reader'
import { useUIStore } from '@/stores/ui'
import { formatPercentage, formatNumber, formatDuration } from '@/utils/formatter'

export function useProgress() {
  const novelStore = useNovelStore()
  const readerStore = useReaderStore()
  const uiStore = useUIStore()

  // ===== State =====
  
  /** 自动保存定时器 */
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null

  // ===== Computed =====

  /** 进度百分比（格式化） */
  const progressPercentage = computed(() => {
    return formatPercentage(
      novelStore.currentPosition,
      novelStore.totalLength,
      1
    )
  })

  /** 已读字数（格式化） */
  const readCharsFormatted = computed(() => {
    return formatNumber(novelStore.currentPosition)
  })

  /** 总字数（格式化） */
  const totalCharsFormatted = computed(() => {
    return formatNumber(novelStore.totalLength)
  })

  /** 剩余字数（格式化） */
  const remainingCharsFormatted = computed(() => {
    return formatNumber(novelStore.remainingChars)
  })

  /** 阅读时长（格式化） */
  const readingDurationFormatted = computed(() => {
    return formatDuration(readerStore.statistics.readingDuration * 1000)
  })

  /** 预计剩余时间 */
  const estimatedRemainingTime = computed(() => {
    const speed = readerStore.readingSpeed
    if (speed === 0) return '未知'

    const remainingMinutes = novelStore.remainingChars / speed
    return formatDuration(remainingMinutes * 60 * 1000)
  })

  // ===== Methods =====

  /**
   * 保存进度
   */
  function saveProgress(): void {
    try {
      novelStore.saveProgress()
      uiStore.showSuccess('进度已保存')
    } catch (error) {
      console.error('保存进度失败:', error)
      uiStore.showError('保存进度失败')
    }
  }

  /**
   * 加载进度
   */
  function loadProgress(): void {
    try {
      novelStore.loadProgress()
    } catch (error) {
      console.error('加载进度失败:', error)
      uiStore.showError('加载进度失败')
    }
  }

  /**
   * 启动自动保存
   * @param interval 保存间隔（毫秒）
   */
  function startAutoSave(interval = 5000): void {
    if (autoSaveTimer) return

    autoSaveTimer = window.setInterval(() => {
      if (readerStore.isReading) {
        novelStore.saveProgress()
      }
    }, interval)
  }

  /**
   * 停止自动保存
   */
  function stopAutoSave(): void {
    if (autoSaveTimer) {
      window.clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  /**
   * 跳转到指定进度
   * @param percentage 进度百分比（0-100）
   */
  function jumpToPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      uiStore.showError('进度值超出范围')
      return
    }

    const position = Math.floor((percentage / 100) * novelStore.totalLength)
    novelStore.jumpTo(position)
    uiStore.showSuccess(`已跳转到 ${percentage}%`)
  }

  /**
   * 跳转到指定字符位置
   * @param position 字符位置
   */
  function jumpToPosition(position: number): void {
    if (position < 0 || position > novelStore.totalLength) {
      uiStore.showError('位置超出范围')
      return
    }

    novelStore.jumpTo(position)
    uiStore.showSuccess(`已跳转到第 ${formatNumber(position)} 字`)
  }

  /**
   * 重置到开始
   */
  function resetToStart(): void {
    novelStore.jumpTo(0)
    uiStore.showInfo('已重置到开始')
  }

  /**
   * 跳转到末尾
   */
  function jumpToEnd(): void {
    novelStore.jumpTo(novelStore.totalLength)
    uiStore.showInfo('已跳转到末尾')
  }

  /**
   * 获取进度摘要信息
   */
  function getProgressSummary(): string {
    return `已读: ${readCharsFormatted.value} / ${totalCharsFormatted.value} (${progressPercentage.value})`
  }

  /**
   * 导出进度数据
   */
  function exportProgress(): object {
    return {
      currentPosition: novelStore.currentPosition,
      totalLength: novelStore.totalLength,
      progress: novelStore.progress,
      readingDuration: readerStore.statistics.readingDuration,
      averageSpeed: readerStore.statistics.averageSpeed,
      timestamp: Date.now()
    }
  }

  // ===== Watchers =====

  // 监听阅读状态，自动开启/关闭自动保存
  watch(
    () => readerStore.isReading,
    (isReading) => {
      if (isReading) {
        startAutoSave(readerStore.config.autoSaveInterval)
      } else {
        stopAutoSave()
      }
    }
  )

  // 监听自动保存间隔变化
  watch(
    () => readerStore.config.autoSaveInterval,
    (newInterval) => {
      if (readerStore.isReading) {
        stopAutoSave()
        startAutoSave(newInterval)
      }
    }
  )

  return {
    // Computed
    progressPercentage,
    readCharsFormatted,
    totalCharsFormatted,
    remainingCharsFormatted,
    readingDurationFormatted,
    estimatedRemainingTime,

    // Methods
    saveProgress,
    loadProgress,
    startAutoSave,
    stopAutoSave,
    jumpToPercentage,
    jumpToPosition,
    resetToStart,
    jumpToEnd,
    getProgressSummary,
    exportProgress
  }
}

