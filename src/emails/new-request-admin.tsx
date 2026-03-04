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
import { formatPrice, type Currency } from '@/lib/currency'

interface NewRequestAdminEmailProps {
  requestRef: string
  tourName: string
  preferredDate: string
  preferredTime: string
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests: string
  totalPrice?: number
  currency?: string
  locale: string
  ip?: string
  location?: string
  isp?: string
}

export function NewRequestAdminEmail({
  requestRef,
  tourName,
  preferredDate,
  preferredTime,
  guests,
  customerName,
  customerEmail,
  customerPhone,
  specialRequests,
  totalPrice,
  currency,
  locale,
  ip,
  location,
  isp,
}: NewRequestAdminEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New booking request {requestRef} — {tourName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Best Prague Guide — Admin</Text>
          <Hr style={hr} />

          <Text style={heading}>New Booking Request</Text>

          <Section style={infoBox}>
            <Text style={infoRow}>
              <strong>Reference:</strong> {requestRef}
            </Text>
            <Text style={infoRow}>
              <strong>Tour:</strong> {tourName}
            </Text>
            <Text style={infoRow}>
              <strong>Date:</strong> {preferredDate}
            </Text>
            <Text style={infoRow}>
              <strong>Time:</strong> {preferredTime}
            </Text>
            <Text style={infoRow}>
              <strong>Guests:</strong> {guests}
            </Text>
            <Text style={infoRow}>
              <strong>Language:</strong> {locale.toUpperCase()}
            </Text>
            {totalPrice != null && totalPrice > 0 && (
              <Text style={infoRow}>
                <strong>Price:</strong> {formatPrice(totalPrice, (currency as Currency) || 'EUR')}
              </Text>
            )}
          </Section>

          <Section style={infoBox}>
            <Text style={infoRow}>
              <strong>Customer:</strong> {customerName}
            </Text>
            <Text style={infoRow}>
              <strong>Email:</strong> {customerEmail}
            </Text>
            {customerPhone && (
              <Text style={infoRow}>
                <strong>Phone:</strong> {customerPhone}
              </Text>
            )}
            {specialRequests && (
              <Text style={infoRow}>
                <strong>Special requests:</strong> {specialRequests}
              </Text>
            )}
          </Section>

          {ip && (
            <Section style={ipBox}>
              <Text style={ipRow}>
                <strong>IP:</strong> {ip}
              </Text>
              {location && (
                <Text style={ipRow}>
                  <strong>Location:</strong> {location}
                </Text>
              )}
              {isp && (
                <Text style={ipRow}>
                  <strong>ISP:</strong> {isp}
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Manage in admin panel → Booking Requests
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#F5F5F5',
  fontFamily: "'DM Sans', Arial, sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
}

const logo = {
  fontSize: '20px',
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

const infoBox = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const infoRow = {
  fontSize: '14px',
  color: '#333333',
  margin: '0 0 8px',
}

const ipBox = {
  backgroundColor: '#F9F9F9',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '16px 0',
}

const ipRow = {
  fontSize: '12px',
  color: '#999999',
  margin: '0 0 4px',
}

const footer = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const,
}
