/**
 * 阅读器状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReaderState, ReaderConfig, Statistics, OutputMode } from '@/types/reader'
import { READER_DEFAULTS } from '@/utils/constants'

export const useReaderStore = defineStore('reader', () => {
  // ===== State =====
  
  /** 阅读器状态 */
  const state = ref<ReaderState>('idle')
  
  /** 阅读器配置 */
  const config = ref<ReaderConfig>({
    charsPerOutput: READER_DEFAULTS.CHARS_PER_OUTPUT,
    outputMode: 'normal',
    enableIME: READER_DEFAULTS.ENABLE_IME,
    autoSave: READER_DEFAULTS.AUTO_SAVE,
    autoSaveInterval: READER_DEFAULTS.AUTO_SAVE_INTERVAL
  })
  
  /** 统计信息 */
  const statistics = ref<Statistics>({
    outputChars: 0,
    remainingChars: 0,
    readingDuration: 0,
    averageSpeed: 0,
    sessionStartAt: 0
  })
  
  /** 是否在输入法组合中 */
  const isComposing = ref<boolean>(false)
  
  /** 输出缓冲区 */
  const outputBuffer = ref<string>('')
  
  /** 自动保存定时器 */
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null
  
  /** 统计定时器 */
  let statisticsTimer: ReturnType<typeof setInterval> | null = null
  
  // ===== Getters =====
  
  /** 是否正在阅读 */
  const isReading = computed(() => state.value === 'reading')
  
  /** 是否已暂停 */
  const isPaused = computed(() => state.value === 'paused')
  
  /** 是否已停止 */
  const isStopped = computed(() => state.value === 'stopped')
  
  /** 是否空闲 */
  const isIdle = computed(() => state.value === 'idle')
  
  /** 阅读速度（字/分钟） */
  const readingSpeed = computed(() => {
    if (statistics.value.readingDuration === 0) return 0
    const minutes = statistics.value.readingDuration / 60
    return Math.round(statistics.value.outputChars / minutes)
  })
  
  // ===== Actions =====
  
  /**
   * 开始阅读
   */
  function startReading(): void {
    if (state.value === 'reading') return
    
    state.value = 'reading'
    statistics.value.sessionStartAt = Date.now()
    
    // 启动自动保存
    if (config.value.autoSave) {
      startAutoSave()
    }
    
    // 启动统计更新
    startStatistics()
  }
  
  /**
   * 暂停阅读
   */
  function pauseReading(): void {
    if (state.value !== 'reading') return
    
    state.value = 'paused'
    
    // 停止定时器
    stopTimers()
  }
  
  /**
   * 继续阅读
   */
  function resumeReading(): void {
    if (state.value !== 'paused') return
    
    state.value = 'reading'
    
    // 重新启动定时器
    if (config.value.autoSave) {
      startAutoSave()
    }
    startStatistics()
  }
  
  /**
   * 停止阅读
   */
  function stopReading(): void {
    state.value = 'stopped'
    
    // 停止定时器
    stopTimers()
    
    // 重置统计
    resetStatistics()
  }
  
  /**
   * 切换暂停/继续
   */
  function togglePause(): void {
    if (isReading.value) {
      pauseReading()
    } else if (isPaused.value) {
      resumeReading()
    }
  }
  
  /**
   * 记录输出
   * @param chars 输出的字符
   */
  function recordOutput(chars: string): void {
    statistics.value.outputChars += chars.length
    outputBuffer.value += chars
  }
  
  /**
   * 清空输出缓冲区
   */
  function clearOutputBuffer(): void {
    outputBuffer.value = ''
  }
  
  /**
   * 设置输入法组合状态
   * @param composing 是否在组合中
   */
  function setComposing(composing: boolean): void {
    isComposing.value = composing
  }
  
  /**
   * 更新配置
   * @param newConfig 新配置（部分）
   */
  function updateConfig(newConfig: Partial<ReaderConfig>): void {
    config.value = { ...config.value, ...newConfig }
  }
  
  /**
   * 设置输出模式
   * @param mode 输出模式
   */
  function setOutputMode(mode: OutputMode): void {
    config.value.outputMode = mode
    
    // 根据模式调整字符数
    switch (mode) {
      case 'fast':
        config.value.charsPerOutput = 10
        break
      case 'normal':
        config.value.charsPerOutput = 5
        break
      case 'custom':
        // 保持当前设置
        break
    }
  }
  
  /**
   * 设置每次输出字符数
   * @param count 字符数
   */
  function setCharsPerOutput(count: number): void {
    if (count >= 1 && count <= 100) {
      config.value.charsPerOutput = count
    }
  }
  
  /**
   * 启动自动保存
   */
  function startAutoSave(): void {
    if (autoSaveTimer) return
    
    autoSaveTimer = setInterval(() => {
      // 触发保存事件（由其他模块监听）
      // 这里只负责触发，具体保存逻辑在 novel store
    }, config.value.autoSaveInterval)
  }
  
  /**
   * 停止自动保存
   */
  function stopAutoSave(): void {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }
  
  /**
   * 启动统计更新
   */
  function startStatistics(): void {
    if (statisticsTimer) return
    
    statisticsTimer = setInterval(() => {
      // 更新阅读时长
      if (statistics.value.sessionStartAt > 0) {
        statistics.value.readingDuration = 
          Math.floor((Date.now() - statistics.value.sessionStartAt) / 1000)
      }
      
      // 计算平均速度
      statistics.value.averageSpeed = readingSpeed.value
    }, 1000) // 每秒更新
  }
  
  /**
   * 停止统计更新
   */
  function stopStatistics(): void {
    if (statisticsTimer) {
      clearInterval(statisticsTimer)
      statisticsTimer = null
    }
  }
  
  /**
   * 停止所有定时器
   */
  function stopTimers(): void {
    stopAutoSave()
    stopStatistics()
  }
  
  /**
   * 重置统计信息
   */
  function resetStatistics(): void {
    statistics.value = {
      outputChars: 0,
      remainingChars: 0,
      readingDuration: 0,
      averageSpeed: 0,
      sessionStartAt: 0
    }
  }
  
  /**
   * 重置阅读器
   */
  function reset(): void {
    stopReading()
    clearOutputBuffer()
    state.value = 'idle'
  }
  
  return {
    // State
    state,
    config,
    statistics,
    isComposing,
    outputBuffer,
    
    // Getters
    isReading,
    isPaused,
    isStopped,
    isIdle,
    readingSpeed,
    
    // Actions
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    togglePause,
    recordOutput,
    clearOutputBuffer,
    setComposing,
    updateConfig,
    setOutputMode,
    setCharsPerOutput,
    resetStatistics,
    reset
  }
})

