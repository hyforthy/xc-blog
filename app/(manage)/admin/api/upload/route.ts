import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 生成唯一文件名
    const fileId = uuidv4().replace(/-/g, '').substring(0, 12);
    const ext = path.extname(file.name);
    const fileName = `${fileId}${ext}`;
    
    // 创建目录
    const dir = path.join(process.cwd(), 'content', 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(dir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // 更新文件索引
    const indexPath = path.join(process.cwd(), 'content', 'images-index.json');
    let fileIndex: { [key: string]: FileInfo } = {};
    // 如果索引文件存在，读取现有索引
    if (fs.existsSync(indexPath)) {
      try {
        fileIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      } catch (err) {
        console.error('读取图片索引失败:', err);
      }
    }
    
    // 添加新文件信息到索引
    fileIndex[fileId] = {
      ext: ext,
      originalName: file.name,
      uploadTime: new Date().toISOString()
    };
    
    // 保存更新后的索引
    fs.writeFileSync(indexPath, JSON.stringify(fileIndex, null, 2));

    return NextResponse.json({ 
      url: `/api/imgs/${fileId}` 
    });

  } catch (error) {
    console.error('上传图片失败:', error);
    return NextResponse.json({ error: '上传图片失败' }, { status: 500 });
  }
}

interface FileInfo {
  ext: string;
  originalName: string;
  uploadTime: string;
}