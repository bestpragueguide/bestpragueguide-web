import { formatEmailDate } from "./utils"
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

interface PaymentReceivedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  preferredTime: string
  meetingPoint?: string
  requestRef: string
  paidAmount?: number
  currency?: string
  offerUrl?: string
  locale: 'en' | 'ru'
  cmsHeading?: string
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderContent?: string
  cmsFooterContent?: string
}

export function PaymentReceivedEmail({
  customerName,
  tourName,
  preferredDate,
  preferredTime,
  meetingPoint,
  requestRef,
  paidAmount,
  currency = 'EUR',
  offerUrl,
  locale,
  cmsHeading,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderContent,
  cmsFooterContent,
}: PaymentReceivedEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Оплата получена — ${tourName}`
          : `Payment received — ${tourName}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} style={logo} /> : <Text style={logo}>Best Prague Guide</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {cmsHeading || (isRu
              ? `Оплата получена, ${customerName}!`
              : `Payment received, ${customerName}!`)}
          </Text>

          {cmsBody ? (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Всё готово! Вот детали вашей экскурсии:'
                : "You're all set! Here are your tour details:"}
            </Text>
          )}

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>{isRu ? 'Экскурсия' : 'Tour'}:</strong> {tourName}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Дата' : 'Date'}:</strong> {formatEmailDate(preferredDate, locale)}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Время' : 'Time'}:</strong> {preferredTime}
            </Text>
            {meetingPoint && (
              <Text style={infoText}>
                <strong>{isRu ? 'Место встречи' : 'Meeting point'}:</strong>{' '}
                {meetingPoint}
              </Text>
            )}
            {paidAmount != null && paidAmount > 0 && (
              <Text style={infoText}>
                <strong>{isRu ? 'Оплачено' : 'Paid'}:</strong>{' '}
                {paidAmount} {currency}
              </Text>
            )}
            <Text style={infoText}>
              <strong>{isRu ? 'Заявка' : 'Reference'}:</strong>{' '}
              {requestRef}
            </Text>
          </Section>

          {offerUrl && (
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button href={offerUrl} style={ctaButton}>
                {isRu ? 'Посмотреть бронирование' : 'View Your Booking'}
              </Button>
            </Section>
          )}

          {cmsNote ? (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Ваш гид свяжется с вами за день до экскурсии с финальными деталями.'
                : 'Your guide will contact you the day before the tour with final details.'}
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footerStyle}>
            {cmsFooterContent ? <div dangerouslySetInnerHTML={{ __html: cmsFooterContent }} /> : (cmsFooter || 'Best Prague Guide | info@bestpragueguide.com')}
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

const ctaButton = {
  backgroundColor: '#C4975C',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
