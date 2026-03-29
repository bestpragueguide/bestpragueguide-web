import { formatEmailDate } from './utils'
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Preview,
} from '@react-email/components'

interface RequestDeclinedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  requestRef: string
  locale: 'en' | 'ru'
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderHtml?: string
  cmsHeaderContent?: string
  cmsFooterHtml?: string
  cmsFooterContent?: string
}

export function RequestDeclinedEmail({
  customerName,
  tourName,
  preferredDate,
  requestRef,
  locale,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderHtml,
  cmsHeaderContent,
  cmsFooterHtml,
  cmsFooterContent,
}: RequestDeclinedEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Обновление запроса — ${requestRef}`
          : `Request update — ${requestRef}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} style={logo} /> : <Text style={logo}>Best Prague Guide</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {isRu
              ? `Уважаемый(-ая) ${customerName},`
              : `Dear ${customerName},`}
          </Text>

          {cmsBody ? (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          ) : (
            <Text style={text}>
              {isRu
                ? `К сожалению, выбранная вами дата (${formatEmailDate(preferredDate, locale)}) для экскурсии "${tourName}" недоступна.`
                : `Unfortunately, your requested date (${formatEmailDate(preferredDate, locale)}) for the "${tourName}" tour is not available.`}
            </Text>
          )}

          {cmsNote ? (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Мы будем рады предложить альтернативную дату. Пожалуйста, свяжитесь с нами через WhatsApp, Telegram или email, чтобы обсудить варианты.'
                : "We'd be happy to suggest an alternative date. Please contact us via WhatsApp, Telegram, or email to discuss options."}
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footerStyle}>
            {cmsFooterHtml ? <div dangerouslySetInnerHTML={{ __html: cmsFooterHtml }} /> : cmsFooterContent ? <div dangerouslySetInnerHTML={{ __html: cmsFooterContent }} /> : (cmsFooter || 'Best Prague Guide | info@bestpragueguide.com')}
          </Text>
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
  textAlign: 'center' as const,
  margin: '0 0 20px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1A1A1A',
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

const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
