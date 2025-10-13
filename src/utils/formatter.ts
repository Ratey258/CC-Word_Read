/**
 * 格式化工具函数
 */

import { format, formatDistance, formatRelative } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * 格式化数字（千分位）
 * @param num 数字
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 * @param value 值
 * @param total 总数
 * @param decimals 小数位数
 */
export function formatPercentage(value: number, total: number, decimals = 2): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化时间（毫秒转可读格式）
 * @param ms 毫秒数
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）
 * @param pattern 格式化模板（支持 date-fns 所有格式）
 * @param useLocale 是否使用中文本地化
 * @example
 * formatDateTime(Date.now(), 'yyyy-MM-dd HH:mm:ss') // "2025-10-13 14:30:00"
 * formatDateTime(Date.now(), 'PPP', true) // "2025年10月13日"
 */
export function formatDateTime(
  timestamp: number,
  pattern = 'yyyy-MM-dd HH:mm:ss',
  useLocale = false
): string {
  return format(timestamp, pattern, useLocale ? { locale: zhCN } : undefined)
}

/**
 * 格式化相对时间（更智能）
 * @param timestamp 时间戳（毫秒）
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 分钟前"
 * formatRelativeTime(Date.now() - 3600000) // "大约 1 小时前"
 */
export function formatRelativeTime(timestamp: number): string {
  return formatDistance(timestamp, Date.now(), {
    addSuffix: true,
    locale: zhCN
  })
}

/**
 * 格式化相对日期（更自然）
 * @param timestamp 时间戳（毫秒）
 * @example
 * formatRelativeDate(Date.now()) // "今天 14:30"
 * formatRelativeDate(Date.now() - 86400000) // "昨天 14:30"
 */
export function formatRelativeDate(timestamp: number): string {
  return formatRelative(timestamp, Date.now(), { locale: zhCN })
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 统计中文字符数
 * @param text 文本
 */
export function countChineseChars(text: string): number {
  const matches = text.match(/[\u4e00-\u9fa5]/g)
  return matches ? matches.length : 0
}

/**
 * 格式化阅读速度
 * @param charsPerMinute 每分钟字符数
 */
export function formatReadingSpeed(charsPerMinute: number): string {
  if (charsPerMinute === 0) return '0 字/分'
  return `${Math.round(charsPerMinute)} 字/分`
}

/**
 * 格式化章节标题
 * @param title 原始标题
 */
export function formatChapterTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

/**
 * 清理文本（移除多余空白）
 * @param text 文本
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // 最多保留两个换行
    .trim()
}

