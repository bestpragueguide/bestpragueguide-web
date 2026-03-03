export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!token || !chatId) {
    console.log('[Telegram] Skipping (no config):', text.slice(0, 100))
    return { success: true, skipped: true }
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      },
    )

    if (!res.ok) {
      const error = await res.text()
      console.error('[Telegram] Send failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('[Telegram] Error:', error)
    return { success: false, error }
  }
}

export function formatBookingTelegramMessage({
  requestRef,
  tourName,
  preferredDate,
  preferredTime,
  guests,
  customerName,
  customerEmail,
  customerPhone,
  specialRequests,
}: {
  requestRef: string
  tourName: string
  preferredDate: string
  preferredTime: string
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests: string
}): string {
  let msg = `🆕 <b>New Booking Request</b>\n\n`
  msg += `📋 <b>Ref:</b> ${requestRef}\n`
  msg += `🎯 <b>Tour:</b> ${tourName}\n`
  msg += `📅 <b>Date:</b> ${preferredDate}\n`
  msg += `🕐 <b>Time:</b> ${preferredTime}\n`
  msg += `👥 <b>Guests:</b> ${guests}\n\n`
  msg += `👤 <b>Customer:</b> ${customerName}\n`
  msg += `📧 <b>Email:</b> ${customerEmail}\n`
  if (customerPhone) msg += `📱 <b>Phone:</b> ${customerPhone}\n`
  if (specialRequests) msg += `💬 <b>Notes:</b> ${specialRequests}\n`
  return msg
}
