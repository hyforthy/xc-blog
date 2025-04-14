import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['fs', 'path'], // 新的配置方式
  /* config options here */
}

export default nextConfig
