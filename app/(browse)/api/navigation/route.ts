import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/categories-tags';

export async function GET() {
  try {
    // 获取分类数据
    const categories = await getCategories();

    // 构建导航项
    const navItems = Object.entries(categories).map(([id, name]) => ({
      id,
      title: name,
      href: `/?category=${id}`
    }));

    return NextResponse.json(navItems);
  } catch (error) {
    console.error('获取导航项失败:', error);
    return NextResponse.json(
      { error: '获取导航项失败' },
      { status: 500 }
    );
  }
}