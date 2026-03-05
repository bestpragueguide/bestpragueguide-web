import { getPayload } from 'payload'
import config from '@payload-config'
import { TestimonialSlider } from './TestimonialSlider'

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
        featured: { equals: true },
      },
      limit: 8,
      locale: locale as 'en' | 'ru',
    })
    reviews = result.docs as typeof reviews
  } catch {
    // No reviews yet
  }

  // Fallback: hardcoded placeholder reviews if none exist
  const displayReviews =
    reviews.length > 0
      ? reviews.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          customerCountry: r.customerCountry,
          rating: r.rating,
          body: r.body,
          tourTitle:
            typeof r.tour === 'object' && r.tour ? r.tour.title : undefined,
        }))
      : [
          {
            id: 1,
            customerName: 'Sarah M.',
            customerCountry: 'United States',
            rating: 5,
            body:
              locale === 'ru'
                ? 'Невероятная экскурсия! Ульяна показала нам такие места, которых нет в путеводителях. Лучший гид в Праге!'
                : 'Incredible tour! Uliana showed us places not in any guidebook. Best guide in Prague by far!',
          },
          {
            id: 2,
            customerName: 'James T.',
            customerCountry: 'United Kingdom',
            rating: 5,
            body:
              locale === 'ru'
                ? 'Наша семья в восторге от экскурсии. Гид адаптировала маршрут под наших детей. Незабываемые впечатления!'
                : 'Our family absolutely loved the tour. The guide adapted everything for our kids. An unforgettable experience!',
          },
          {
            id: 3,
            customerName: 'Мария К.',
            customerCountry: 'Россия',
            rating: 5,
            body:
              locale === 'ru'
                ? 'Третий раз заказываем экскурсии у Ульяны. Каждый раз открываем Прагу заново. Профессионализм на высшем уровне.'
                : 'Third time booking tours with Uliana. Each time we discover Prague anew. Professionalism at its finest.',
          },
        ]

  return <TestimonialSlider reviews={displayReviews} heading={heading} />
}
