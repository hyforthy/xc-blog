import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date) {
  if (!dateString) return '未知'
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * 从Markdown内容生成纯文本摘要
 * @param content Markdown内容
 * @param length 摘要长度，默认200
 */
export function generateMarkdownSummary(content: string, length = 200): string {
  if (!content) return '';
  
  // 移除Markdown标记
  const text = content
    .replace(/^#+\s+/gm, '') // 标题
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 图片
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2') // 粗体/斜体
    .replace(/\s+/g, ' '); // 合并多余空格

  // 截取指定长度
  return text.substring(0, length).trim() + 
    (text.length > length ? '...' : '');
}