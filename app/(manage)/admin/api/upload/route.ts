import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 生成唯一文件名
    const fileId = "fil-" + randomUUID().replace(/-/g, '').substring(0, 12);
    const ext = path.extname(file.name);
    const fileName = `${fileId}${ext}`;
    
    // 创建目录
    const dir = path.join(process.cwd(), 'content', 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 规范化文件路径
    const filePath = path.join(dir, fileName);
    if (!filePath.startsWith(dir)) {
      return NextResponse.json({ error: '非法文件路径' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // 将文件信息存入数据库
    db.prepare(`
      INSERT INTO images (id, file_name, file_ext, file_size, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      fileId,
      file.name,
      ext,
      file.size,
      new Date().toISOString()
    );

    return NextResponse.json({ 
      url: `/api/images/${fileId}` 
    });

  } catch (error) {
    console.error('上传图片失败:', error);
    return NextResponse.json({ error: '上传图片失败' }, { status: 500 });
  }
}