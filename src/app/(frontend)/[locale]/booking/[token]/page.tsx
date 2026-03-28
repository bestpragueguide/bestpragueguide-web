export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/cms-data'
import { SafeRichText } from '@/components/shared/SafeRichText'
import { formatAmount, type Currency } from '@/lib/currency'
import { hoursLabel, guestsLabel } from '@/lib/plurals'
import { BookingPaymentButton } from '@/components/booking/BookingPaymentButton'
import { BookingPageTracker } from '@/components/booking/BookingPageTracker'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}): Promise<Metadata> {
  return {
    title: 'Your Booking — Best Prague Guide',
    robots: { index: false, follow: false },
  }
}

interface BookingDoc {
  id: number
  requestRef: string
  status: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerLanguage: string
  preferredDate: string
  preferredTime?: string
  guests: number
  totalPrice?: number
  currency?: string
  specialRequests?: unknown
  offerToken: string
  offerExpiresAt?: string
  confirmedDate?: string
  confirmedTime?: string
  confirmedPrice?: number
  confirmedGuests?: number
  guideName?: string
  guidePhone?: string
  meetingPointAddress?: string
  meetingPointInstructions?: unknown
  meetingPointMapUrl?: string
  customerNotes?: unknown
  paymentMethod?: string
  customDepositAmount?: number
  paymentStatus?: string
  depositAmount?: number
  cashBalance?: number
  paidAt?: string
  totalPaid?: number
  balanceDue?: number
  stripePaymentLink?: string
  tour: {
    id: number
    title: string
    slug: string
    duration: number
    heroImage?: {
      url?: string
      alt?: string
      sizes?: {
        card?: { url?: string }
        hero?: { url?: string }
      }
    } | number
    meetingPoint?: {
      address?: string
      instructions?: unknown
      mapUrl?: string
    }
  } | number
}

async function getBooking(token: string, locale: string): Promise<BookingDoc | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'booking-requests',
      where: { offerToken: { equals: token } },
      depth: 2,
      locale: locale as 'en' | 'ru',
      limit: 1,
    })
    return (result.docs[0] as unknown as BookingDoc) || null
  } catch {
    return null
  }
}

function formatDate(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatShortDate(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

type OfferStatus =
  | 'expired'
  | 'declined'
  | 'cancelled'
  | 'pending'
  | 'confirmed_payment_required'
  | 'confirmed_no_prepayment'
  | 'payment_pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'completed'

function getOfferStatus(booking: BookingDoc): OfferStatus {
  // Check expiry
  if (booking.offerExpiresAt) {
    const expiry = new Date(booking.offerExpiresAt)
    if (expiry < new Date()) return 'expired'
  }

  if (booking.status === 'declined') return 'declined'
  if (booking.status === 'cancelled') return 'cancelled'
  if (booking.status === 'no-show') return 'completed'
  if (booking.status === 'completed') return 'completed'

  if (booking.paymentStatus === 'fully_paid') return 'fully_paid'
  if (booking.paymentStatus === 'deposit_paid') return 'deposit_paid'

  if (
    booking.paymentStatus === 'link_sent' ||
    booking.status === 'offer-sent'
  ) {
    return 'payment_pending'
  }

  if (booking.status === 'confirmed') {
    const pm = String(booking.paymentMethod || 'stripe_deposit')
    if (pm === 'cash_only' || pm === 'none') return 'confirmed_no_prepayment'
    return 'confirmed_payment_required'
  }

  // Status is 'new' or other — booking not yet confirmed
  return 'pending'
}

function getStatusBanner(
  status: OfferStatus,
  t: (key: string) => string,
  cmsConfirmedMessage?: string,
): { bg: string; text: string; message: string } {
  switch (status) {
    case 'pending':
      return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        message: t('statusPending') || 'We received your request and will get back to you shortly.',
      }
    case 'confirmed_payment_required':
      return {
        bg: 'bg-gold/10 border-gold/30',
        text: 'text-gold',
        message: cmsConfirmedMessage || `${t('statusConfirmed')} ${t('statusPaymentPending')}`,
      }
    case 'confirmed_no_prepayment':
      return {
        bg: 'bg-trust/10 border-trust/30',
        text: 'text-trust',
        message: t('statusConfirmed'),
      }
    case 'payment_pending':
      return {
        bg: 'bg-gold/10 border-gold/30',
        text: 'text-gold',
        message: t('statusPaymentPending'),
      }
    case 'deposit_paid':
      return {
        bg: 'bg-trust/10 border-trust/30',
        text: 'text-trust',
        message: t('statusDepositPaid'),
      }
    case 'fully_paid':
      return {
        bg: 'bg-trust/10 border-trust/30',
        text: 'text-trust',
        message: t('statusFullyPaid'),
      }
    case 'completed':
      return {
        bg: 'bg-gray-100 border-gray-300',
        text: 'text-gray-600',
        message: t('statusCompleted'),
      }
    case 'declined':
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        message: t('statusDeclined'),
      }
    case 'cancelled':
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        message: t('statusCancelled') || 'This booking has been cancelled.',
      }
    case 'expired':
      return {
        bg: 'bg-gray-100 border-gray-300',
        text: 'text-gray-600',
        message: t('statusExpired'),
      }
  }
}

