import ArticleList from "@/components/browse/ArticleList";
import TagNav from "@/components/browse/TagNav";
import { getArticles } from "@/lib/articles";
import { getTags } from "@/lib/categories-tags";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    category?: string;
    tag?: string;
  }>;
}) {
  // 确保searchParams.page是字符串类型
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;

  const page = Number(pageParam) || 1;

  const { articles, totalItems } = getArticles(
    page,
    params.category,
    params.tag
  );

  const tags = getTags();
  const tagList = Object.entries(tags).map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 dark:bg-gray-900 py-2 shadow-sm -mt-2 rounded-sm">
        <div className="max-w-4xl mx-auto px-2 overflow-hidden">
          <TagNav tags={tagList} />
        </div>
      </div>
      <ArticleList
        articles={articles}
        currentPage={page}
        totalItems={totalItems}
      />
    </div>
  );
}
