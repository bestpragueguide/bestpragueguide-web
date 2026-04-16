import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bestpragueguide.com'

  return {
    rules: [
      // General search engines + ALL AI crawlers — allow everything
      {
        userAgent: [
          // Search engines
          'Googlebot', 'Bingbot', 'DuckDuckBot', 'YandexBot', 'Baiduspider',
          // OpenAI
          'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
          // Anthropic
          'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
          // Perplexity
          'PerplexityBot', 'Perplexity-User',
          // Google AI
          'Google-Extended',
          // Apple
          'Applebot', 'Applebot-Extended',
          // Microsoft
          'MSNBot', 'MSNBot-Media',
          // Meta
          'FacebookBot', 'Meta-ExternalAgent', 'Meta-ExternalFetcher',
          // Amazon
          'Amazonbot',
          // Other AI
          'YouBot', 'DuckAssistBot', 'cohere-ai', 'CCBot',
        ],
        allow: '/',
      },
      // Block aggressive SEO scrapers (reduce server load)
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
      // Default — allow with private path exclusions
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/tour-order/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
