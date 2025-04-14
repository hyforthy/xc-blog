import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/categories-tags";

export default async function CategoryPage() {
  const categories = getCategories();

  return (
    <div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
