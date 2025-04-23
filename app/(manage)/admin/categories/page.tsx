import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/categories-tags";
import { unstable_noStore as noStore } from "next/cache";

export default async function CategoryPage() {
  // 禁用缓存
  noStore();
  const categories = getCategories();

  return (
    <div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
