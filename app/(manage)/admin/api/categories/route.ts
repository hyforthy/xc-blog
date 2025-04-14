import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { authRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuth = await authRequest(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const filePath = path.join(process.cwd(), 'content', 'categories.json');
    const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await authRequest(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { operation, data } = await request.json();
    const filePath = path.join(process.cwd(), 'content', 'categories.json');
    
    // 读取现有分类
    const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (operation === 'update') {
      // 检查分类ID是否存在
      if (!categories[data.id]) {
        return NextResponse.json(
          { error: '分类ID不存在' },
          { status: 400 }
        );
      }
      categories[data.id] = data.name;
      fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
      return NextResponse.json({ success: true });
    } else if (operation === 'create') {
      // 检查分类名是否已存在
      if (Object.values(categories).includes(data.name)) {
        return NextResponse.json(
          { error: '分类名称已存在' },
          { status: 400 }
        );
      }
      const newId = randomUUID().replace(/-/g, '').substring(0, 12);
      categories[newId] = data.name;
      fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
      return NextResponse.json({ success: true, newId });
    }
    return NextResponse.json({ error: '非法操作' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: '保存分类失败' },
      { status: 500 }
    );
  }
}