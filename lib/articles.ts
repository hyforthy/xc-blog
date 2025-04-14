import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getCategories, getTags } from './categories-tags'

const articlesDirectory = path.join(process.cwd(), 'content/articles');
const articlesIndexPath = path.join(process.cwd(), 'content/articles.json');

export async function getArticles(page: number = 1, category?: string) {
  const perPage = 10;
  
  // 获取分类和标签数据
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags()
  ]);

  // 从索引文件读取文章列表
  if (!fs.existsSync(articlesIndexPath)) {
    return { articles: [], totalItems: 0 };
  }
  
  const indexContent = fs.readFileSync(articlesIndexPath, 'utf8');
  const articlesIndex = JSON.parse(indexContent);
  
  // 按日期排序
  articlesIndex.sort((a: Article, b: Article) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // 根据分类过滤
  const filteredArticles = category
    ? articlesIndex.filter((article: Article) => article.category === category)
    : articlesIndex;

  // 转换ID为名称
  const articlesWithNames = filteredArticles.map((article: Article) => ({
    ...article,
    category: categories[article.category] || article.category,
    tags: article.tags.map((tagId:string) => tags[tagId] || tagId)
  }));

  // 分页
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const articles = articlesWithNames.slice(start, end);

  return {
    articles,
    totalItems: filteredArticles.length
  };
}

export async function getArticle(id: string) {
  const [article, categories, tags] = await Promise.all([
    getArticleData(id),
    getCategories(),
    getTags()
  ]);
  
  return {
    ...article,
    category: categories[article.category] || article.category,
    tags: article.tags.map(tagId => tags[tagId] || tagId)
  };
}

async function getArticleData(id: string) {
  const fullPath = path.join(articlesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // 解析front matter
  const matterResult = matter(fileContents);
  
  // 转换markdown为HTML
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: "",
    tags:[],
    title:"",
    updatedAt: "",
    summary:"",
    ...matterResult.data,
     
    content: contentHtml,
    category: matterResult.data.category || '---',
  };
}

export interface Article {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  category: string
  tags: string[]
  summary?: string
  content?: string
}