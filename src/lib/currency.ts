export const currencies = ['EUR', 'CZK', 'USD'] as const
export type Currency = (typeof currencies)[number]

export const currencyRates: Record<Currency, number> = { EUR: 1, CZK: 25, USD: 1.25 }
export const currencySymbols: Record<Currency, string> = { EUR: '€', CZK: 'Kč', USD: '$' }

export function formatPrice(eurPrice: number, currency: Currency = 'EUR'): string {
  const converted = Math.round(eurPrice * currencyRates[currency])
  if (currency === 'CZK') {
    return `${converted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')} Kč`
  }
  return `${currencySymbols[currency]}${converted}`
}

export function secondaryPrices(eurPrice: number): string {
  return `≈ ${formatPrice(eurPrice, 'USD')} / ${formatPrice(eurPrice, 'CZK')}`
}

export function formatPriceRange(
  minPrice: number,
  maxPrice: number | null,
  currency: Currency = 'EUR',
): string {
  if (maxPrice === null || maxPrice === minPrice) {
    return formatPrice(minPrice, currency)
  }
  return `${formatPrice(minPrice, currency)}–${formatPrice(maxPrice, currency)}`
}
