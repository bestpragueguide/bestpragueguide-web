export async function sendWhatsAppMessage(text: string) {
  const apiUrl = process.env.WHATSAPP_API_URL
  const apiToken = process.env.WHATSAPP_API_TOKEN
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER

  if (!apiUrl || !apiToken || !adminNumber) {
    console.log('[WhatsApp] Skipping (no config):', text.slice(0, 100))
    return { success: true, skipped: true }
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: adminNumber,
        type: 'text',
        text: { body: text },
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[WhatsApp] Send failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('[WhatsApp] Error:', error)
    return { success: false, error }
  }
}

export function formatBookingWhatsAppMessage({
  requestRef,
  tourName,
  preferredDate,
  preferredTime,
  guests,
  customerName,
  customerEmail,
  customerPhone,
  ip,
  location,
}: {
  requestRef: string
  tourName: string
  preferredDate: string
  preferredTime: string
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  ip?: string
  location?: string
}): string {
  let msg = `🆕 *New Booking Request*\n\n`
  msg += `Ref: ${requestRef}\n`
  msg += `Tour: ${tourName}\n`
  msg += `Date: ${preferredDate} at ${preferredTime}\n`
  msg += `Guests: ${guests}\n\n`
  msg += `Customer: ${customerName}\n`
  msg += `Email: ${customerEmail}\n`
  if (customerPhone) msg += `Phone: ${customerPhone}\n`
  if (ip) {
    msg += `\nIP: ${ip}`
    if (location) msg += `\nLocation: ${location}`
    msg += '\n'
  }
  return msg
}
