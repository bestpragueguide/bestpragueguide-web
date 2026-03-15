import { getPayload } from 'payload'
import config from '@payload-config'
import { TestimonialSlider } from './TestimonialSlider'
import { extractPlainText } from '@/components/shared/SafeRichText'

interface TestimonialSliderWrapperProps {
  heading: string
  locale: string
}

export async function TestimonialSliderWrapper({ heading, locale }: TestimonialSliderWrapperProps) {
  let reviews: Array<{
    id: number
    customerName: string
    customerCountry?: string | null
    rating: number
    body: string
    tour?: { title?: string } | number
  }> = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'reviews',
      where: {
        status: { equals: 'approved' },
        showOnHomepage: { equals: true },
        language: { equals: locale },
      },
      limit: 8,
      locale: locale as 'en' | 'ru',
    })
    reviews = result.docs as typeof reviews
  } catch {
    // No reviews yet
  }

  if (reviews.length === 0) return null

  const displayReviews = reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    customerCountry: r.customerCountry,
    rating: r.rating,
    body: extractPlainText(r.body),
    tourTitle:
      typeof r.tour === 'object' && r.tour ? r.tour.title : undefined,
  }))

  return <TestimonialSlider reviews={displayReviews} heading={heading} />
}
