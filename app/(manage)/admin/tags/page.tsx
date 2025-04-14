import { TagManager } from "@/components/admin/TagManager";
import { getTags } from "@/lib/categories-tags";

export default function TagPage() {
  const tags = getTags();

  return (
    <div>
      <TagManager initialTags={tags} />
    </div>
  );
}
