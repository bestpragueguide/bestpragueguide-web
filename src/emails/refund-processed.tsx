import { formatEmailDate } from './utils'
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

interface RefundProcessedEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  requestRef: string
  refundAmount: number
  currency: string
  offerUrl?: string
  locale: 'en' | 'ru'
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderHtml?: string
  cmsHeaderContent?: string
  cmsFooterHtml?: string
  cmsFooterContent?: string
}

export function RefundProcessedEmail({
  customerName,
  tourName,
  preferredDate,
  requestRef,
  refundAmount,
  currency = 'EUR',
  offerUrl,
  locale,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderHtml,
  cmsHeaderContent,
  cmsFooterHtml,
  cmsFooterContent,
}: RefundProcessedEmailProps) {
  const isRu = locale === 'ru'

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu
          ? `Возврат оплаты — ${requestRef}`
          : `Refund processed — ${requestRef}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} style={logo} /> : <Text style={logo}>Best Prague Guide</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {isRu
              ? `Возврат обработан, ${customerName}`
              : `Refund processed, ${customerName}`}
          </Text>

          {/* CMS body from trusted admin Lexical richText editor */}
          {cmsBody ? (
            <div dangerouslySetInnerHTML={{ __html: cmsBody }} />
          ) : (
            <Text style={text}>
              {isRu
                ? `Ваш возврат за экскурсию "${tourName}" был обработан.`
                : `Your refund for the "${tourName}" tour has been processed.`}
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
              <strong>{isRu ? 'Сумма возврата' : 'Refund amount'}:</strong> {refundAmount} {currency}
            </Text>
            <Text style={infoText}>
              <strong>{isRu ? 'Заявка' : 'Reference'}:</strong> {requestRef}
            </Text>
          </Section>

          <Text style={text}>
            {isRu
              ? 'Средства будут возвращены на вашу карту в течение 5-10 рабочих дней.'
              : 'The funds will be returned to your card within 5-10 business days.'}
          </Text>

          {offerUrl && (
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button href={offerUrl} style={ctaButton}>
                {isRu ? 'Посмотреть бронирование' : 'View Your Booking'}
              </Button>
            </Section>
          )}

          {/* CMS note from trusted admin Lexical richText editor */}
          {cmsNote ? (
            <div dangerouslySetInnerHTML={{ __html: cmsNote }} />
          ) : (
            <Text style={text}>
              {isRu
                ? 'Если у вас есть вопросы, свяжитесь с нами.'
                : 'If you have any questions, please contact us.'}
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
