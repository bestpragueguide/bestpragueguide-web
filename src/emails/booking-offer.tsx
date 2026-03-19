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
}: BookingOfferEmailProps) {
  const isRu = locale === 'ru'
  const currencySymbol = currency === 'CZK' ? 'Kč' : currency === 'USD' ? '$' : '€'

  const summaryRows: Array<{ label: string; value: string }> = [
    { label: isRu ? 'Экскурсия' : 'Tour', value: tourName },
    { label: isRu ? 'Дата' : 'Date', value: confirmedDate },
    { label: isRu ? 'Время' : 'Time', value: confirmedTime },
    { label: isRu ? 'Гостей' : 'Guests', value: String(guests) },
    {
      label: isRu ? 'Стоимость' : 'Price',
      value: `${currencySymbol} ${confirmedPrice}`,
    },
  ]

  if (depositAmount != null && depositAmount > 0) {
    summaryRows.push({
      label: isRu ? 'Предоплата' : 'Deposit',
      value: `${currencySymbol} ${depositAmount}`,
    })
  }

  if (cashBalance != null && cashBalance > 0) {
    summaryRows.push({
      label: isRu ? 'Остаток наличными' : 'Cash balance',
      value: `${currencySymbol} ${cashBalance}`,
    })
  }

  summaryRows.push({
    label: isRu ? 'Номер заявки' : 'Reference',
    value: requestRef,
  })

  const defaultHeading = isRu
    ? `Ваш тур подтверждён, ${customerName}!`
    : `Your tour is confirmed, ${customerName}!`

  const defaultBody = isRu
    ? `Отличные новости! Ваша экскурсия "${tourName}" подтверждена на ${confirmedDate} в ${confirmedTime}.\n\nПожалуйста, ознакомьтесь с деталями ниже и завершите оплату, чтобы закрепить дату.`
    : `Great news! Your "${tourName}" tour has been confirmed for ${confirmedDate} at ${confirmedTime}.\n\nPlease review the details below and complete your payment to secure the date.`

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

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={offerUrl} style={ctaButton}>
              {cmsCtaLabel || (isRu ? 'Посмотреть бронирование' : 'View Your Booking')}
            </Button>
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
