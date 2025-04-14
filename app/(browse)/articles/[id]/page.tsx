import { getArticle } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const article = await getArticle((await params).id);

  if (!article) {
    return (
      <div>
        <div className="text-primary dark:text-primary-dark">文章未找到</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 文章标题 */}
      <h1 className="text-primary dark:text-primary-dark font-bold text-3xl mb-6 leading-tight text-center">
        {article.title}
      </h1>

      {/* 文章内容 */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* 标签和发布时间 */}
      <div className="mt-8 text-sm text-secondary dark:text-secondary-dark">
        <div className="space-x-2 mb-3 flex justify-end">
          {article.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-end mt-4 items-center">
          <span>{formatDate(article.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
