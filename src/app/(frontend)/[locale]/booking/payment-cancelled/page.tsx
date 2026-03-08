import { getTranslations } from 'next-intl/server'

export default async function PaymentCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const t = await getTranslations('Booking')
  const { ref } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4 py-20">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">↩️</div>
        <h1 className="font-cormorant text-4xl font-semibold text-navy mb-4">
          {t('payment.cancelledTitle')}
        </h1>
        <p className="text-gray-600 mb-4 leading-relaxed">{t('payment.cancelledBody')}</p>
        {ref && (
          <p className="text-sm text-gray-400">{t('payment.reference')}: <strong>{ref}</strong></p>
        )}
      </div>
    </main>
  )
}
