// Contact confirmation email — all CMS content is from trusted admin Lexical richText editor
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

interface ContactConfirmationEmailProps {
  customerName: string
  email: string
  phone: string
  message: string
  locale: 'en' | 'ru'
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderHtml?: string
  cmsHeaderContent?: string
  cmsFooterHtml?: string
  cmsFooterContent?: string
}

export function ContactConfirmationEmail({
  customerName,
  email,
  phone,
  message,
  locale,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderHtml,
  cmsHeaderContent,
  cmsFooterHtml,
  cmsFooterContent,
}: ContactConfirmationEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? 'Мы получили ваше сообщение'
          : 'We received your message'}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderHtml ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderHtml }} /> : cmsHeaderContent ? <div style={logo} dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} /> : <Text style={logo}>Best Prague Guide</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {isRu
              ? `Спасибо, ${customerName}!`
              : `Thank you, ${customerName}!`}
          </Text>

          {cmsBody ? (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Мы получили ваше сообщение и ответим в ближайшее время.'
                : 'We received your message and will get back to you soon.'}
            </Text>
          )}

          <Text style={copyLabel}>
            {isRu ? 'Копия вашего сообщения:' : 'A copy of your message:'}
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>{isRu ? 'Имя' : 'Name'}:</strong> {customerName}
            </Text>
            <Text style={infoText}>
              <strong>Email:</strong> {email}
            </Text>
            {phone && (
              <Text style={infoText}>
                <strong>{isRu ? 'Телефон' : 'Phone'}:</strong> {phone}
              </Text>
            )}
            <Text style={{ ...infoText, whiteSpace: 'pre-wrap' }}>
              <strong>{isRu ? 'Сообщение' : 'Message'}:</strong> {message}
            </Text>
          </Section>

          {cmsNote ? (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Мы обычно отвечаем в течение нескольких часов.'
                : 'We typically respond within a few hours.'}
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

const copyLabel = {
  fontSize: '13px',
  color: '#777777',
  margin: '20px 0 8px',
}

const infoBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 16px',
}

const infoText = {
  fontSize: '14px',
  color: '#1A1A1A',
  margin: '0 0 8px',
}

const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
