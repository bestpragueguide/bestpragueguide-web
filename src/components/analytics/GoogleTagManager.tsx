import Script from 'next/script'

export function GoogleTagManagerHead() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
    />
  )
}

export function GoogleTagManagerBody() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="GTM"
      />
    </noscript>
  )
}
