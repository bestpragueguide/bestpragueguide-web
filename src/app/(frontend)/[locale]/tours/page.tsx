export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/metadata'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { TourFilters } from '@/components/tours/TourFilters'
import { TourGrid } from '@/components/tours/TourGrid'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('toursTitle')
  const description = t('toursDesc')

  return {
    title,
    description,
    ...buildPageMetadata(locale, 'tours', { title, description }),
  }
}

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'categories' })

  let tours: Array<{
    id: number
    title: string
    slug: string
    excerpt: string
    category: string
    subcategory?: string | null
    duration: number
    groupPrice: number
    rating?: number | null
    heroImage?: { url?: string; sizes?: { card?: { url?: string } } } | number
  }> = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tours',
      where: {
        status: { equals: 'published' },
        publishedLocales: { in: [locale] },
      },
      sort: 'sortOrder',
      limit: 50,
      locale: locale as 'en' | 'ru',
    })
    tours = result.docs as typeof tours
  } catch {
    // No tours yet
  }

  // Build filter data from available tours
  const availableCategories = [...new Set(tours.map((t) => t.category))]
  const availableSubcategories = [
    ...new Set(
      tours
        .filter((t) => t.category === 'prague-tours' && t.subcategory)
        .map((t) => t.subcategory!),
    ),
  ]

  const gridTours = tours.map((tour) => {
    const img = typeof tour.heroImage === 'object' && tour.heroImage ? tour.heroImage : null
    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      excerpt: tour.excerpt,
      category: tour.category,
      subcategory: tour.subcategory,
      duration: tour.duration,
      groupPrice: tour.groupPrice,
      rating: tour.rating,
      heroImageUrl: (img as any)?.sizes?.card?.url || img?.url || null,
      mobileImageUrl: (img as any)?.sizes?.mobileCard?.url || null,
      focalPoint: img ? `${(img as any)?.focalX ?? 50}% ${(img as any)?.focalY ?? 50}%` : undefined,
      imageAlt: (img as any)?.alt || undefined,
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          {
            label: locale === 'ru' ? 'Экскурсии' : 'Tours',
          },
        ]}
        locale={locale}
      />

      <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy mb-8">
        {t('all')}
      </h1>

      <Suspense fallback={null}>
        <TourFilters
          availableCategories={availableCategories}
          availableSubcategories={availableSubcategories}
        />
        <TourGrid tours={gridTours} locale={locale} />
      </Suspense>
    </div>
  )
}
