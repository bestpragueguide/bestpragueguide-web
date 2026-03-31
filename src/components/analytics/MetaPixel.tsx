// Meta Pixel noscript fallback — the main script is injected in <head> via layout.tsx
// This ensures the pixel fires even with JavaScript disabled

export function MetaPixelNoscript({ pixelId }: { pixelId?: string }) {
  if (!pixelId) return null

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}
