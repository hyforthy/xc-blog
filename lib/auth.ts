import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'Uiisdsfasdfsadfa23894MNRDPLAWsfqwczvhoa913758234OOKDPPsjjsay')


// 签发 JWT（如果你有登录接口）
export async function signJWT(payload: Record<string, string>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(SECRET);
}

// 验证 JWT
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256'], 
    });
    return payload
  } catch (error) {
    console.error('Token verification failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return null
  }
}

export async function authRequest(req: NextRequest) {
   // 直接从cookie获取（可读取HttpOnly cookie）
   const token = req.cookies.get('token')?.value
   if (!token) {
     console.log('No token provided in the request.');
     return false;
   }
 
   const decoded = await verifyJWT(token);
   if (!decoded) {
     console.log('Invalid token provided.');
     return false;
   }
 
   return true;
}