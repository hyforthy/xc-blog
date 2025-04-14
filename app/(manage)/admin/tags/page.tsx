import { TagManager } from "@/components/admin/TagManager";
import fs from 'fs';
import path from 'path';

async function getTags() {
  const filePath = path.join(process.cwd(), 'content', 'tags.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function TagPage() {
  const tags = await getTags();
  
  return (
    <div>
      <TagManager initialTags={tags} />
    </div>
  );
}