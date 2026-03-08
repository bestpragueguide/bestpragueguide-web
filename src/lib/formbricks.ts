/**
 * Formbricks URL builder.
 * Generates pre-filled survey links for n8n email workflows.
 */

export function getSurveyUrl(params: {
  language: 'en' | 'ru'
  bookingRef: string
  customerName: string
  tourTitle: string
}): string {
  const id =
    params.language === 'en'
      ? process.env.FORMBRICKS_SURVEY_EN
      : process.env.FORMBRICKS_SURVEY_RU

  if (!id || !process.env.FORMBRICKS_BASE_URL) return ''

  const url = new URL(`${process.env.FORMBRICKS_BASE_URL}/s/${id}`)
  url.searchParams.set('bookingRef', params.bookingRef)
  url.searchParams.set('customerName', params.customerName)
  url.searchParams.set('tourTitle', params.tourTitle)
  return url.toString()
}
