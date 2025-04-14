"use client";

import { useState } from "react";
import Link from "next/link";
import { SmartPagination } from "@/components/ui/smart-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import type { Article } from "@/lib/articles";
import { deleteManageArticle } from "@/lib/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  LayoutList,
  Table as TableIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ArticleListProps {
  articles: Article[];
  currentPage: number;
  totalItems: number;
}

export function ArticleList({
  articles,
  currentPage,
  totalItems,
}: ArticleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const handleDelete = async (id: string) => {
    try {
      setSelectedArticleId(id);
      setIsDeleting(true);
      await deleteManageArticle(id);
      router.refresh();
    } catch (error) {
      console.error("删除文章失败:", error);
    } finally {
      setIsDeleting(false);
      setSelectedArticleId(null);
    }
  };

  // 修改查看按钮处理
  function handleView(id: string) {
    const params = new URLSearchParams(searchParams);
    params.set("view", id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">文章列表</h2>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "card" | "table")
            }
          >
            <ToggleGroupItem value="card" aria-label="卡片视图">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="表格视图">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Link href="/admin/articles/new">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              新建文章
            </Button>
          </Link>
        </div>
      </div>

      {/* 文章列表内容 */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <p className="mb-4 text-muted-foreground">暂无文章</p>
          <Link href="/admin/articles/new">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              创建第一篇文章
            </Button>
          </Link>
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between p-4 dark:shadow-gray-700 shadow-sm rounded-lg  transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{article.title}</h3>
                  {article.category && (
                    <Badge variant="outline">{article.category}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(article.updatedAt)}
                  {article.tags && article.tags.length > 0 && (
                    <>
                      <span className="mx-1">·</span>
                      <span>
                        {typeof article.tags === "string"
                          ? article.tags
                          : article.tags.join(", ")}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(article.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Link href={`/admin/articles/edit?id=${article.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        您确定要删除文章 &quot;{article.title}&quot;
                        吗？此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.id)}
                        disabled={
                          isDeleting && selectedArticleId === article.id
                        }
                      >
                        {isDeleting && selectedArticleId === article.id
                          ? "删除中..."
                          : "确认删除"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 表格视图保持不变
        <div className="shadow-sm dark:shadow-gray-700 rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    {article.category && (
                      <Badge variant="outline">{article.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {article.tags && article.tags.length > 0 && (
                      <span className="text-sm">
                        {typeof article.tags === "string"
                          ? article.tags
                          : article.tags.join(", ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(article.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(article.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/articles/edit?id=${article.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              您确定要删除文章 &quot;{article.title}&quot;
                              吗？此操作不可撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.id)}
                              disabled={
                                isDeleting && selectedArticleId === article.id
                              }
                            >
                              {isDeleting && selectedArticleId === article.id
                                ? "删除中..."
                                : "确认删除"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {articles.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          showTotal={true}
          showQuickJumper={true}
          showSizeChanger={false}
          className="mt-8"
        />
      )}
    </div>
  );
}

export default ArticleList;
