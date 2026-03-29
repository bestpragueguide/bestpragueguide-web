// Booking Updated email — sent when admin clicks Send Update
// All CMS/dangerouslySetInnerHTML content is from trusted admin Payload CMS Lexical editor
import { formatEmailDate } from './utils'
import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components'

interface BookingUpdatedEmailProps {
  customerName: string
  tourName: string
  confirmedDate: string
  confirmedTime: string
  guests: number
  confirmedPrice: number
  currency: string
  requestRef: string
  offerUrl: string
  locale: 'en' | 'ru'
  cmsHeading?: string
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderHtml?: string
  cmsHeaderContent?: string
  cmsFooterHtml?: string
  cmsFooterContent?: string
  summaryLabels?: Record<string, string | undefined>
  summaryPaymentLabels?: Record<string, string | undefined>
  summaryLanguageLabels?: Record<string, string | undefined>
  paymentMethod?: string
  paymentStatus?: string
}

export function BookingUpdatedEmail({
  customerName, tourName, confirmedDate, confirmedTime, guests, confirmedPrice,
  currency = 'EUR', requestRef, offerUrl, locale,
  cmsHeading, cmsBody, cmsNote, cmsFooter,
  cmsHeaderHtml, cmsHeaderContent, cmsFooterHtml, cmsFooterContent,
  summaryLabels: sl, summaryPaymentLabels: spl, summaryLanguageLabels: sll,
  paymentMethod, paymentStatus,
}: BookingUpdatedEmailProps) {
  const isRu = locale === 'ru'
  const L = (key: string, en: string, ru: string) => (sl?.[key]) || (isRu ? ru : en)

  const summaryRows: Array<{ label: string; value: string }> = [
    { label: L('tour', 'Tour', 'Экскурсия'), value: tourName },
    { label: L('date', 'Date', 'Дата'), value: formatEmailDate(confirmedDate, locale) },
    { label: L('time', 'Time', 'Время'), value: confirmedTime },
    { label: L('guests', 'Guests', 'Гостей'), value: String(guests) },
    { label: L('price', 'Price', 'Стоимость'), value: `${confirmedPrice} ${currency}` },
  ]

  if (paymentStatus && paymentStatus !== 'not_required') {
    const psLabels: Record<string, { en: string; ru: string }> = {
      awaiting: { en: 'Awaiting payment', ru: 'Ожидает оплаты' },
      deposit_paid: { en: 'Deposit paid', ru: 'Депозит оплачен' },
      fully_paid: { en: 'Fully paid', ru: 'Полностью оплачено' },
      refunded: { en: 'Refunded', ru: 'Возвращено' },
    }
    const psLabel = psLabels[paymentStatus]
    if (psLabel) summaryRows.push({ label: isRu ? 'Статус оплаты' : 'Payment Status', value: isRu ? psLabel.ru : psLabel.en })
  }

  if (paymentMethod) {
    const pmValue = paymentMethod === 'cash_only'
      ? (spl?.cash || (isRu ? 'Наличными в день экскурсии' : 'Cash on tour day'))
      : paymentMethod === 'stripe_full'
        ? (spl?.cardFull || (isRu ? 'Картой (полная оплата)' : 'Credit card (full prepayment)'))
        : paymentMethod === 'stripe_deposit'
          ? (spl?.card || (isRu ? 'Картой (предоплата)' : 'Credit card (deposit)'))
          : paymentMethod
    summaryRows.push({ label: L('payment', 'Payment', 'Оплата'), value: pmValue })
  }

  summaryRows.push({ label: L('language', 'Language', 'Язык'), value: isRu ? (sll?.ru || 'Русский') : (sll?.en || 'English') })
  summaryRows.push({ label: L('reference', 'Reference', 'Номер заявки'), value: requestRef })

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{isRu ? `Обновление бронирования — ${tourName}` : `Booking update — ${tourName}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderHtml ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderHtml }} /> : cmsHeaderContent ? <div style={logoS} dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} /> : <Text style={logoS}>Best Prague Guide</Text>}
          <Hr style={hr} />
          <Text style={headingS}>{cmsHeading || (isRu ? `Обновление бронирования, ${customerName}` : `Booking update, ${customerName}`)}</Text>
          {cmsBody ? <div dangerouslySetInnerHTML={{ __html: cmsBody }} /> : <Text style={textS}>{isRu ? 'Ваше бронирование было обновлено. Пожалуйста, ознакомьтесь с актуальными деталями.' : 'Your booking has been updated. Please review the latest details.'}</Text>}
          {offerUrl && <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}><Button href={offerUrl} style={ctaS}>{isRu ? 'Посмотреть бронирование' : 'View Your Booking'}</Button></Section>}
          <Section style={boxS}><table style={tblS} cellPadding="0" cellSpacing="0"><tbody>{summaryRows.map((row, i) => <tr key={i}><td style={lblS}>{row.label}</td><td style={valS}>{row.value}</td></tr>)}</tbody></table></Section>
          {cmsNote ? <div dangerouslySetInnerHTML={{ __html: cmsNote }} /> : null}
          <Hr style={hr} />
          <Text style={footS}>{cmsFooterHtml ? <div dangerouslySetInnerHTML={{ __html: cmsFooterHtml }} /> : cmsFooterContent ? <div dangerouslySetInnerHTML={{ __html: cmsFooterContent }} /> : (cmsFooter || 'Best Prague Guide | info@bestpragueguide.com')}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#FAF7F2', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { margin: '0 auto', padding: '40px 24px', maxWidth: '560px' }
const logoS = { textAlign: 'center' as const, margin: '0 0 20px', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '700' as const, color: '#1A1A1A' }
const hr = { borderColor: '#E5E5E5', margin: '20px 0' }
const headingS = { fontSize: '20px', fontWeight: '600' as const, color: '#1A1A1A', margin: '0 0 16px' }
const textS = { fontSize: '14px', lineHeight: '24px', color: '#333', margin: '0 0 16px' }
const ctaS = { backgroundColor: '#C4975C', color: '#FFFFFF', fontSize: '14px', fontWeight: '600' as const, padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' as const }
const boxS = { backgroundColor: '#FFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '16px', margin: '16px 0' }
const tblS = { width: '100%', fontSize: '14px' } as const
const lblS = { padding: '6px 8px', color: '#777', fontWeight: 'bold' as const, verticalAlign: 'top' as const, width: '35%' }
const valS = { padding: '6px 8px', color: '#1A1A1A' }
const footS = { fontSize: '12px', color: '#777', textAlign: 'center' as const }
