import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from '@react-email/components'
import { formatEmailDate } from './utils'

export interface BookingOfferEmailProps {
  customerName: string
  tourName: string
  confirmedDate: string
  confirmedTime: string
  guests: number
  confirmedPrice: number
  depositAmount?: number
  cashBalance?: number
  currency: string
  customerEmail?: string
  customerPhone?: string
  paymentMethod?: string
  paymentStatus?: string
  requestRef: string
  offerUrl: string
  locale: 'en' | 'ru'
  cmsHeaderTitle?: string
  cmsGreeting?: string
  cmsHeading?: string
  cmsBody?: string
  cmsCtaLabel?: string
  cmsNote?: string
  cmsFooter?: string
  summaryLabels?: Record<string, string | undefined>
  summaryPaymentLabels?: Record<string, string | undefined>
  summaryLanguageLabels?: Record<string, string | undefined>
}

export function BookingOfferEmail({
  customerName,
  tourName,
  confirmedDate,
  confirmedTime,
  guests,
  confirmedPrice,
  depositAmount,
  cashBalance,
  currency = 'EUR',
  customerEmail,
  customerPhone,
  paymentMethod,
  paymentStatus,
  requestRef,
  offerUrl,
  locale,
  cmsHeaderTitle,
  cmsGreeting,
  cmsHeading,
  cmsBody,
  cmsCtaLabel,
  cmsNote,
  cmsFooter,
  summaryLabels: sl,
  summaryPaymentLabels: spl,
  summaryLanguageLabels: sll,
}: BookingOfferEmailProps) {
  const isRu = locale === 'ru'
  const L = (key: string, en: string, ru: string) => (sl?.[key]) || (isRu ? ru : en)

  const summaryRows: Array<{ label: string; value: string }> = [
    { label: L('tour', 'Tour', 'Экскурсия'), value: tourName },
    { label: L('date', 'Date', 'Дата'), value: formatEmailDate(confirmedDate, locale) },
    { label: L('time', 'Time', 'Время'), value: confirmedTime },
    { label: L('guests', 'Guests', 'Гостей'), value: String(guests) },
    { label: L('price', 'Price', 'Стоимость'), value: `${confirmedPrice} ${currency}` },
  ]

  if (depositAmount != null && depositAmount > 0) {
    summaryRows.push({ label: L('deposit', 'Deposit', 'Предоплата'), value: `${depositAmount} ${currency}` })
  }
  if (cashBalance != null && cashBalance > 0) {
    summaryRows.push({ label: L('cashBalance', 'Cash balance', 'Остаток наличными'), value: `${cashBalance} ${currency}` })
  }
  if (paymentStatus && paymentStatus !== 'not_required') {
    const psLabels: Record<string, { en: string; ru: string }> = {
      awaiting: { en: 'Awaiting payment', ru: 'Ожидает оплаты' },
      link_sent: { en: 'Payment link sent', ru: 'Ссылка на оплату отправлена' },
      deposit_paid: { en: 'Deposit paid', ru: 'Депозит оплачен' },
      fully_paid: { en: 'Fully paid', ru: 'Полностью оплачено' },
    }
    const psLabel = psLabels[paymentStatus]
    if (psLabel) {
      summaryRows.push({ label: isRu ? 'Статус оплаты' : 'Payment Status', value: isRu ? psLabel.ru : psLabel.en })
    }
  }
  if (customerEmail) {
    summaryRows.push({ label: L('email', 'Email', 'Email'), value: customerEmail })
  }
  if (customerPhone) {
    summaryRows.push({ label: L('phone', 'Phone', 'Телефон'), value: customerPhone })
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

  const defaultHeading = isRu
    ? `Ваш тур подтверждён, ${customerName}!`
    : `Your tour is confirmed, ${customerName}!`

  const fmtDate = formatEmailDate(confirmedDate, locale)
  const defaultBody = isRu
    ? `Отличные новости! Ваша экскурсия "${tourName}" подтверждена на ${fmtDate} в ${confirmedTime}.\n\nПожалуйста, ознакомьтесь с деталями ниже и завершите оплату, чтобы закрепить дату.`
    : `Great news! Your "${tourName}" tour has been confirmed for ${fmtDate} at ${confirmedTime}.\n\nPlease review the details below and complete your payment to secure the date.`

  const defaultNote = isRu
    ? 'Нажмите кнопку выше, чтобы просмотреть все детали и завершить оплату.'
    : 'Click the button above to view all details and complete your payment.'

  const bodyHtml = cmsBody || defaultBody
  const isHtml = bodyHtml.includes('<')

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Подтверждено -- ${tourName}`
          : `Confirmed -- ${tourName}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>{cmsHeaderTitle || 'Best Prague Guide'}</Text>
          <Hr style={hr} />

          <Text style={heading}>
            {cmsGreeting
              ? cmsGreeting.replace('{name}', customerName)
              : cmsHeading || defaultHeading}
          </Text>

          {/* CMS body is admin-authored from Lexical richText editor — trusted content */}
          {isHtml
            ? <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            : bodyHtml.split('\n').map((line, i) => (
                <Text key={i} style={line.trim() ? text : textSpacer}>{line || '\u00A0'}</Text>
              ))
          }

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={offerUrl} style={ctaButton}>
              {cmsCtaLabel || (isRu ? 'Посмотреть бронирование' : 'View Your Booking')}
            </Button>
          </Section>

          <Section style={summaryBox}>
            <Text style={summaryTitle}>
              {isRu ? 'Детали бронирования' : 'Booking Summary'}
            </Text>
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

          {/* CMS note — admin-authored trusted content */}
          {(cmsNote || defaultNote).includes('<')
            ? <div dangerouslySetInnerHTML={{ __html: cmsNote || defaultNote }} />
            : <Text style={text}>{cmsNote || defaultNote}</Text>
          }

          <Hr style={hr} />
          {(cmsFooter || 'Best Prague Guide | info@bestpragueguide.com').split('\n').map((line, i) => (
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

const hr = { borderColor: '#E5E5E5', margin: '20px 0' }

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

const ctaButton = {
  backgroundColor: '#C4975C',
  color: '#FFFFFF',
  fontWeight: '600' as const,
  fontSize: '16px',
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
}

const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
