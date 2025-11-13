/**
 * 章节解析工具
 */

import { nanoid } from 'nanoid'
import type { Chapter } from '@/types/novel'

/**
 * 章节模式配置
 */
interface ChapterPattern {
  /** 模式名称 */
  name: string
  /** 正则表达式 */
  regex: RegExp
  /** 章节级别 */
  level: number
  /** 优先级（数字越小优先级越高） */
  priority: number
}

/**
 * 预定义的章节模式
 */
const CHAPTER_PATTERNS: ChapterPattern[] = [
  // 第X章 格式
  {
    name: '第X章',
    regex: /^第[零一二三四五六七八九十百千万\d]+[章回节]/m,
    level: 1,
    priority: 1
  },
  // 第X卷 格式
  {
    name: '第X卷',
    regex: /^第[零一二三四五六七八九十百千万\d]+卷/m,
    level: 1,
    priority: 2
  },
  // Chapter X 格式
  {
    name: 'Chapter X',
    regex: /^Chapter\s+\d+/mi,
    level: 1,
    priority: 3
  },
  // 数字章节 格式（如：1. 2. 3.）
  {
    name: '数字章节',
    regex: /^\d+[\.、]/m,
    level: 1,
    priority: 4
  },
  // 序号章节 格式（如：一、二、三、）
  {
    name: '序号章节',
    regex: /^[一二三四五六七八九十百千万]+[、．]/m,
    level: 1,
    priority: 5
  },
  // 标题格式（# ## ### 等）
  {
    name: 'Markdown标题',
    regex: /^#{1,6}\s+.+$/m,
    level: 1,
    priority: 6
  },
  // 卷/部分 格式
  {
    name: '卷/部分',
    regex: /^[卷部][零一二三四五六七八九十百千万\d]+/m,
    level: 1,
    priority: 7
  },
  // 简单标题格式（独立成行的短标题）
  {
    name: '简单标题',
    regex: /^.{1,20}$/m,
    level: 2,
    priority: 8
  }
]

/**
 * 解析文本中的章节
 * @param content 文本内容
 * @param options 解析选项
 */
export function parseChapters(
  content: string,
  options: {
    /** 最小章节长度（字符数） */
    minChapterLength?: number
    /** 最大章节标题长度 */
    maxTitleLength?: number
    /** 是否启用智能过滤 */
    enableSmartFilter?: boolean
  } = {}
): Chapter[] {
  const {
    minChapterLength = 100,
    maxTitleLength = 50,
    enableSmartFilter = true
  } = options

  const chapters: Chapter[] = []
  const lines = content.split('\n')
  
  // 尝试不同的章节模式
  for (const pattern of CHAPTER_PATTERNS) {
    const foundChapters = findChaptersByPattern(content, lines, pattern, {
      minChapterLength,
      maxTitleLength,
      enableSmartFilter
    })
    
    if (foundChapters.length > 1) {
      // 如果找到了有效的章节，就使用这个模式
      return foundChapters
    }
  }
  
  // 如果没有找到明确的章节模式，尝试智能分段
  if (enableSmartFilter) {
    return smartChapterDetection(content, lines, {
      minChapterLength,
      maxTitleLength
    })
  }
  
  return chapters
}

/**
 * 根据特定模式查找章节
 */
function findChaptersByPattern(
  content: string,
  lines: string[],
  pattern: ChapterPattern,
  options: {
    minChapterLength: number
    maxTitleLength: number
    enableSmartFilter: boolean
  }
): Chapter[] {
  const chapters: Chapter[] = []
  const matches: { line: number; title: string; position: number }[] = []
  
  // 查找所有匹配的行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line && pattern.regex.test(line) && line.length <= options.maxTitleLength) {
      // 计算该行在整个文本中的位置
      const position = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0)
      matches.push({
        line: i,
        title: line,
        position
      })
    }
  }
  
  // 如果匹配数量太少，可能不是有效的章节模式
  if (matches.length < 2) {
    return chapters
  }
  
  // 创建章节对象
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const nextMatch = matches[i + 1]
    
    const startPosition = match.position
    const endPosition = nextMatch ? nextMatch.position - 1 : content.length
    const chapterContent = content.slice(startPosition, endPosition)
    
    // 检查章节长度
    if (chapterContent.length >= options.minChapterLength || i === matches.length - 1) {
      chapters.push({
        id: nanoid(),
        title: match.title,
        startPosition,
        endPosition,
        wordCount: chapterContent.length,
        index: i + 1,
        level: pattern.level
      })
    }
  }
  
  return chapters
}

