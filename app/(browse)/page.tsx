import ArticleList from "@/components/browse/ArticleList";
import { getArticles } from "@/lib/articles";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; category?: string }>;
}) {
  // 确保searchParams.page是字符串类型
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;

  const page = Number(pageParam) || 1;

  const { articles, totalItems } = await getArticles(page, params.category);

  return (
    <div>
      <ArticleList
        articles={articles}
        currentPage={page}
        totalItems={totalItems}
      />
    </div>
  );
}
