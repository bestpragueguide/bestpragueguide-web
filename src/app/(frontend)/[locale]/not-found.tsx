import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-6xl font-heading font-bold text-navy mb-4">
        404
      </h1>
      <p className="text-lg text-gray mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/en"
          className="px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
        >
          Go to Homepage
        </Link>
        <Link
          href="/en/tours"
          className="px-6 py-3 border border-navy text-navy font-medium rounded-lg hover:bg-navy hover:text-white transition-colors"
        >
          Browse Tours
        </Link>
      </div>
    </div>
  )
}
