import { NextRequest, NextResponse } from 'next/server'
import { authRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 添加缓存控制头
    const headers = new Headers()
    headers.set('Cache-Control', 'no-store, max-age=0')
    
    const isAuth = await authRequest(request)
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { 
          status: 401,
          headers  // 添加响应头
        }
      )
    }
    return NextResponse.json(
      { 
        authenticated: true,
        timestamp: new Date().toISOString() 
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}