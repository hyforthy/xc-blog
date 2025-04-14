'use client';

import { usePathname, redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    // 获取当前路径，跳转到登录页面并传递 `from` 参数
    redirect(`/login?from=${encodeURIComponent(pathname)}`);
  }, [pathname]);

  return null;
}
