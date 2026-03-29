import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components'
import { formatEmailDate } from './utils'

interface RequestReceivedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  preferredTime?: string
  guests?: number
  customerEmail?: string
  customerPhone?: string
  specialRequests?: string
  totalPrice?: number | null
  currency?: string
  paymentMethod?: string
  depositAmount?: number | null
  paymentStatus?: string
  requestRef: string
  locale: 'en' | 'ru'
  cmsHeaderTitle?: string
  cmsGreeting?: string
  cmsBody?: string
  cmsSummaryTitle?: string
  cmsSummaryBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderContent?: string
  cmsFooterContent?: string
  summaryLabels?: Record<string, string | undefined>
  summaryPaymentLabels?: Record<string, string | undefined>
  summaryLanguageLabels?: Record<string, string | undefined>
}

export function RequestReceivedEmail({
  customerName,
  tourName,
  preferredDate,
  preferredTime,
  guests,
  customerEmail,
  customerPhone,
  specialRequests,
  totalPrice,
  currency = 'EUR',
  paymentMethod,
  depositAmount,
  paymentStatus,
  requestRef,
  locale,
  cmsHeaderTitle,
  cmsGreeting,
  cmsBody,
  cmsSummaryTitle,
  cmsSummaryBody,
  cmsNote,
  cmsFooter,
  summaryLabels: sl,
  summaryPaymentLabels: spl,
  summaryLanguageLabels: sll,
}: RequestReceivedEmailProps) {
  const isRu = locale === 'ru'
  const L = (key: string, en: string, ru: string) => (sl?.[key]) || (isRu ? ru : en)

  const priceDisplay = totalPrice != null && totalPrice > 0
    ? `${totalPrice} ${currency}`
    : (isRu ? 'По запросу' : 'On request')

  const summaryRows: Array<{ label: string; value: string }> = [
    { label: L('tour', 'Tour', 'Экскурсия'), value: tourName },
    { label: L('date', 'Date', 'Дата'), value: formatEmailDate(preferredDate, locale) },
  ]
  if (preferredTime) {
    summaryRows.push({ label: L('time', 'Time', 'Время'), value: preferredTime })
  }
  if (guests) {
    summaryRows.push({ label: L('guests', 'Guests', 'Гостей'), value: String(guests) })
  }
  summaryRows.push({ label: L('price', 'Price', 'Стоимость'), value: priceDisplay })
  if (paymentStatus && paymentStatus !== 'not_required') {
    const psLabels: Record<string, { en: string; ru: string }> = {
      awaiting: { en: 'Awaiting payment', ru: 'Ожидает оплаты' },
      link_sent: { en: 'Payment link sent', ru: 'Ссылка на оплату отправлена' },
      deposit_paid: { en: 'Deposit paid', ru: 'Депозит оплачен' },
      fully_paid: { en: 'Fully paid', ru: 'Полностью оплачено' },
    }
    const psLabel = psLabels[paymentStatus]
    if (psLabel) {
      summaryRows.push({ label: sl?.payment || (isRu ? 'Статус оплаты' : 'Payment Status'), value: isRu ? psLabel.ru : psLabel.en })
    }
  }
  if (customerEmail) {
    summaryRows.push({ label: L('email', 'Email', 'Email'), value: customerEmail })
  }
  if (customerPhone) {
    summaryRows.push({ label: L('phone', 'Phone', 'Телефон'), value: customerPhone })
  }
  if (specialRequests) {
    summaryRows.push({ label: L('requests', 'Special Requests', 'Пожелания'), value: specialRequests })
  }
  if (paymentMethod) {
    const pmValue = paymentMethod === 'cash_only'
      ? (spl?.cash || (isRu ? 'Наличными в день экскурсии' : 'Cash on tour day'))
      : paymentMethod === 'stripe_full'
        ? (spl?.cardFull || (isRu ? 'Картой (полная)' : 'Credit card (full prepayment)'))
        : paymentMethod === 'stripe_deposit'
          ? (spl?.card || (isRu ? 'Картой (депозит)' : 'Credit card (deposit)'))
          : paymentMethod
    summaryRows.push({ label: L('payment', 'Payment', 'Оплата'), value: pmValue })
  }
  summaryRows.push({ label: L('language', 'Language', 'Язык'), value: isRu ? (sll?.ru || 'Русский') : (sll?.en || 'English') })
  summaryRows.push({ label: L('reference', 'Reference', 'Номер заявки'), value: requestRef })

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Запрос получен — ${requestRef}`
          : `Request received — ${requestRef}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div style={logo} dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} /> : <Text style={logo}>{cmsHeaderTitle || 'Best Prague Guide'}</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {cmsGreeting
              ? cmsGreeting.replace('{name}', customerName)
              : (isRu ? `Здравствуйте, ${customerName}!` : `Hello, ${customerName}!`)}
          </Text>

          {/* CMS body is admin-authored HTML from Lexical richText — trusted content */}
          {cmsBody && (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          )}

          <Section style={summaryBox}>
            <Text style={summaryTitle}>
              {cmsSummaryTitle || (isRu ? 'Детали запроса' : 'Booking Summary')}
            </Text>
            {/* Admin-authored HTML from CMS richText — trusted */}
            {cmsSummaryBody && (
              <div dangerouslySetInnerHTML={{ __html: cmsSummaryBody }} />
            )}
            <table style={summaryTable} cellPadding="0" cellSpacing="0">
              <tbody>
                {summaryRows.map((row, i) => (
                  <tr key={i}>
                    <td style={labelCell}>{row.label}</td>
                    <td style={valueCell}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Admin-authored HTML from CMS richText — trusted */}
          {cmsNote && (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          )}

          <Hr style={hr} />
          {cmsFooterContent
            ? <div style={footerStyle} dangerouslySetInnerHTML={{ __html: cmsFooterContent }} />
            : cmsFooter && cmsFooter.split('\n').map((line, i) => (
                <Text key={`f${i}`} style={footerStyle}>{line || '\u00A0'}</Text>
              ))}
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#FAF7F2',
  fontFamily: "'DM Sans', Arial, sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
}

const logo = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1A1A1A',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
}

const heading = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#1A1A1A',
  margin: '0 0 16px',
}

const text = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0 0 16px',
}

const textSpacer = {
  fontSize: '14px',
  lineHeight: '8px',
  color: '#333333',
  margin: '0',
}

const summaryBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const summaryTitle = {
  fontSize: '15px',
  fontWeight: '600' as const,
  color: '#1A1A1A',
  margin: '0 0 12px',
}

const summaryTable = {
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
}

const labelCell = {
  fontSize: '13px',
  color: '#777777',
  padding: '6px 12px 6px 0',
  verticalAlign: 'top' as const,
  whiteSpace: 'nowrap' as const,
  borderBottom: '1px solid #F0F0F0',
}

const valueCell = {
  fontSize: '13px',
  color: '#1A1A1A',
  fontWeight: '500' as const,
  padding: '6px 0',
  verticalAlign: 'top' as const,
  borderBottom: '1px solid #F0F0F0',
}

const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
