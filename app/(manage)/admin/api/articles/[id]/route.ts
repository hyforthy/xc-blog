import { NextRequest, NextResponse } from 'next/server'
import { authRequest } from '@/lib/auth'
import { getArticleForEdit, updateArticle, deleteArticle, getArticleForRead } from '@/lib/articles'

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await authRequest(request)
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const xParams = await params
    const id = xParams.id
    const { searchParams } = new URL(request.url)
    const md = searchParams.get('md') !== '0' // markdown

    let article = null
    if (md) {
      article = getArticleForEdit(id)
    } else {
      article = await getArticleForRead(id)
    }
    
    
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({
      ...article,
      content: article.content
    })
  } catch (error) {
    console.error('获取文章失败:', error)
    const errorMessage = error instanceof Error ? error.message : '获取文章失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await authRequest(request)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const xParams = await params
    const id = xParams.id
    const { title, category, tags, content } = await request.json()

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    // 处理标签
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : tags || []

    // 更新文章
    updateArticle(id, {
      title,
      content,
      categoryId: category || '',
      tags: processedTags
    })

    return NextResponse.json({ 
      success: true, 
      id: id 
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
    const xParams = await params
    const id = xParams.id
    
    // 软删除文章
    deleteArticle(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 })
  }
}