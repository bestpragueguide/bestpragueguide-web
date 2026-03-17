import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Preview,
} from '@react-email/components'

interface RequestReceivedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  requestRef: string
  locale: 'en' | 'ru'
}

export function RequestReceivedEmail({
  customerName,
  tourName,
  preferredDate,
  requestRef,
  locale,
}: RequestReceivedEmailProps) {
  const isRu = locale === 'ru'

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
          <Img
            src={`https://bestpragueguide.com/logo-email-${locale}.png`}
            alt="Best Prague Guide"
            width="340"
            height="50"
            style={logo}
          />
          <Hr style={hr} />

          <Text style={heading}>
            {isRu
              ? `Здравствуйте, ${customerName}!`
              : `Hello, ${customerName}!`}
          </Text>

          <Text style={text}>
            {isRu
              ? `Спасибо за ваш запрос на экскурсию "${tourName}" на ${preferredDate}. Мы получили ваш запрос и подтвердим его в течение 2 часов.`
              : `Thank you for your request for the "${tourName}" tour on ${preferredDate}. We received your request and will confirm within 2 hours.`}
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              {isRu ? 'Номер заявки' : 'Reference number'}:{' '}
              <strong>{requestRef}</strong>
            </Text>
          </Section>

          <Text style={text}>
            {isRu
              ? 'Если у вас есть вопросы, свяжитесь с нами через WhatsApp, Telegram или email.'
              : 'If you have any questions, contact us via WhatsApp, Telegram, or email.'}
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Best Prague Guide | info@bestpragueguide.com
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
  display: 'block' as const,
  margin: '0 auto 20px',
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

const infoBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const infoText = {
  fontSize: '14px',
  color: '#1A1A1A',
  margin: '0',
}

const footer = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
