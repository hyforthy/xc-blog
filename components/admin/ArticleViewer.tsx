"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { Article } from "@/lib/articles";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getManageArticle } from "@/lib/api-client";

export function ArticleViewer({ articleId }: { articleId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getManageArticle(articleId, 0);
        setArticle(data);
      } catch (error) {
        console.error("获取文章失败:", error);
        setError("获取文章失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    router.push(`?${params.toString()}`);
  };

  if (loading)
    return (
      <div className="inset-0 flex justify-center pt-25 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full rounded-full border-4 border-blue-100"></div>
          <div className="absolute w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  if (error) return <div className="text-red-500 py-4">{error}</div>;
  if (!article) return <div className="py-4">文章不存在</div>;

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={handleBack}
        className="h-8 has-[>svg]:pl-1 gap-1"
      >
        <ChevronLeft className="h-3 w-3" />
        返回列表
      </Button>

      <div className="prose max-w-none dark:prose-invert">
        <h1 className="mb-2">{article.title}</h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 not-prose">
          <span>{formatDate(article.updatedAt)}</span>
          {article.category && (
            <Badge
              variant="secondary"
              className="text-xs bg-neutral-200 dark:bg-neutral-800"
            >
              {article.category}
            </Badge>
          )}
          <div>|</div>
          {article.tags && article.tags.length > 0 && (
            <span className="flex gap-1">
              {article.tags.map((tag, index) => (
                <Badge key={`tag-${index}`} variant="outline">
                  {tag}
                </Badge>
              ))}
            </span>
          )}
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: article.content ? article.content : "",
          }}
        />
      </div>
    </div>
  );
}

export default ArticleViewer;
