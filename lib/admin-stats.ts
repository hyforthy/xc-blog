import db from './db';

interface CountResult {
  count: number;
}

export async function getArticleCount(): Promise<number> {
  const stmt = db.prepare<[]>('SELECT COUNT(*) as count FROM articles WHERE is_deleted = 0');
  const result = stmt.get() as CountResult;
  return result.count;
}

export async function getCategoryCount(): Promise<number> {
  const stmt = db.prepare<[]>('SELECT COUNT(*) as count FROM categories');
  const result = stmt.get() as CountResult;
  return result.count;
}

export async function getTagCount(): Promise<number> {
  const stmt = db.prepare<[]>('SELECT COUNT(*) as count FROM tags');
  const result = stmt.get() as CountResult;
  return result.count;
}