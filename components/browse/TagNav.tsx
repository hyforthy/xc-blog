"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TagNavProps {
  tags: { id: string; name: string }[];
}

export default function TagNav({ tags }: TagNavProps) {
  const searchParams = useSearchParams();
  const currentTagId = searchParams.get("tag");

  return (
    <nav className="overflow-x-auto">
      <div className="flex space-x-2 pb-1">
        {/* 全部文章链接 */}
        <Link
          href="/"
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap
            ${
              !currentTagId
                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          全部文章
        </Link>
        {/* 标签列表 */}
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${encodeURIComponent(tag.id)}`}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap
              ${
                currentTagId === tag.id
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
