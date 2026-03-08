import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Redirect www to non-www
  const host = request.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace(/^www\./, '')
    const baseUrl = `https://${nonWwwHost}`
    const path = request.nextUrl.pathname + request.nextUrl.search
    return NextResponse.redirect(new URL(path, baseUrl), 301)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|admin|tour-order|_next|_vercel|.*\\..*).*)'],
}
