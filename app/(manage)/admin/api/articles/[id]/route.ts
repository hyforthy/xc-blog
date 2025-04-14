import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { authRequest } from '@/lib/auth'
import { generateMarkdownSummary } from '@/lib/utils'
import type { Article } from '@/lib/articles'
import { getCategories, getTags } from '@/lib/categories-tags'

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')
const ARTICLES_INDEX = path.join(process.cwd(), 'content/articles.json')

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const isAuth = await authRequest(request)
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const xParams =  await params
    const id = xParams.id

    // 从URL查询参数获取md
    const { searchParams } = new URL(request.url)
    const md = searchParams.get('md') === '0' ? 0 : 1
     
    
    // 读取索引文件
    if (!fs.existsSync(ARTICLES_INDEX)) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const indexContent = fs.readFileSync(ARTICLES_INDEX, 'utf-8')
    const articlesIndex = JSON.parse(indexContent)
    
    // 查找文章
    const article = articlesIndex.find((a: Article) => a.id === id)
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    // 读取文章内容
    const filePath = path.join(ARTICLES_DIR, `${article.id}.md`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文章文件不存在' }, { status: 404 })
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // 解析front matter
  const matterResult = matter(fileContent);
    
  let content = matterResult.content
  if (md === 0) {
    // 转换markdown为HTML
    const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
    content = processedContent.toString();

    // 获取分类和标签数据
    const [categories, tags] = await Promise.all([
      getCategories(),
      getTags()
    ])

    // 转换ID为名称
    article.category = categories[article.category] || article.category
    article.tags = article.tags.map((tagId: string) => tags[tagId] || tagId)
  }
    
    return NextResponse.json({
      ...article,
      content
    })
  } catch (error) {
    console.error('获取文章失败:', error)
    const errorMessage = error instanceof Error ? error.message : '获取文章失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// 更新文章
// 修改PUT方法中的front matter生成部分
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await authRequest(request)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = (await params).id
    const { title, category, tags, content } = await request.json()

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }
    
    // 读取索引文件
    if (!fs.existsSync(ARTICLES_INDEX)) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const indexContent = fs.readFileSync(ARTICLES_INDEX, 'utf-8')
    const articlesIndex = JSON.parse(indexContent)
    
    // 查找文章
    const articleIndex = articlesIndex.findIndex((a: Article) => a.id === id)
    if (articleIndex === -1) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const existingArticle = articlesIndex[articleIndex]
    
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
    const summary = generateMarkdownSummary(content);

    const updatedAt = new Date().toISOString()
    // 生成front matter
    const frontMatter = `---
id: '${id}'
title: '${title}'
createdAt: '${existingArticle.createdAt}'
updatedAt: '${updatedAt}'
category: '${category || ''}'
tags: [${processedTags.map(t => `'${t}'`).join(', ')}]
summary: '${summary.replace(/'/g, "\\'")}'
---\n\n${content || ''}`;

    // 写入文件
    const filePath = path.join(ARTICLES_DIR, `${existingArticle.id}.md`)
    fs.writeFileSync(filePath, frontMatter)
    
    // 更新索引
    const updatedArticle = {
      id,
      title,
      createdAt:existingArticle.createdAt,
      updatedAt: updatedAt,
      category: category || '',
      tags: processedTags,
      summary,
    }
    
    articlesIndex[articleIndex] = updatedArticle
    fs.writeFileSync(ARTICLES_INDEX, JSON.stringify(articlesIndex, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      article: updatedArticle 
    })
  } catch (error) {
    console.error('更新文章失败:', error)
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 })
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await authRequest(request)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = (await params).id
    
    // 读取索引文件
    if (!fs.existsSync(ARTICLES_INDEX)) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const indexContent = fs.readFileSync(ARTICLES_INDEX, 'utf-8')
    const articlesIndex = JSON.parse(indexContent)
    
    // 查找文章
    const articleIndex = articlesIndex.findIndex((a:Article) => a.id === id)
    if (articleIndex === -1) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const article = articlesIndex[articleIndex]
    
    // 删除文章文件
    const filePath = path.join(ARTICLES_DIR, `${article.id}.md`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    // 更新索引
    articlesIndex.splice(articleIndex, 1)
    fs.writeFileSync(ARTICLES_INDEX, JSON.stringify(articlesIndex, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 })
  }
}