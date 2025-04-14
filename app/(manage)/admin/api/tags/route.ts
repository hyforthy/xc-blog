import { NextRequest, NextResponse } from 'next/server';
import { authRequest } from '@/lib/auth';
import { randomUUID } from 'crypto';
import db from '@/lib/db';

interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  const isAuth = await authRequest(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tags = db.prepare('SELECT * FROM tags ORDER BY updated_at').all() as Tag[];
    
    // 转换为 {id: name} 格式
    const tagMap = tags.reduce((acc, tag) => {
      acc[tag.id] = tag.name;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(tagMap);
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
    const now = new Date().toISOString();

    if (operation === 'update') {
      // 更新标签
      db.prepare(`
        UPDATE tags 
        SET name = ?, updated_at = ?
        WHERE id = ?
      `).run(data.name, now, data.id);
      
      return NextResponse.json({ success: true });
    } else if (operation === 'create') {
      // 检查标签名是否已存在
      const exists = db.prepare(`
        SELECT 1 FROM tags WHERE name = ?
      `).get(data.name);
      
      if (exists) {
        return NextResponse.json(
          { error: '标签名称已存在' },
          { status: 400 }
        );
      }

      const newId = "tag-" + randomUUID().replace(/-/g, '').substring(0, 12);
      db.prepare(`
        INSERT INTO tags (id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(newId, data.name, now, now);
      
      return NextResponse.json({ success: true, newId });
    }
    
    return NextResponse.json({ error: '非法操作' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: '保存标签失败' },
      { status: 500 }
    );
  }
}