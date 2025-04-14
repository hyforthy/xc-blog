import { NextResponse } from 'next/server';
import { verifyJWT, signJWT } from '@/lib/auth';
import type { NextRequest } from 'next/server';

// 内存缓存记录更新时间
const tokenUpdateCache = new Map<string, number>();

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 只处理/admin路径下的请求，但排除/admin/login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const response = NextResponse.next();

  if (token) {
    try {     
      const decoded = await verifyJWT(token);
      if (!decoded) {
        return response;
      }
      
      // 从缓存获取上次更新时间
      const lastUpdated = tokenUpdateCache.get(token);
      const now = Date.now();
      
      // 如果超过1分钟才更新
      if (!lastUpdated || (now - lastUpdated) > 60000) {
        const newToken = await signJWT({ 
          username: typeof decoded.username === 'string' ? decoded.username : '' 
        });
        
        response.cookies.set({
          name: 'token',
          value: newToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 3600,
        });
        
        // 更新内存缓存
        tokenUpdateCache.set(newToken, now);
        // 清理旧token记录
        tokenUpdateCache.delete(token);
      }
    } catch {
      // token无效，不做处理
    }
  }

  return response;
}