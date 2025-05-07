
import db from './db';
import { remark } from 'remark';
import html from 'remark-html';
import { randomUUID } from 'crypto';
import { generateMarkdownSummary } from '@/lib/utils'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';


export function getArticles(page = 1, categoryId?: string, tagId?: string) {
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  
  // 基础查询
  let query = `SELECT a.*, c.name as category_name FROM articles a INNER JOIN categories c ON a.category_id = c.id`;
  const params = [];
  
  // WHERE 条件
  const conditions = ['a.is_deleted = 0'];
  
  // 分类过滤
  if (categoryId) {
    conditions.push('a.category_id = ?');
    params.push(categoryId);
  }
  
  // 标签过滤 - 使用子查询而不是JOIN
  if (tagId) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM article_tags at 
        WHERE at.article_id = a.id AND at.tag_id = ?
      )
    `);
    params.push(tagId);
  }
  
  // 添加WHERE子句
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // 添加排序和分页
  query += `
    ORDER BY a.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(pageSize, offset);

  // 执行查询
  const articles = db.prepare(query).all(...params) as RawArticle[];

  // db返回的字段名是snake_case，需要转换为camelCase
  const formattedArticles = articles.map(article => ({
    id: article.id,
    title: article.title,
    createdAt: article.created_at, // snake_case → camelCase
    updatedAt: article.updated_at,
    categoryId: article.category_id,
    category: article.category_name,
    summary: article.summary,
    content: article.content,
  })) as Article[];

  // 总数查询
  let countQuery = `SELECT COUNT(*) as count FROM articles a INNER JOIN categories c ON a.category_id = c.id`;
  if (conditions.length > 0) {
    countQuery += ` WHERE ${conditions.join(' AND ')}`;
  }
  // 执行总数查询
  const countParams = params.slice(0, params.length - 2); // 移除LIMIT和OFFSET参数
  const total = (db.prepare(countQuery).get(...countParams) as {count: number}).count;

  // 获取标签
  const articleIds = formattedArticles.map(a => a.id);
  const allArticleTags = articleIds.length > 0 ? 
    db.prepare(
      `SELECT at.article_id, at.tag_id, t.name FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE at.article_id IN (${articleIds.map(() => '?').join(',')})`
    ).all(...articleIds) as {article_id: string, tag_id: string, name: string}[] : [];

  // 按文章ID分组标签
  const tagsByArticleId = allArticleTags.reduce((acc, {article_id, tag_id, name}) => {
    if (!acc[article_id]) acc[article_id] = {tagId: [], tagName:[]};
    acc[article_id]["tagId"].push(tag_id);
    acc[article_id]["tagName"].push(name);
    return acc;
  }, {} as Record<string, Record<string, string[]>>);

  // 构建最终结果
  const articlesWithTags = formattedArticles.map(article => {
    // 检查文章是否有关联的标签数据
    const articleTags = tagsByArticleId[article.id] || {tagId: [], tagName: []};
    
    return {
      ...article,
      content:"",
      tagsId: articleTags.tagId || [],
      tags: articleTags.tagName || []
    };
  });

  return {
    articles: articlesWithTags,
    totalItems: total
  };
}

export async function getArticleForRead(id: string) {
  const article = getArticlePure(id);
  
  // 转换markdown为HTML
  const processedContent = await remark()
    .use(gfm)
    .use(breaks) // 支持换行符转换
    .use(html)
    .process(article.content);
  const contentHtml = processedContent.toString();

  return {
    id: article.id,
    title: article.title,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    tagsId: article.tagsId,
    tags: article.tagsName,
    categoryId: article.categoryId,
    category: article.categoryName,
    content: contentHtml,
  };
}

export function getArticleForEdit(id: string) {
  const article = getArticlePure(id);

  return {
    id: article.id,
    title: article.title,
    category: article.categoryId,
    tags: article.tagsId,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    content: article.content,
  }
  
}

export function getArticlePure(id: string) {
  const article = db.prepare(
    `SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`
  ).get(id) as RawArticle;

  // 获取标签信息（包含ID和名称）
  const tags = db.prepare(
    `SELECT t.id, t.name FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ?`
  ).all(id) as {id: string, name: string}[];

  return {
    id: article.id,
    title: article.title,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    categoryId: article.category_id,
    categoryName: article.category_name,
    tagsId: tags.map(tag => tag.id),
    tagsName: tags.map(tag => tag.name),
    summary: article.summary,
    content: article.content,
  }
}

export function createArticle(article: { title: string; content: string; categoryId: string; tagsId: string[] }) {
  const id = "art-" + randomUUID().replace(/-/g, '').substring(0, 12);
  const now = new Date().toISOString();
  const summary = generateMarkdownSummary(article.content);

  try {
    db.transaction(() => {
      // 插入文章
      db.prepare(
        `INSERT INTO articles (id, title, content, category_id, summary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(id, article.title, article.content, article.categoryId, summary, now, now);

      // 插入标签
      const insertTag = db.prepare(
        `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
      );
      
      article.tagsId.forEach(tagId => {
        insertTag.run(id, tagId);
      });
    })();

    return id;
  } catch (error) {
    throw error;
  }
}


export function updateArticle(id: string, updates: {
  title?: string;
  content?: string;
  categoryId?: string;
  tags?: string[];
}) {
  const now = new Date().toISOString();
  let summary = '';

  if (updates.content) {
    summary = generateMarkdownSummary(updates.content);
  }

  db.transaction(() => {
    // 更新文章
    db.prepare(`
      UPDATE articles
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          category_id = COALESCE(?, category_id),
          summary = COALESCE(?, summary),
          updated_at = ?
      WHERE id = ?
    `).run(
      updates.title,
      updates.content,
      updates.categoryId,
      summary || undefined,
      now,
      id
    );

    // 更新标签（先删除旧的，再插入新的）
    if (updates.tags) {
      db.prepare(`
        DELETE FROM article_tags
        WHERE article_id = ?
      `).run(id);

      const insertTag = db.prepare(`
        INSERT OR IGNORE INTO article_tags (article_id, tag_id)
        VALUES (?, ?)
      `);
      
      updates.tags.forEach(tagId => {
        insertTag.run(id, tagId);
      });
    }
  })();
}

export function deleteArticle(id: string) {
  // 软删除
  db.prepare(`
    UPDATE articles
    SET is_deleted = 1,
        updated_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), id);
}


interface RawArticle {
  id: string
  title: string
  created_at: string
  updated_at: string
  category_id: string
  category_name: string
  summary: string
  content: string
}

export interface Article {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  categoryId: string
  category: string
  tagsId: string[]
  tags: string[]
  summary?: string
  content?: string
}