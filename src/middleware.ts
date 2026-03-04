import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Redirect www to non-www
  const host = request.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace(/^www\./, '')
    const url = new URL(request.url)
    url.host = nonWwwHost
    return NextResponse.redirect(url, 301)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
