import db from './db';

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function getCategories() {
  const categories = db.prepare('SELECT * FROM categories ORDER BY updated_at').all() as Category[];
  
  return categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);
}

interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function getTags() {
  const tags = db.prepare('SELECT * FROM tags ORDER BY updated_at').all() as Tag[];
  
  return tags.reduce((acc, tag) => {
    acc[tag.id] = tag.name;
    return acc;
  }, {} as Record<string, string>);
}





