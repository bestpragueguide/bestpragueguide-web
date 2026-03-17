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

interface PreTourReminderEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  preferredTime: string
  meetingPoint?: string
  requestRef: string
  locale: 'en' | 'ru'
}

export function PreTourReminderEmail({
  customerName,
  tourName,
  preferredDate,
  preferredTime,
  meetingPoint,
  requestRef,
  locale,
}: PreTourReminderEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Напоминание: экскурсия завтра — ${tourName}`
          : `Reminder: tour tomorrow — ${tourName}`}
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
              ? `Напоминание, ${customerName}!`
              : `Reminder, ${customerName}!`}
          </Text>

          <Text style={text}>
            {isRu
              ? `Ваша экскурсия "${tourName}" запланирована на завтра!`
              : `Your "${tourName}" tour is scheduled for tomorrow!`}
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>{isRu ? 'Дата' : 'Date'}:</strong> {preferredDate}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Время' : 'Time'}:</strong> {preferredTime}
            </Text>
            {meetingPoint && (
              <Text style={infoText}>
                <strong>
                  {isRu ? 'Место встречи' : 'Meeting point'}:
                </strong>{' '}
                {meetingPoint}
              </Text>
            )}
            <Text style={infoText}>
              <strong>{isRu ? 'Заявка' : 'Reference'}:</strong>{' '}
              {requestRef}
            </Text>
          </Section>

          <Text style={text}>
            {isRu
              ? 'Советы: наденьте удобную обувь и возьмите воду. При вопросах — свяжитесь с нами.'
              : 'Tips: wear comfortable shoes and bring water. Contact us if you have any questions.'}
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
  margin: '0 0 8px',
}

const footer = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
