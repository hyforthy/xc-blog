import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth'; 
import { z } from 'zod'; // 使用 zod 进行输入验证

// 定义请求体的 schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

// 模拟安全的用户验证（实际应使用数据库和哈希）
const validateUser = (username: string, password: string): boolean => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error('服务器配置错误：缺少管理员凭证');
  }

  // 在生产中应使用 bcrypt 或类似库比较哈希密码
  return username === adminUsername && password === adminPassword;
};

// 添加这个函数用于更新token
function updateTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1小时有效期
  });
}

export async function POST(request: Request) {
  try {
    // 解析并验证请求体
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // 验证用户凭证
    const isValid = validateUser(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: '无效的用户名或密码' },
        {
          status: 401,
          headers: {
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
          },
        }
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
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}