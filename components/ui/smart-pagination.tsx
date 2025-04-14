"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./pagination";
import { cn } from "@/lib/utils";

interface SmartPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
  showTotal?: boolean;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

export function SmartPagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  className,
  showTotal = true,
  showQuickJumper = true,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
}: SmartPaginationProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 768px)");

  const totalPages = Math.ceil(totalItems / pageSize);

  const maxVisiblePages = React.useMemo(() => {
    if (isMobile) return 3;
    if (isTablet) return 5;
    return 7;
  }, [isMobile, isTablet]);

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const [jumpPage, setJumpPage] = React.useState("");
  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(jumpPage);
      if (page && page > 0 && page <= totalPages) {
        onPageChange(page);
        setJumpPage("");
      }
    }
  };

  const handlePageSizeChange = (size: number) => {
    onPageChange(1);
    onPageSizeChange?.(size);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        className
      )}
    >
      {showTotal && (
        <div className="text-sm text-muted-foreground">共 {totalPages} 页</div>
      )}

      <div className="flex items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > maxVisiblePages &&
              getPageNumbers().at(-1)! < totalPages && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  onPageChange(Math.min(currentPage + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {showQuickJumper && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleJump}
              className="w-18 h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="页码"
            />
            <span className="text-sm">页</span>
          </div>
        )}

        {showSizeChanger && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm">每页</span>
            <select
              value={pageSize}
              className="h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm">条</span>
          </div>
        )}
      </div>
    </div>
  );
}
