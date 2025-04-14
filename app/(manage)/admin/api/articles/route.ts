import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authRequest } from '@/lib/auth'
import { createHash } from 'crypto'
import { generateMarkdownSummary } from '@/lib/utils';
import type { Article } from '@/lib/articles'

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')
const ARTICLES_INDEX = path.join(process.cwd(), 'content/articles.json')

// 获取文章列表
export async function GET(request: NextRequest) {
  const isAuth = await authRequest(request)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 确保索引文件存在
    await ensureIndexExists()
    
    // 读取索引文件
    const indexContent = fs.readFileSync(ARTICLES_INDEX, 'utf-8')
    const articlesIndex = JSON.parse(indexContent)
    
    // 按创建日期降序排序
    articlesIndex.sort((a: Article, b: Article) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    // 计算分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articlesIndex.slice(startIndex, endIndex)
    
    return NextResponse.json({
      articles: paginatedArticles,
      totalItems: articlesIndex.length,
      currentPage: page,
      totalPages: Math.ceil(articlesIndex.length / limit)
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
  }
}

function escapeString(str: string) {
  if (typeof str !== 'string') return str
  return str
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
}

// 创建新文章
export async function POST(req: NextRequest) {
  const isAuth = await authRequest(req)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, category, tags, content } = await req.json()

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }
    
    // 生成基于标题和时间戳的UUID
    const timestamp = Date.now().toString()
    const id = createHash('sha256')
      .update(title + timestamp)
      .digest('hex')
      .substring(0, 20) // 取前32位作为ID
      .replace(/(\w{4})(\w{4})(\w{4})(\w{4})(\w{4})/, '$1-$2-$3-$4-$5') // 格式化为UUID格式

    const date = new Date().toISOString()
    
    // 处理标签 - 支持字符串或数组
    let processedTags = []
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean)
      } else if (Array.isArray(tags)) {
        processedTags = tags
      }
    }

    // 生成摘要
    // 使用新的摘要函数
    const summary = generateMarkdownSummary(content);
    
    // 生成front matter
    const frontMatter = `---
id: '${id}'
title: '${escapeString(title)}'
createdAt: '${date}'
updatedAt: '${date}'
category: '${escapeString(category || '')}'
tags: [${processedTags.map(t => `'${escapeString(t)}'`).join(', ')}]
summary: '${escapeString(summary)}'
---\n\n${content || ''}`;

    // 确保目录存在
    if (!fs.existsSync(ARTICLES_DIR)) {
      fs.mkdirSync(ARTICLES_DIR, { recursive: true })
    }
    
    // 写入文件
    const filePath = path.join(ARTICLES_DIR, `${id}.md`)
    fs.writeFileSync(filePath, frontMatter)
    
    // 更新索引
    const newArticle = {
      id,
      title,
      createdAt: date,
      updatedAt: date,
      category: category || '',
      tags: processedTags,
      summary,
    }
    
    await updateIndex(newArticle)
    
    return NextResponse.json({ 
      success: true, 
      article: newArticle 
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}

// 辅助函数
async function ensureIndexExists() {
  if (!fs.existsSync(ARTICLES_INDEX)) {
    // 索引文件不存在，创建一个空索引
    fs.writeFileSync(ARTICLES_INDEX, '[]')
  }
}

async function updateIndex(newArticle: Article) {
  // 读取现有索引
  let articlesIndex = []
  try {
    if (fs.existsSync(ARTICLES_INDEX)) {
      const indexContent = fs.readFileSync(ARTICLES_INDEX, 'utf-8')
      articlesIndex = JSON.parse(indexContent)
    }
  } catch {
    // 索引不存在或无效，创建新索引
    articlesIndex = []
  }
  
  // 检查文章是否已存在
  const existingIndex = articlesIndex.findIndex((a: Article) => a.id === newArticle.id)
  
  if (existingIndex >= 0) {
    // 更新现有文章
    articlesIndex[existingIndex] = {
      ...articlesIndex[existingIndex],
      ...newArticle,
      updatedAt: new Date().toISOString()
    }
  } else {
    // 添加新文章
    articlesIndex.push(newArticle)
  }
  
  // 保存索引
  fs.writeFileSync(ARTICLES_INDEX, JSON.stringify(articlesIndex, null, 2))
}
