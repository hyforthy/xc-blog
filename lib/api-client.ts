// 获取文章列表
export async function getArticles(page = 1, limit = 10) {
  const response = await fetch(`/admin/api/articles?page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('获取文章列表失败')
  }
  return response.json()
}

// 获取单篇文章
export async function getManageArticle(id: string, md: number = 1 ) {
  const response = await fetch(`/admin/api/articles/${id}?md=${md}`)
  if (!response.ok) {
    throw new Error('获取文章失败')
  }
  return response.json()
}

// 保存文章（新增或更新）
interface SaveArticleParams {
  id: string | null;
  title: string;
  content: string;
  category: string;
  tags: string | string[];
  // 其他需要的字段
}

export async function saveManageArticle(params: SaveArticleParams) {
  // 处理标签
  let processedTags = params.tags
  if (typeof params.tags === 'string') {
    processedTags = params.tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }
  
  const method = params.id ? 'PUT' : 'POST'
  const url = params.id ? `/admin/api/articles/${params.id}` : '/admin/api/articles'
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      tags: processedTags
    }),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || '保存文章失败')
  }
  
  return response.json()
}

// 删除文章
export async function deleteManageArticle(id: string) {
  const response = await fetch(`/admin/api/articles/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('删除文章失败')
  }
  
  return response.json()
}