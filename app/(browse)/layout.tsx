"use client";

import { useState } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import Header from "@/components/browse/Header";
import Footer from "@/components/browse/Footer";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <html lang="zh-CN">
      <body
        className={`${
          inter.className
        } flex flex-col min-h-screen transition-colors duration-200 ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <Suspense
          fallback={
            <div className="bg-background dark:bg-background-dark h-16"></div>
          }
        >
          <Header theme={theme} setTheme={setTheme} />
        </Suspense>
        <main className="flex-1 bg-background dark:bg-background-dark">
          <div className="max-w-4xl mx-auto px-2 pt-20 pb-12">
            <div className="bg-card rounded-lg shadow-lg p-4 md:p-6">
              {children}
            </div>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
