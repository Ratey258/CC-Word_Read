/**
 * 验证器工具函数
 */

import { FILE_LIMITS } from './constants'
import type { NovelFormat } from '@/types/novel'

/**
 * 验证文件大小
 * @param size 文件大小（字节）
 */
export function validateFileSize(size: number): { valid: boolean; message?: string }
{
  if (size === 0)
  {
    return {
      valid: false,
      message: '文件为空'
    }
  }

  if (size > FILE_LIMITS.MAX_SIZE)
  {
    return {
      valid: false,
      message: `文件大小超过限制（最大 ${FILE_LIMITS.MAX_SIZE / 1024 / 1024}MB）`
    }
  }

  return { valid: true }
}

/**
 * 验证文件格式
 * @param filename 文件名
 */
export function validateFileFormat(
  filename: string
): { valid: boolean; format?: NovelFormat; message?: string }
{
  const ext = filename.split('.').pop()?.toLowerCase()

  if (!ext)
  {
    return {
      valid: false,
      message: '无法识别文件格式'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!FILE_LIMITS.SUPPORTED_FORMATS.includes(ext as any))
  {
    return {
      valid: false,
      message: `不支持的文件格式（支持: ${FILE_LIMITS.SUPPORTED_FORMATS.join(', ')}）`
    }
  }

  return {
    valid: true,
    format: ext as NovelFormat
  }
}

/**
 * 验证文件
 * @param file 文件对象
 */
export function validateFile(
  file: File
): { valid: boolean; format?: NovelFormat; message?: string }
{
  // 验证大小
  const sizeResult = validateFileSize(file.size)
  if (!sizeResult.valid)
  {
    return sizeResult
  }

  // 验证格式
  const formatResult = validateFileFormat(file.name)
  if (!formatResult.valid)
  {
    return formatResult
  }

  return {
    valid: true,
    format: formatResult.format
  }
}

/**
 * 验证小说内容
 * @param content 小说内容
 */
export function validateNovelContent(
  content: string
): { valid: boolean; message?: string }
{
  if (!content || content.trim().length === 0)
  {
    return {
      valid: false,
      message: '小说内容为空'
    }
  }

  if (content.length < 10)
  {
    return {
      valid: false,
      message: '小说内容过短'
    }
  }

  return { valid: true }
}

/**
 * 验证书签名称
 * @param name 书签名称
 */
export function validateBookmarkName(name: string): { valid: boolean; message?: string }
{
  if (!name || name.trim().length === 0)
  {
    return {
      valid: false,
      message: '书签名称不能为空'
    }
  }

  if (name.length > 50)
  {
    return {
      valid: false,
      message: '书签名称过长（最多50个字符）'
    }
  }

  return { valid: true }
}

/**
 * 验证位置（是否在有效范围内）
 * @param position 位置
 * @param maxPosition 最大位置
 */
export function validatePosition(
  position: number,
  maxPosition: number
): { valid: boolean; message?: string }
{
  if (position < 0)
  {
    return {
      valid: false,
      message: '位置不能为负数'
    }
  }

  if (position > maxPosition)
  {
    return {
      valid: false,
      message: '位置超出范围'
    }
  }

  return { valid: true }
}

/**
 * 验证字符数设置
 * @param count 字符数
 */
export function validateCharsPerOutput(count: number): { valid: boolean; message?: string }
{
  if (count < 1)
  {
    return {
      valid: false,
      message: '每次输出字符数不能小于1'
    }
  }

  if (count > 100)
  {
    return {
      valid: false,
      message: '每次输出字符数不能大于100'
    }
  }

  return { valid: true }
}

/**
 * 验证快捷键格式
 * @param shortcut 快捷键字符串
 */
export function validateShortcut(shortcut: string): { valid: boolean; message?: string }
{
  const validKeys = /^(Ctrl|Alt|Shift)\+[A-Za-z0-9]$/
  
  if (!validKeys.test(shortcut))
  {
    return {
      valid: false,
      message: '快捷键格式不正确（例如: Ctrl+O）'
    }
  }

  return { valid: true }
}

/**
 * 是否为空值
 * @param value 值
 */
export function isEmpty(value: unknown): boolean
{
  if (value === null || value === undefined)
  {
    return true
  }

  if (typeof value === 'string')
  {
    return value.trim().length === 0
  }

  if (Array.isArray(value))
  {
    return value.length === 0
  }

  if (typeof value === 'object')
  {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * 是否为有效的 URL
 * @param url URL 字符串
 */
export function isValidUrl(url: string): boolean
{
  try
  {
    new URL(url)
    return true
  }
  catch
  {
    return false
  }
}

