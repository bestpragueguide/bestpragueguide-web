/**
 * Russian plural forms: 1 гость, 2-4 гостя, 5-20 гостей, 21 гость, etc.
 */
function ruPlural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs >= 11 && abs <= 19) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

export function guestsLabel(n: number, locale: string): string {
  if (locale === 'ru') return ruPlural(n, 'гость', 'гостя', 'гостей')
  return n === 1 ? 'guest' : 'guests'
}
