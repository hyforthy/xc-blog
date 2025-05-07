import { getArticles } from "@/lib/articles";
import { getCategories } from "@/lib/categories-tags";
import { getTags } from "@/lib/categories-tags";
import ArticleList from "@/components/admin/ArticleList";
import ArticleViewer from "@/components/admin/ArticleViewer";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    view?: string;
    category?: string;
    tag?: string;
  }>;
}) {
  const params = await searchParams;
  const viewId = Array.isArray(params.view) ? params.view[0] : params.view;

  if (viewId) {
    return (
      <div className="select-none">
        <ArticleViewer articleId={viewId} />
      </div>
    );
  }

  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number(pageParam) || 1;
  const categoryId = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const tagId = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  // 获取分类和标签名称
  const categories = getCategories();
  const tags = getTags();
  const categoryName = categoryId ? categories[categoryId] : undefined;
  const tagName = tagId ? tags[tagId] : undefined;

  const { articles, totalItems } = getArticles(page, categoryId, tagId);

  return (
    <div>
      <ArticleList
        articles={articles}
        currentPage={page}
        totalItems={totalItems}
        categoryName={categoryName}
        tagName={tagName}
      />
    </div>
  );
}
