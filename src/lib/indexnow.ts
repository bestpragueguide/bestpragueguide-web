/**
 * IndexNow client for instant search engine indexing (Bing, Yandex, Naver, Seznam).
 * Fire-and-forget — failures are logged, never thrown.
 */

const INDEXNOW_KEY = '7f0d2ac37b974b7e83c334c5bdbf6a1a'
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'
const TIMEOUT_MS = 5000

async function ping(urls: string[]): Promise<void> {
  if (urls.length === 0) return

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'bestpragueguide.com',
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Submitted ${urls.length} URL(s)`)
    } else {
      console.error(`[IndexNow] API returned ${res.status}`)
    }
  } catch (err) {
    console.error('[IndexNow] Ping failed:', err)
  }
}

/** Build full URLs for a tour in all its published locales */
function tourUrls(slug: string, locale: string): string[] {
  if (locale === 'ru') return [`${BASE_URL}/ru/ekskursii/${slug}`]
  return [`${BASE_URL}/en/tours/${slug}`]
}

/** Build full URLs for a blog post in all its published locales */
function blogUrls(slug: string, locale: string): string[] {
  return [`${BASE_URL}/${locale}/blog/${slug}`]
}

/** Ping IndexNow for a published tour (both locales if bilingual) */
export async function pingTour(
  tourId: number,
  publishedLocales: string[],
  slugs: Record<string, string>,
): Promise<void> {
  const urls: string[] = []
  for (const loc of publishedLocales) {
    if (slugs[loc]) urls.push(...tourUrls(slugs[loc], loc))
  }
  await ping(urls)
}

/** Ping IndexNow for a published blog post */
export async function pingBlogPost(
  postId: number,
  publishedLocales: string[],
  slugs: Record<string, string>,
): Promise<void> {
  const urls: string[] = []
  for (const loc of publishedLocales) {
    if (slugs[loc]) urls.push(...blogUrls(slugs[loc], loc))
  }
  await ping(urls)
}

/** Ping IndexNow with arbitrary URLs */
export async function pingUrls(urls: string[]): Promise<void> {
  await ping(urls)
}
