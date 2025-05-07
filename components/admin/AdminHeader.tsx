"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSun,
  faMoon,
  faFeatherAlt,
  faTimes,
  faNewspaper,
  faTags,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export default function AdminHeader({ theme, setTheme }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // 侧边栏导航项
  // 修改sidebarItems数组
  const sidebarItems = [
    {
      id: "articles",
      title: "文章",
      href: "/admin/articles",
      icon: faNewspaper,
    },
    {
      id: "categories",
      title: "分类",
      href: "/admin/categories",
      icon: faBoxes,
    },
    { id: "tags", title: "标签", href: "/admin/tags", icon: faTags },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-background dark:bg-background-dark z-10">
        <nav className="mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center space-x-2 text-primary dark:text-primary-dark font-bold text-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faFeatherAlt} />
            <span>Learn&Share</span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex space-x-6 text-secondary dark:text-secondary-dark"></div>

          {/* 主题切换和侧边菜单按钮 */}
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon
              icon={theme === "light" ? faSun : faMoon}
              className="text-primary dark:text-primary-dark text-xl cursor-pointer"
              onClick={toggleTheme}
              aria-label="切换主题"
            />
            {/* 修改侧边菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-primary dark:text-primary-dark text-xl cursor-pointer"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </nav>
      </header>

      {/* 侧边栏 */}

      <div
        className={`fixed top-16 left-0 w-full md:w-30 h-[calc(100vh-4rem)] bg-background dark:bg-background-dark transition-all duration-300 z-9
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-full">
          <div className="bg-card rounded-lg shadow-lg h-full">
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center p-3 rounded-lg hover:bg-[#E0E0E0] dark:hover:bg-[#3A3A3A] transition-colors duration-200 select-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="mr-3 text-primary dark:text-primary-dark"
                  />
                  <span className="text-secondary dark:text-secondary-dark">
                    {item.title}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
