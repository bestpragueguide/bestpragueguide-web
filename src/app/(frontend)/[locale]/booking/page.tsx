import type { Metadata } from 'next'
import { BookingLookupForm } from '@/components/booking/BookingLookupForm'

export const metadata: Metadata = {
  title: 'Find Your Booking — Best Prague Guide',
  robots: { index: false, follow: false },
}

export default async function BookingLookupPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-4 py-16">
        <BookingLookupForm locale={locale} />
      </div>
    </div>
  )
}
