'use client'

import { useParams } from 'next/navigation'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useParams<{ locale: string }>()
  const isRu = locale === 'ru'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-4xl font-heading font-bold text-navy mb-4">
        {isRu ? 'Что-то пошло не так' : 'Something went wrong'}
      </h1>
      <p className="text-lg text-gray mb-8">
        {isRu
          ? 'Произошла ошибка. Пожалуйста, попробуйте ещё раз.'
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
      >
        {isRu ? 'Попробовать снова' : 'Try Again'}
      </button>
    </div>
  )
}
