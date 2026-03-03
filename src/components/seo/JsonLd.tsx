/**
 * Renders a JSON-LD structured data script tag.
 * Safe: only serializes server-side data objects via JSON.stringify.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data)

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
