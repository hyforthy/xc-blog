'use client'

import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>}>
      <LoginForm />
    </Suspense>
  )
}