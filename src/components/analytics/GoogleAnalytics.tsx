import Script from 'next/script'

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const gadsId = process.env.NEXT_PUBLIC_GADS_ID
  if (!gaId && !gadsId) return null

  const primaryId = gaId || gadsId

  return (
    <>
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${gaId ? `gtag('config', '${gaId}');` : ''}
          ${gadsId ? `gtag('config', '${gadsId}', { allow_enhanced_conversions: true });` : ''}
        `}
      </Script>
    </>
  )
}
