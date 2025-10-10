/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number, decimals = 2): string
{
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
export function formatNumber(num: number): string
{
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 * @param value 值
 * @param total 总数
 * @param decimals 小数位数
 */
export function formatPercentage(value: number, total: number, decimals = 2): string
{
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化时间（毫秒转可读格式）
 * @param ms 毫秒数
 */
export function formatDuration(ms: number): string
{
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0)
  {
    return `${hours}小时${minutes % 60}分钟`
  }
  else if (minutes > 0)
  {
    return `${minutes}分钟${seconds % 60}秒`
  }
  else
  {
    return `${seconds}秒`
  }
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）
 * @param format 格式化模板
 */
export function formatDateTime(
  timestamp: number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string
{
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间
 * @param timestamp 时间戳（毫秒）
 */
export function formatRelativeTime(timestamp: number): string
{
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0)
  {
    return `${days}天前`
  }
  else if (hours > 0)
  {
    return `${hours}小时前`
  }
  else if (minutes > 0)
  {
    return `${minutes}分钟前`
  }
  else
  {
    return '刚刚'
  }
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string
{
  if (text.length <= maxLength)
  {
    return text
  }
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 统计中文字符数
 * @param text 文本
 */
export function countChineseChars(text: string): number
{
  const matches = text.match(/[\u4e00-\u9fa5]/g)
  return matches ? matches.length : 0
}

/**
 * 格式化阅读速度
 * @param charsPerMinute 每分钟字符数
 */
export function formatReadingSpeed(charsPerMinute: number): string
{
  if (charsPerMinute === 0) return '0 字/分'
  return `${Math.round(charsPerMinute)} 字/分`
}

/**
 * 格式化章节标题
 * @param title 原始标题
 */
export function formatChapterTitle(title: string): string
{
  return title.trim().replace(/\s+/g, ' ')
}

/**
 * 清理文本（移除多余空白）
 * @param text 文本
 */
export function cleanText(text: string): string
{
  return text
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // 最多保留两个换行
    .trim()
}

