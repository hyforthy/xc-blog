import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    
    // 读取文件索引
    const indexPath = path.join(process.cwd(), 'content', 'images-index.json');
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
    }
    
    // 解析文件索引
    const fileIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // 查找文件信息
    const fileInfo = fileIndex[fileId];
    if (!fileInfo) {
      return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
    }
    
    // 构建完整文件路径
    const filePath = path.join(process.cwd(), 'content', 'images', `${fileId}${fileInfo.ext}`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
    }

    // 读取文件内容
    const file = fs.readFileSync(filePath);
    
    // 根据文件扩展名设置正确的Content-Type
    const ext = fileInfo.ext.toLowerCase();
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