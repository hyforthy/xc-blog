"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "../../globals.css";
import AdminHeader from "@/components/admin/AdminHeader";
import { Toaster, toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { verifyToken } from "@/lib/auth-client";
import ThemeContext from "./theme-context";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

  // 添加认证检查
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyToken();
      if (!isAuthenticated && pathname !== "/admin/login") {
        // 获取完整路径包括查询参数
        const fullPath = window.location.pathname + window.location.search;
        router.push(`/admin/login?from=${encodeURIComponent(fullPath)}`);
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [pathname, router]);

  // 监听路径变化，如果路径变化了，关闭所有 toast
  useEffect(() => {
    if (prevPathname && prevPathname !== pathname) {
      // 路径已变化，关闭所有 toast
      toast.dismiss();
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  // 控制是否加载父布局
  const isNotLoginLayout = pathname !== "/admin/login";

  let bodyClass = `min-h-screen`; // 默认类名

  if (isNotLoginLayout) {
    bodyClass = `min-h-full w-full m-0 p-0`;
  }
  // 只在非登录页面应用主题类
  const themeClass = isNotLoginLayout && theme === "dark" ? "dark" : "";

  // 在组件返回的JSX中包裹ThemeContext.Provider
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <html lang="zh-CN" className={themeClass}>
        <body
          className={`${inter.className} flex flex-col min-h-screen ${bodyClass}`}
        >
          {/* 加载动画 */}
          {!authChecked ? (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
              <div className="relative w-16 h-16">
                <div className="absolute w-full h-full rounded-full border-4 border-blue-100"></div>
                <div className="absolute w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {isNotLoginLayout ? (
                <>
                  <AdminHeader theme={theme} setTheme={setTheme} />
                  <main
                    className={`flex-1 bg-background dark:bg-background-dark pt-16 transition-all duration-300 md:ml-30 max-md:ml-0`}
                  >
                    <div className="pl-0 md:pl-2 min-h-[calc(100vh-4rem)]">
                      <div className="bg-card rounded-lg shadow-lg p-6 max-md:p-3 min-h-[calc(100vh-4rem)]">
                        {children}
                      </div>
                    </div>
                  </main>
                </>
              ) : (
                <> {children} </>
              )}

              <Toaster
                richColors
                position="top-center"
                closeButton
                duration={pathname !== prevPathname ? 0 : 2000}
              />
            </>
          )}
        </body>
      </html>
    </ThemeContext.Provider>
  );
}
