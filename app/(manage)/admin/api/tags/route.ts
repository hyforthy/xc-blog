import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { authRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuth = await authRequest(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const filePath = path.join(process.cwd(), 'content', 'tags.json');
    const tags = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await authRequest(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { operation, data } = await request.json();
    const filePath = path.join(process.cwd(), 'content', 'tags.json');
    
    // 读取现有标签
    const tags = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (operation === 'update') {
      if (!tags[data.id]) {
        return NextResponse.json({ error: '标签ID不存在' }, { status: 400 });
      }
      tags[data.id] = data.name;
    } else if (operation === 'create') {
      if (Object.values(tags).includes(data.name)) {
        return NextResponse.json({ error: '标签名称已存在' }, { status: 400 });
      }
      const newId = randomUUID().replace(/-/g, '').substring(0, 12);
      tags[newId] = data.name;
      fs.writeFileSync(filePath, JSON.stringify(tags, null, 2));
      return NextResponse.json({ success: true, newId });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(tags, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '保存标签失败' }, { status: 500 });
  }
}