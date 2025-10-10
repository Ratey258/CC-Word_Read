/**
 * 文档解析器 Composable
 * 支持解析 TXT、Word (.docx)、Markdown 文件并保留格式
 */

import mammoth from 'mammoth'

export interface ParsedDocument {
  /** 纯文本内容 */
  text: string
  /** HTML 格式内容（保留格式） */
  html: string
  /** 文档格式 */
  format: 'txt' | 'docx' | 'md' | 'unknown'
  /** 是否包含格式 */
  hasFormatting: boolean
}

export function useDocumentParser() 
{
  /**
   * 解析 TXT 文件
   * @param content 文件内容
   */
  function parseTxt(content: string): ParsedDocument 
{
    // 清理内容
    const cleaned = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')

    // 转换为简单的 HTML
    const html = cleaned
      .split('\n')
      .map(line => 
{
        if (line.trim() === '') 
{
          return '<p><br></p>'
        }
        return `<p>${escapeHtml(line)}</p>`
      })
      .join('')

    return {
      text: cleaned,
      html,
      format: 'txt',
      hasFormatting: false
    }
  }

  /**
   * 解析 Word 文档（.docx）
   * @param arrayBuffer 文件二进制数据
   */
  async function parseDocx(arrayBuffer: ArrayBuffer): Promise<ParsedDocument> 
{
    try 
{
      // 使用 mammoth 解析 Word 文档
      const result = await mammoth.convertToHtml({ arrayBuffer })
      
      // 提取纯文本
      const textResult = await mammoth.extractRawText({ arrayBuffer })
      const text = textResult.value || ''

      // 清理 HTML
      const html = result.value || ''

      // 检查是否包含格式
      const hasFormatting = html !== text && (
        html.includes('<strong>') ||
        html.includes('<em>') ||
        html.includes('<u>') ||
        html.includes('<h1>') ||
        html.includes('<h2>') ||
        html.includes('<h3>') ||
        html.includes('<ul>') ||
        html.includes('<ol>')
      )

      return {
        text: text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
        html,
        format: 'docx',
        hasFormatting
      }
    }
 catch (error) 
{
      console.error('解析 Word 文档失败:', error)
      throw new Error('Word 文档解析失败，请确保文件格式正确')
    }
  }

  /**
   * 解析 Markdown 文件
   * @param content 文件内容
   */
  function parseMarkdown(content: string): ParsedDocument 
{
    // 清理内容
    const cleaned = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

    // 简单的 Markdown 转 HTML（支持基本格式）
    let html = cleaned

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>')

    // 斜体
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>')

    // 段落
    html = html
      .split('\n\n')
      .map(para => 
{
        if (para.trim().startsWith('<h')) 
{
          return para
        }
        if (para.trim() === '') 
{
          return '<p><br></p>'
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`
      })
      .join('')

    return {
      text: cleaned,
      html,
      format: 'md',
      hasFormatting: true
    }
  }

  /**
   * 自动解析文档
   * @param file 文件对象或内容
   * @param fileName 文件名
   */
  async function parseDocument(
    file: File | string,
    fileName: string
  ): Promise<ParsedDocument> 
{
    const ext = fileName.split('.').pop()?.toLowerCase()

    switch (ext) 
{
      case 'txt':
        // TXT 文件
        if (typeof file === 'string') 
{
          return parseTxt(file)
        }
 else 
{
          const content = await file.text()
          return parseTxt(content)
        }

      case 'docx':
        // Word 文档
        if (typeof file === 'string') 
{
          throw new Error('Word 文档不支持字符串内容，请使用 File 对象')
        }
 else 
{
          const arrayBuffer = await file.arrayBuffer()
          return await parseDocx(arrayBuffer)
        }

      case 'md':
        // Markdown 文件
        if (typeof file === 'string') 
{
          return parseMarkdown(file)
        }
 else 
{
          const content = await file.text()
          return parseMarkdown(content)
        }

      default: {
        // 未知格式，按纯文本处理
        const content = typeof file === 'string' ? file : await file.text()
        return parseTxt(content)
      }
    }
  }

  /**
   * HTML 转义
   */
  function escapeHtml(text: string): string 
{
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return {
    parseTxt,
    parseDocx,
    parseMarkdown,
    parseDocument,
    escapeHtml
  }
}

