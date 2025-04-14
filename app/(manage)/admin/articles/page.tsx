import { getArticles } from "@/lib/articles";
import ArticleList from "@/components/admin/ArticleList";
import ArticleViewer from "@/components/admin/ArticleViewer";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const viewId = Array.isArray(params.view) ? params.view[0] : params.view;

  const page = Number(pageParam) || 1;
  const { articles, totalItems } = getArticles(page);

  return (
    <div>
      {viewId ? (
        <ArticleViewer articleId={viewId} />
      ) : (
        <ArticleList
          articles={articles}
          currentPage={page}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}
