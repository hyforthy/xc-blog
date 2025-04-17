import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth'; 
import { z } from 'zod'; // 使用 zod 进行输入验证
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { limiter } from '@/lib/rate-limit';
// 定义请求体的 schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});



// 添加这个函数用于更新token
function updateTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 900, // 15分钟有效期
  });
}

// 修改验证用户函数
const validateUser = async (username: string, password: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    // 检查尝试次数
    const { success, remaining, remainingMinutes } = limiter.check(5, username);
    if (!success) {
      return { 
        valid: false, 
        error: `尝试次数过多，请${remainingMinutes}分钟后再试` 
      };
    }

    const user = db.prepare(`
      SELECT password_hash FROM users 
      WHERE username = ?
    `).get(username) as { password_hash: string } | undefined;

    if (!user) {
      return { 
        valid: false, 
        error: `无效的用户名或密码，剩余尝试次数: ${remaining}次` 
      };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return { 
        valid: false, 
        error: `无效的用户名或密码，剩余尝试次数: ${remaining}次` 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('验证用户失败:', error);
    return { valid: false, error: '登录失败，请稍后再试' };
  }
};

// 修改POST函数
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const { valid, error } = await validateUser(username, password);
    if (!valid) {
      return NextResponse.json(
        { error: error || '无效的用户名或密码' },
        { status: 401}
      );
    }

    // 生成 JWT 令牌
    const token = await signJWT({ username });
    
    // 创建响应
    const response = NextResponse.json({ msg: "success" }, { status: 200 });

    // 设置安全的 Cookie
    updateTokenCookie(response, token);
    
    // 添加安全头
    response.headers.set('Content-Security-Policy', "default-src 'self'");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    // 处理解析错误或验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求格式错误', details: error.errors },
        { status: 400 }
      );
    }
    // 处理其他异常
    console.error('登录错误:', error);

    return NextResponse.json(
      { error: '认证失败' }, // 通用错误信息
      { status: 401 }
    );
  }
}

// 模拟安全的用户验证（实际应使用数据库和哈希）
// const validateUserReserve = (username: string, password: string): boolean => {
//   const adminUsername = process.env.ADMIN_USERNAME;
//   const adminPassword = process.env.ADMIN_PASSWORD;

//   if (!adminUsername || !adminPassword) {
//     throw new Error('服务器配置错误：缺少管理员凭证');
//   }

//   // 在生产中应使用 bcrypt 或类似库比较哈希密码
//   return username === adminUsername && password === adminPassword;
// };