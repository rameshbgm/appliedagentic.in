// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'
  const isAuthenticated = !!req.auth

  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
