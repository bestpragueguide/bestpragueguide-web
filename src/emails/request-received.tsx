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
  requestRef: string
  locale: 'en' | 'ru'
  cmsHeaderTitle?: string
  cmsGreeting?: string
  cmsBody?: string
  cmsSummaryTitle?: string
  cmsSummaryBody?: string
  cmsNote?: string
  cmsFooter?: string
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
  requestRef,
  locale,
  cmsHeaderTitle,
  cmsGreeting,
  cmsBody,
  cmsSummaryTitle,
  cmsSummaryBody,
  cmsNote,
  cmsFooter,
}: RequestReceivedEmailProps) {
  const isRu = locale === 'ru'

  const currencySymbol = currency === 'CZK' ? 'Kč' : currency === 'USD' ? '$' : '€'
  const priceDisplay = totalPrice != null && totalPrice > 0
    ? `${currencySymbol}${totalPrice}`
    : (isRu ? 'По запросу' : 'On request')

  const summaryRows: Array<{ label: string; value: string }> = [
    { label: isRu ? 'Экскурсия' : 'Tour', value: tourName },
    { label: isRu ? 'Дата' : 'Date', value: preferredDate },
  ]
  if (preferredTime) {
    summaryRows.push({ label: isRu ? 'Время' : 'Time', value: preferredTime })
  }
  if (guests) {
    summaryRows.push({ label: isRu ? 'Гостей' : 'Guests', value: String(guests) })
  }
  summaryRows.push({ label: isRu ? 'Стоимость' : 'Price', value: priceDisplay })
  if (customerEmail) {
    summaryRows.push({ label: 'Email', value: customerEmail })
  }
  if (customerPhone) {
    summaryRows.push({ label: isRu ? 'Телефон' : 'Phone', value: customerPhone })
  }
  if (specialRequests) {
    summaryRows.push({ label: isRu ? 'Пожелания' : 'Requests', value: specialRequests })
  }
  summaryRows.push({ label: isRu ? 'Номер заявки' : 'Reference', value: requestRef })

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
          <Text style={logo}>{cmsHeaderTitle || 'Best Prague Guide'}</Text>
          <Hr style={hr} />

          <Text style={heading}>
            {cmsGreeting
              ? cmsGreeting.replace('{name}', customerName)
              : (isRu ? `Здравствуйте, ${customerName}!` : `Hello, ${customerName}!`)}
          </Text>

          {cmsBody && cmsBody.split('\n').map((line, i) => (
            <Text key={i} style={line.trim() ? text : textSpacer}>
              {line || '\u00A0'}
            </Text>
          ))}

          <Section style={summaryBox}>
            <Text style={summaryTitle}>
              {cmsSummaryTitle || (isRu ? 'Детали запроса' : 'Booking Summary')}
            </Text>
            {cmsSummaryBody && cmsSummaryBody.split('\n').map((line, i) => (
              <Text key={`sb${i}`} style={line.trim() ? text : textSpacer}>
                {line || '\u00A0'}
              </Text>
            ))}
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

          {cmsNote && cmsNote.split('\n').map((line, i) => (
            <Text key={i} style={line.trim() ? text : textSpacer}>
              {line || '\u00A0'}
            </Text>
          ))}

          <Hr style={hr} />
          {cmsFooter && cmsFooter.split('\n').map((line, i) => (
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
