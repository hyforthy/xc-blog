import { TagManager } from "@/components/admin/TagManager";
import { getTags } from "@/lib/categories-tags";
import { unstable_noStore as noStore } from "next/cache";

export default async function TagPage() {
  // 禁用缓存
  noStore();
  const tags = getTags();

  return (
    <div>
      <TagManager initialTags={tags} />
    </div>
  );
}
