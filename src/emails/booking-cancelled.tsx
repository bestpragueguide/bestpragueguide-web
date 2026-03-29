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

interface BookingCancelledEmailProps {
  customerName: string
  tourName: string
  preferredDate: string
  requestRef: string
  locale: 'en' | 'ru'
  cmsHeaderTitle?: string
  cmsGreeting?: string
  cmsBody?: string
  cmsNote?: string
  cmsFooter?: string
  cmsHeaderContent?: string
  cmsFooterContent?: string
}

export function BookingCancelledEmail({
  customerName,
  tourName,
  preferredDate,
  requestRef,
  locale,
  cmsHeaderTitle,
  cmsGreeting,
  cmsBody,
  cmsNote,
  cmsFooter,
  cmsHeaderContent,
  cmsFooterContent,
}: BookingCancelledEmailProps) {
  const isRu = locale === 'ru'

  const fmtDate = formatEmailDate(preferredDate, locale)
  const defaultBody = isRu
    ? `К сожалению, ваше бронирование экскурсии \u201C${tourName}\u201D на ${fmtDate} было отменено.`
    : `Unfortunately, your booking for the \u201C${tourName}\u201D tour on ${fmtDate} has been cancelled.`

  const defaultNote = isRu
    ? 'Если у вас есть вопросы или вы хотели бы перенести экскурсию на другую дату, пожалуйста, свяжитесь с нами.'
    : 'If you have any questions or would like to reschedule, please contact us.'

  const bodyContent = cmsBody || defaultBody
  const noteContent = cmsNote || defaultNote
  // Content is admin-authored from Payload CMS Lexical richText editor (trusted)
  const bodyIsHtml = bodyContent.includes('<')
  const noteIsHtml = noteContent.includes('<')

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isRu ? `Бронирование отменено \u2014 ${requestRef}` : `Booking cancelled \u2014 ${requestRef}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {cmsHeaderContent ? <div style={logo} dangerouslySetInnerHTML={{ __html: cmsHeaderContent }} /> : <Text style={logo}>{cmsHeaderTitle || 'Best Prague Guide'}</Text>}
          <Hr style={hr} />

          <Text style={heading}>
            {cmsGreeting
              ? cmsGreeting.replace('{name}', customerName)
              : (isRu ? `Уважаемый(-ая) ${customerName},` : `Dear ${customerName},`)}
          </Text>

          {bodyIsHtml
            ? <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
            : <Text style={text}>{bodyContent}</Text>}

          {noteIsHtml
            ? <div dangerouslySetInnerHTML={{ __html: noteContent }} />
            : <Text style={text}>{noteContent}</Text>}

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
const footerStyle = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
