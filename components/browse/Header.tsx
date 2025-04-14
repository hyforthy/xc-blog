"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFeatherAlt,
  faBars,
  faSun,
  faMoon,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { usePathname, useSearchParams } from "next/navigation";

interface HeaderProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const navItemBaseStyles = {
  normal: "hover:text-primary dark:hover:text-primary-dark transition-colors",
  active: "text-[#111827] dark:text-[#e5e7eb] font-bold underline",
  tech: "text-primary dark:text-primary-dark font-bold",
};

interface NavItem {
  id: string;
  title: string;
  href: string;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loadingNav, setLoadingNav] = useState(true);

  // 获取导航项
  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const response = await fetch("/api/navigation");
        if (!response.ok) throw new Error("获取导航项失败");
        const data = await response.json();
        setNavItems(data);
      } catch (error) {
        console.error("获取导航项失败:", error);
      } finally {
        setLoadingNav(false);
      }
    };

    fetchNavItems();
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // 控制body滚动
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

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-background dark:bg-background-dark shadow-header dark:shadow-header-dark z-10">
        <nav className="max-w-4xl  mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-primary dark:text-primary-dark font-bold text-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faFeatherAlt} />
            <span>Learn&Share</span>
          </Link>

          {/* 桌面端导航 */}
          <NavigationMenu.Root className="hidden md:block">
            <NavigationMenu.List className="flex space-x-6 text-secondary dark:text-secondary-dark">
              {loadingNav ? (
                <div></div>
              ) : (
                navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname === "/" && currentCategory === item.id);
                  const baseStyle = navItemBaseStyles.normal;
                  return (
                    <NavigationMenu.Item key={item.id}>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={item.href}
                          className={
                            isActive
                              ? `${baseStyle} ${navItemBaseStyles.active}`
                              : baseStyle
                          }
                        >
                          {item.title}
                        </Link>
                      </NavigationMenu.Link>
                    </NavigationMenu.Item>
                  );
                })
              )}
            </NavigationMenu.List>
          </NavigationMenu.Root>

          {/* 主题切换和移动端菜单按钮 */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* 关于链接 - 桌面端显示 */}
              <Link
                href="/about"
                title="关于"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center text-primary dark:text-primary-dark text-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </Link>

              <FontAwesomeIcon
                icon={theme === "light" ? faSun : faMoon}
                className="text-primary dark:text-primary-dark text-xl cursor-pointer"
                onClick={toggleTheme}
                aria-label="切换主题"
              />
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-primary dark:text-primary-dark text-xl cursor-pointer ml-4"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </nav>
      </header>

      {/* 移动端菜单 - 简化版，不使用NavigationMenu组件 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-9 pt-16 bg-background dark:bg-background-dark overflow-y-auto md:hidden">
          <div className="px-6 py-4 space-y-2">
            {loadingNav ? (
              <div>加载中...</div>
            ) : (
              navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (pathname === "/" && currentCategory === item.id);
                const baseStyle = navItemBaseStyles.normal;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block py-3 ${
                      isActive
                        ? `${baseStyle} ${navItemBaseStyles.active}`
                        : baseStyle
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
