import { getArticleForRead } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const article = await getArticleForRead((await params).id);

  if (!article) {
    return (
      <div>
        <div className="text-primary dark:text-primary-dark">文章未找到</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        {/* 文章标题 */}
        <h1 className="text-primary dark:text-primary-dark font-bold text-3xl mb-3 leading-tight text-center">
          {article.title}
        </h1>

        {/* 分类信息 - 添加链接 */}
        {article.category && (
          <div className="text-center text-sm">
            <Link
              href={`/?categoryId=${encodeURIComponent(
                article.categoryId || ""
              )}`}
            >
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer inline-block">
                {article.category}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* 文章内容 */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />

      {/* 标签和发布时间 - 添加链接 */}
      <div className="mt-8 text-sm text-secondary dark:text-secondary-dark">
        <div className="space-x-2 mb-3 flex justify-end">
          {article.tags?.map((tag, index) => (
            <Link
              key={tag}
              href={`/?tagId=${encodeURIComponent(
                article.tagsId?.[index] || ""
              )}`}
            >
              <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer inline-block">
                {tag}
              </span>
            </Link>
          ))}
        </div>
        <div className="flex justify-end mt-4 items-center">
          <span>{formatDate(article.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