export default async function BookingOfferPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params
  const booking = await getBooking(token, locale)

  if (!booking) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'bookingOffer' })
  const siteSettings = await getSiteSettings(locale)

  const offerStatus = getOfferStatus(booking)
  const banner = getStatusBanner(offerStatus, t, siteSettings.bookingPageConfirmedMessage)

  // Resolve tour data
  const tour = typeof booking.tour === 'object' ? booking.tour : null
  const tourTitle = tour?.title || ''
  const tourDuration = tour?.duration || 0

  // Hero image
  const heroImage = tour && typeof tour.heroImage === 'object' ? tour.heroImage : null
  const heroImageUrl = heroImage?.sizes?.card?.url || heroImage?.url || null

  // Dates and times
  const displayDate = booking.confirmedDate || booking.preferredDate
  const displayTime = booking.confirmedTime || booking.preferredTime
  const displayGuests = booking.confirmedGuests || booking.guests
  const displayPrice = booking.confirmedPrice || booking.totalPrice || 0

  // Meeting point: use booking-specific or fall back to tour default
  const meetingAddress =
    booking.meetingPointAddress ||
    (tour?.meetingPoint?.address)
  const meetingInstructions =
    booking.meetingPointInstructions ||
    (tour?.meetingPoint?.instructions)
  const meetingMapUrl = booking.meetingPointMapUrl || tour?.meetingPoint?.mapUrl

  // Payment logic
  const paymentMethod = booking.paymentMethod || 'stripe_deposit'
  const defaultDepositPercent = 30 // fallback if PaymentConfig not available
  const depositAmount = booking.depositAmount || booking.customDepositAmount || Math.round(displayPrice * defaultDepositPercent / 100)
  const cashBalance = booking.cashBalance || (displayPrice - depositAmount)
  const bkPaymentStatus = String(booking.paymentStatus ?? '')
  const isPaid = bkPaymentStatus === 'deposit_paid' || bkPaymentStatus === 'fully_paid'
  const totalPaid = booking.totalPaid || 0
  const balanceDue = booking.balanceDue ?? (displayPrice - totalPaid)




  // Show payment when: stripe method, not fully paid, balance > 0, and booking is active
  const hasBalanceDue = balanceDue > 0.01
  const showPaymentSection =
    paymentMethod !== 'none' &&
    paymentMethod !== 'cash_only' &&
    hasBalanceDue &&
    offerStatus !== 'pending' &&
    offerStatus !== 'declined' &&
    offerStatus !== 'cancelled' &&
    offerStatus !== 'expired' &&
    offerStatus !== 'completed'

  // Determine payment amount — use balance due if there's a prior payment (price change scenario)
  const paymentAmount = totalPaid > 0
    ? Math.round(balanceDue)
    : paymentMethod === 'stripe_full' ? displayPrice : depositAmount
  const paymentLabel = totalPaid > 0
    ? t('payNow')
    : paymentMethod === 'stripe_full' ? t('payNow') : t('payDeposit')

  // Show meeting point and guide after payment, or if cash/none
  const showPostPaymentDetails =
    isPaid ||
    paymentMethod === 'cash_only' ||
    paymentMethod === 'none' ||
    offerStatus === 'completed'

  // Expired page
  if (offerStatus === 'expired') {
    return (
      <div className="min-h-screen bg-cream">
        <BookingPageTracker offerToken={token} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-navy mb-4">
            {t('statusExpired')}
          </h1>
          <p className="text-navy/70 mb-8">{t('expired')}</p>
          <a
            href={`https://wa.me/${siteSettings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-trust text-white rounded-lg font-medium hover:bg-trust/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <BookingPageTracker offerToken={token} />
      {/* Status Banner */}
      <div className={`border-b ${banner.bg}`}>
        <div className="max-w-3xl mx-auto px-4 py-4 text-center">
          <p className={`font-medium ${banner.text}`}>{banner.message}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Tour Summary Card */}
        <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm overflow-hidden">
          {heroImageUrl && (
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <Image
                src={heroImageUrl}
                alt={heroImage?.alt || tourTitle}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
              {tourTitle}
            </h1>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs text-navy/50 uppercase tracking-wide">
                  {t('date')}
                </span>
                <span className="block text-sm font-medium text-navy mt-1">
                  {formatDate(displayDate, locale)}
                </span>
              </div>
              {displayTime && (
                <div>
                  <span className="block text-xs text-navy/50 uppercase tracking-wide">
                    {t('time')}
                  </span>
                  <span className="block text-sm font-medium text-navy mt-1">
                    {displayTime}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-xs text-navy/50 uppercase tracking-wide">
                  {t('guests')}
                </span>
                <span className="block text-sm font-medium text-navy mt-1">
                  {displayGuests} {guestsLabel(displayGuests, locale)}
                </span>
              </div>
              {tourDuration > 0 && (
                <div>
                  <span className="block text-xs text-navy/50 uppercase tracking-wide">
                    {t('duration')}
                  </span>
                  <span className="block text-sm font-medium text-navy mt-1">
                    {tourDuration} {hoursLabel(tourDuration, locale)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-navy mb-4">
            {t('bookingRef')}: {booking.requestRef}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-navy/70">{booking.customerName}</span>
              <span className="text-navy/70 break-all">{booking.customerEmail}</span>
            </div>

            <hr className="border-gray-light/50" />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-navy/70">{t('total')}</span>
                <span className="font-semibold text-navy">
                  {formatAmount(displayPrice, (booking.currency || 'EUR') as Currency)}
                </span>
              </div>
              {paymentMethod === 'stripe_deposit' && depositAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy/70">{t('deposit')}</span>
                    <span className="font-medium text-navy">
                      {formatAmount(depositAmount, (booking.currency || 'EUR') as Currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy/70">{t('cashBalance')}</span>
                    <span className="font-medium text-navy">
                      {formatAmount(cashBalance, (booking.currency || 'EUR') as Currency)}
                    </span>
                  </div>
                </>
              )}
              {bkPaymentStatus && bkPaymentStatus !== 'not_required' && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-light/30">
                  <span className="text-navy/70">{locale === 'ru' ? 'Статус оплаты' : 'Payment Status'}</span>
                  <span className={`font-medium ${isPaid ? 'text-trust' : bkPaymentStatus === 'refunded' || bkPaymentStatus === 'refund_pending' ? 'text-navy/70' : 'text-gold'}`}>
                    {bkPaymentStatus === 'fully_paid' ? (locale === 'ru' ? 'Оплачено' : 'Paid')
                      : bkPaymentStatus === 'deposit_paid' ? (locale === 'ru' ? 'Депозит оплачен' : 'Deposit paid')
                      : bkPaymentStatus === 'refunded' ? (locale === 'ru' ? 'Возврат произведён' : 'Refunded')
                      : bkPaymentStatus === 'refund_pending' ? (locale === 'ru' ? 'Возврат в обработке' : 'Refund pending')
                      : bkPaymentStatus === 'link_sent' ? (locale === 'ru' ? 'Ссылка отправлена' : 'Payment link sent')
                      : bkPaymentStatus === 'awaiting' ? (locale === 'ru' ? 'Ожидает оплаты' : 'Awaiting payment')
                      : ''}
                  </span>
                </div>
              )}
              {totalPaid > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-light/30">
                  <span className="text-navy/70">{locale === 'ru' ? 'Оплачено' : 'Amount paid'}</span>
                  <span className="font-medium text-trust">
                    {formatAmount(totalPaid, (booking.currency || 'EUR') as Currency)}
                  </span>
                </div>
              )}
              {totalPaid > 0 && balanceDue > 0.01 && (
                <div className="flex justify-between text-sm">
                  <span className="text-navy/70">{locale === 'ru' ? 'К оплате' : 'Balance due'}</span>
                  <span className="font-medium text-gold">
                    {formatAmount(Math.round(balanceDue), (booking.currency || 'EUR') as Currency)}
                  </span>
                </div>
              )}
              {totalPaid > 0 && balanceDue < -0.01 && (
                <div className="flex justify-between text-sm">
                  <span className="text-navy/70">{locale === 'ru' ? 'Возврат' : 'Refund'}</span>
                  <span className="font-medium text-navy/70">
                    {formatAmount(Math.round(Math.abs(balanceDue)), (booking.currency || 'EUR') as Currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {showPaymentSection && paymentAmount > 0 && (
          <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
            <BookingPaymentButton
              offerToken={token}
              amount={paymentAmount}
              currency={(booking.currency || 'EUR') as string}
              label={paymentLabel}
              locale={locale}
            />
          </div>
        )}

        {/* Payment Received */}
        {isPaid ? (
          <div className="bg-trust/5 rounded-xl border border-trust/20 p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-trust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-trust">{t('paymentReceived')}</p>
              {booking.paidAt ? (
                <p className="text-sm text-navy/60 mt-0.5">
                  {t('paidOn')} {formatShortDate(booking.paidAt, locale)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Cash Payment Note */}
        {paymentMethod === 'cash_only' && offerStatus !== 'completed' && (
          <div className="bg-gold/5 rounded-xl border border-gold/20 p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-navy/80">{siteSettings.bookingPageCashNote || t('cashPaymentNote')}</p>
            </div>
          </div>
        )}

        {/* Meeting Point */}
        {showPostPaymentDetails && meetingAddress && (
          <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
            <h2 className="text-lg font-heading font-bold text-navy mb-4">
              {t('meetingPoint')}
            </h2>
            <p className="text-sm text-navy/80 mb-3">{meetingAddress}</p>
            {meetingInstructions != null ? (
              <SafeRichText
                data={meetingInstructions}
                className="text-sm text-navy/70 mb-4"
              />
            ) : null}
            {meetingMapUrl && (
              <a
                href={meetingMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('getDirections')}
              </a>
            )}
          </div>
        )}

        {/* Guide Contact */}
        {showPostPaymentDetails && booking.guideName && (
          <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
            <h2 className="text-lg font-heading font-bold text-navy mb-4">
              {t('yourGuide')}
            </h2>
            <p className="font-medium text-navy">{booking.guideName}</p>
            {booking.guidePhone && (
              <div className="mt-2 flex items-center gap-3">
                <a
                  href={`https://wa.me/${booking.guidePhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-trust font-medium hover:text-trust/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${booking.guidePhone}`}
                  className="text-sm text-navy/70 hover:text-navy transition-colors"
                >
                  {booking.guidePhone}
                </a>
              </div>
            )}
            <p className="text-xs text-navy/50 mt-3">{t('guideWillContact')}</p>
          </div>
        )}

        {/* Customer Notes */}
        {booking.customerNotes != null ? (
          <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
            <h2 className="text-lg font-heading font-bold text-navy mb-4">
              {t('importantInfo')}
            </h2>
            <SafeRichText
              data={booking.customerNotes}
              className="text-sm text-navy/80 prose prose-sm max-w-none"
            />
          </div>
        ) : null}

        {/* Contact Help */}
        <div className="bg-white rounded-xl border border-gray-light/50 shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-navy mb-2">
            {t('needHelp')}
          </h2>
          <p className="text-sm text-navy/60 mb-4">{siteSettings.bookingPageContactNote || t('contactNote')}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-trust text-white rounded-lg text-sm font-medium hover:bg-trust/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy/5 text-navy rounded-lg text-sm font-medium hover:bg-navy/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {siteSettings.contactEmail}
            </a>
            <a
              href={`tel:${siteSettings.contactPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy/5 text-navy rounded-lg text-sm font-medium hover:bg-navy/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {siteSettings.contactPhoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
