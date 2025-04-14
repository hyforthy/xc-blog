import { NextRequest, NextResponse } from 'next/server'
import { authRequest } from '@/lib/auth'
import { getArticles, createArticle } from '@/lib/articles'

// 获取文章列表
export async function GET(request: NextRequest) {
  const isAuth = await authRequest(request)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    
    // 直接从数据库获取文章
    const { articles, totalItems } = getArticles(page)
    
    return NextResponse.json({
      articles: articles,
      totalItems,
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
  }
}

// 创建新文章
export async function POST(req: NextRequest) {
  const isAuth = await authRequest(req)
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, content, category, tags } = await req.json()

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    // 处理标签
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : tags || []

    // 创建文章
    const id = createArticle({
      title,
      content,
      categoryId: category || '',
      tagsId: processedTags
    })

    return NextResponse.json({ 
      success: true, 
      id: id 
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}
