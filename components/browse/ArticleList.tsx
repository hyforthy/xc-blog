"use client";

import Link from "next/link";
import { SmartPagination } from "@/components/ui/smart-pagination";
import { useRouter, useSearchParams } from "next/navigation";

import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

interface ArticleListProps {
  articles: Article[];
  currentPage?: number;
  totalItems?: number;
}

export default function ArticleList({
  articles,
  currentPage = 1,
  totalItems = 1,
}: ArticleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="max-w-4xl mx-auto">
      {articles.map((article, index) => (
        <div key={article.id}>
          {index > 0 && (
            <hr className="border-t border-gray-200 dark:border-gray-800 my-8" />
          )}
          <article className="space-y-4">
            <div className="space-y-2">
              <Link href={`/articles/${article.id}`}>
                <h2 className="text-primary dark:text-primary-dark font-bold text-lg md:text-xl leading-tight transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  {article.title}
                </h2>
              </Link>
              {/* 添加可点击的分类信息 */}
              {article.category && (
                <div className="mt-1.5">
                  <Link
                    href={`/?category=${encodeURIComponent(
                      article.categoryId
                    )}`}
                  >
                    <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer inline-block">
                      {article.category}
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <p className="text-base leading-relaxed text-primary dark:text-primary-dark line-clamp-3">
              {article.summary}
            </p>
            <div className="mt-4 text-sm text-secondary dark:text-secondary-dark">
              <div className="space-x-2">
                {article.tags &&
                  article.tags.map((tag, idx) => (
                    <Link
                      key={idx}
                      href={`/?tag=${encodeURIComponent(
                        article.tagsId?.[idx] || ""
                      )}`}
                    >
                      <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-xs hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer inline-block">
                        {tag}
                      </span>
                    </Link>
                  ))}
              </div>
              <div className="flex justify-between mt-4 items-center">
                <span>{formatDate(article.updatedAt)}</span>
                <Link
                  href={`/articles/${article.id}`}
                  className="text-primary dark:text-primary-dark text-sm hover:underline"
                >
                  阅读全文
                </Link>
              </div>
            </div>
          </article>
        </div>
      ))}

      {/* 使用智能分页组件 */}
      <SmartPagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showTotal={true}
        showQuickJumper={true}
        showSizeChanger={false}
        className="mt-8"
      />
    </section>
  );
}
