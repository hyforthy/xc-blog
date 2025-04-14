import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';

export async function GET(
  request: Request, 
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const fileId = (await params).id;
    
    // 从数据库获取文件信息
    const fileInfo = db.prepare(`
      SELECT file_name, file_ext, file_size 
      FROM images 
      WHERE id = ?
    `).get(fileId) as {file_name: string, file_ext: string, file_size: number} | undefined;

    if (!fileInfo) {
      return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
    }
    
    // 构建完整文件路径
    const filePath = path.join(process.cwd(), 'content', 'images', `${fileId}${fileInfo.file_ext}`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
    }

    // 读取文件内容
    const file = fs.readFileSync(filePath);
    
    // 根据文件扩展名设置正确的Content-Type
    const ext = fileInfo.file_ext.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000' // 缓存一年
      }
    });

  } catch (error) {
    console.error('获取图片失败:', error);
    return NextResponse.json({ error: '获取图片失败' }, { status: 500 });
  }
}