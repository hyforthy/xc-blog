import fs from 'fs';
import path from 'path';

const categoriesPath = path.join(process.cwd(), 'content/categories.json');
const tagsPath = path.join(process.cwd(), 'content/tags.json');

// 获取分类数据
export async function getCategories(): Promise<Record<string, string>> {
  try {
    if (!fs.existsSync(categoriesPath)) return {};
    const content = fs.readFileSync(categoriesPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// 获取标签数据
export async function getTags(): Promise<Record<string, string>> {
  try {
    if (!fs.existsSync(tagsPath)) return {};
    const content = fs.readFileSync(tagsPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}