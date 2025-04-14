import { CategoryManager } from "@/components/admin/CategoryManager";
import fs from 'fs';
import path from 'path';

async function getCategories() {
  const filePath = path.join(process.cwd(), 'content', 'categories.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function CategoryPage() {
  const categories = await getCategories();
  
  return (
    <div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}