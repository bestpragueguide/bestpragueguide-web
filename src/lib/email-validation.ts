// Common disposable email domains — blocks throwaway addresses on booking/contact forms
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.de', 'grr.la',
  'guerrillamailblock.com', 'sharklasers.com', 'guerrillamail.net',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  'throwaway.email', 'throwaway.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'dispostable.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'mailnesia.com', 'maildrop.cc', 'discard.email',
  'fakeinbox.com', 'sharklasers.com', 'guerrillamail.info',
  'spam4.me', 'binkmail.com', 'bobmail.info',
  'chammy.info', 'devnullmail.com', 'letthemeatspam.com',
  'mailexpire.com', 'mailforspam.com', 'mailme.ir',
  'mailscrap.com', 'mailzilla.com', 'nomail.xl.cx',
  'nospam.ze.tc', 'trashymail.com', 'uggsrock.com',
  'tempail.com', 'tempr.email', 'tempmailaddress.com',
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'emailondeck.com', 'getnada.com', 'mohmal.com',
  'burnermail.io', 'inboxkitten.com',
  'mailsac.com', 'harakirimail.com', 'mintemail.com',
  'filzmail.com', 'jetable.org', 'trash-mail.com',
  'guerrillamail.biz', 'grr.la',
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}
