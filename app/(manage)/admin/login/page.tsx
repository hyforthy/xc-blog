'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleLogin = async () => {
    // 表单验证
    if (!credentials.username || !credentials.password) {
      toast.error('登录失败', {
        description: '请输入用户名和密码'
      })
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch('/admin/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '登录失败！')
      }
      
      // 登录成功提示
      toast.success('登录成功', {
        description: '正在跳转到管理页面'
      })
      
      // 获取来源页面或使用默认/admin
      const from = searchParams.get('from') || '/admin'
      router.push(from)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      toast.error('登录失败', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 处理回车键提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <main className="flex-1 w-full">
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-center">登录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="用户名"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="密码"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          <Button 
            className="w-full" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </CardContent>
      </Card>
    </div>
    </main>
  )
}