/**
 * 智能章节检测（当没有明确模式时）
 */
function smartChapterDetection(
  content: string,
  lines: string[],
  options: {
    minChapterLength: number
    maxTitleLength: number
  }
): Chapter[] {
  const chapters: Chapter[] = []
  const potentialTitles: { line: number; title: string; position: number; score: number }[] = []
  
  // 分析每一行，计算作为章节标题的可能性
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const score = calculateTitleScore(line, lines, i)
    if (score > 0.5 && line.length <= options.maxTitleLength) {
      const position = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0)
      potentialTitles.push({
        line: i,
        title: line,
        position,
        score
      })
    }
  }
  
  // 按分数排序并选择最佳的标题
  potentialTitles.sort((a, b) => b.score - a.score)
  
  // 过滤掉距离太近的标题
  const filteredTitles = filterNearbyTitles(potentialTitles, options.minChapterLength)
  
  // 创建章节
  for (let i = 0; i < filteredTitles.length; i++) {
    const title = filteredTitles[i]
    const nextTitle = filteredTitles[i + 1]
    
    const startPosition = title.position
    const endPosition = nextTitle ? nextTitle.position - 1 : content.length
    const chapterContent = content.slice(startPosition, endPosition)
    
    chapters.push({
      id: nanoid(),
      title: title.title,
      startPosition,
      endPosition,
      wordCount: chapterContent.length,
      index: i + 1,
      level: 1
    })
  }
  
  return chapters
}

/**
 * 计算文本行作为章节标题的分数
 */
function calculateTitleScore(line: string, lines: string[], lineIndex: number): number {
  let score = 0
  
  // 长度分数（较短的行更可能是标题）
  if (line.length <= 20) score += 0.3
  else if (line.length <= 50) score += 0.1
  
  // 位置分数（段落开头更可能是标题）
  const prevLine = lineIndex > 0 ? lines[lineIndex - 1].trim() : ''
  const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1].trim() : ''
  
  if (!prevLine || prevLine.length < 10) score += 0.2
  if (!nextLine) score += 0.1
  
  // 内容分数（包含特定关键词）
  const titleKeywords = ['章', '节', '部', '卷', '篇', '序', '尾声', '结局', '开始']
  for (const keyword of titleKeywords) {
    if (line.includes(keyword)) {
      score += 0.3
      break
    }
  }
  
  // 格式分数（特殊格式）
  if (/^\d+[\.、]/.test(line)) score += 0.2
  if (/^[一二三四五六七八九十百千万]+[、．]/.test(line)) score += 0.2
  if (/^第[零一二三四五六七八九十百千万\d]+/.test(line)) score += 0.4
  
  // 标点分数（标题通常不以标点结尾）
  if (!/[。！？；]$/.test(line)) score += 0.1
  
  return Math.min(score, 1.0)
}

/**
 * 过滤距离太近的标题
 */
function filterNearbyTitles(
  titles: { line: number; title: string; position: number; score: number }[],
  minDistance: number
): typeof titles {
  const filtered: typeof titles = []
  
  for (const title of titles) {
    const tooClose = filtered.some(existing => 
      Math.abs(title.position - existing.position) < minDistance
    )
    
    if (!tooClose) {
      filtered.push(title)
    }
  }
  
  // 按位置排序
  return filtered.sort((a, b) => a.position - b.position)
}

/**
 * 获取章节内容
 * @param content 完整文本内容
 * @param chapter 章节信息
 */
export function getChapterContent(content: string, chapter: Chapter): string {
  return content.slice(chapter.startPosition, chapter.endPosition)
}

/**
 * 根据位置查找所在章节
 * @param chapters 章节列表
 * @param position 文本位置
 */
export function findChapterByPosition(chapters: Chapter[], position: number): Chapter | null {
  return chapters.find(chapter => 
    position >= chapter.startPosition && position < chapter.endPosition
  ) || null
}

/**
 * 获取章节摘要（前100个字符）
 * @param content 完整文本内容
 * @param chapter 章节信息
 */
export function getChapterSummary(content: string, chapter: Chapter): string {
  const chapterContent = getChapterContent(content, chapter)
  // 移除标题行，获取正文
  const lines = chapterContent.split('\n')
  const contentLines = lines.slice(1).filter(line => line.trim())
  const summary = contentLines.join('').slice(0, 100)
  return summary + (summary.length >= 100 ? '...' : '')
}
