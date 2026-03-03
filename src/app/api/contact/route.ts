import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  locale: z.enum(['en', 'ru']),
})

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 5

  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= maxRequests) {
    return true
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Log the contact form submission (email sending will be added in Task 11)
    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      message: data.message.slice(0, 100),
      locale: data.locale,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
