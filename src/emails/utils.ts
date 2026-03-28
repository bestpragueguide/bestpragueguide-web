/** Format date for emails: "3 April 2026" (EN) / "3 апреля 2026" (RU) */
export function formatEmailDate(dateStr: string, locale: 'en' | 'ru'): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
