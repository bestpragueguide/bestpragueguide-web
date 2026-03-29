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

interface RequestConfirmedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  preferredTime: string
  requestRef: string
  paymentLink?: string
  locale: 'en' | 'ru'
  cmsHeading?: string
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderHtml?: string
  cmsHeaderContent?: string
  cmsFooterHtml?: string
  cmsFooterContent?: string
}

export function RequestConfirmedEmail({
  customerName,
  tourName,
  preferredDate,
  preferredTime,
  requestRef,
  paymentLink,
  locale,
  cmsHeading,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderHtml,
  cmsHeaderContent,
  cmsFooterHtml,
  cmsFooterContent,
}: RequestConfirmedEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu ? `Подтверждено — ${tourName}` : `Confirmed — ${tourName}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} style={logo} /> : <Text style={logo}>Best Prague Guide</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {cmsHeading || (isRu
              ? `Подтверждено, ${customerName}!`
              : `Confirmed, ${customerName}!`)}
          </Text>

          {cmsBody ? (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          ) : (
            <Text style={text}>
              {isRu
                ? `Ваш запрос на экскурсию "${tourName}" подтверждён.`
                : `Your request for the "${tourName}" tour has been confirmed.`}
            </Text>
          )}

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>{isRu ? 'Дата' : 'Date'}:</strong> {formatEmailDate(preferredDate, locale)}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Время' : 'Time'}:</strong> {preferredTime}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Заявка' : 'Reference'}:</strong>{' '}
              {requestRef}
            </Text>
          </Section>

          {paymentLink && (
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button
                href={paymentLink}
                style={payButton}
              >
                {isRu ? 'Оплатить' : 'Pay Now'}
              </Button>
            </Section>
          )}

          {cmsNote ? (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Детали места встречи и контакт гида будут отправлены после оплаты.'
                : 'Meeting point details and guide contact will be sent after payment.'}
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

const payButton = {
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
