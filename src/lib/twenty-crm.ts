/**
 * Twenty CRM GraphQL API client.
 * Creates/finds customer person records.
 * Called from n8n W-01 via HTTP Request node, not directly from app code.
 * This file is used if you want to call Twenty from Next.js directly.
 */

async function twentyGql(query: string, variables?: Record<string, unknown>): Promise<unknown> {
  const url = process.env.TWENTY_API_URL
  const token = process.env.TWENTY_API_TOKEN
  if (!url || !token) return null

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) { console.error('[twenty] GQL request failed:', res.status); return null }
    return res.json()
  } catch (err) {
    console.error('[twenty] request error:', err)
    return null
  }
}

export interface TwentyPersonParams {
  name: string
  email: string
  phone?: string
  language: 'en' | 'ru'
  country?: string
  city?: string
}

/**
 * Create or find a person in Twenty CRM.
 * Returns the Twenty person ID or null.
 */
export async function upsertTwentyPerson(params: TwentyPersonParams): Promise<string | null> {
  const [firstName, ...rest] = params.name.trim().split(' ')
  const lastName = rest.join(' ')

  // Try find first
  const found = await twentyGql(`
    query FindPerson($email: String!) {
      people(filter: { emails: { primaryEmail: { eq: $email } } }) {
        edges { node { id } }
      }
    }
  `, { email: params.email }) as { data?: { people?: { edges?: { node: { id: string } }[] } } } | null

  const existing = found?.data?.people?.edges?.[0]?.node?.id
  if (existing) return existing

  // Create
  const created = await twentyGql(`
    mutation CreatePerson($input: PersonCreateInput!) {
      createPerson(data: $input) { id }
    }
  `, {
    input: {
      name: { firstName, lastName },
      emails: { primaryEmail: params.email },
      phones: params.phone
        ? { primaryPhoneNumber: params.phone, primaryPhoneCountryCode: '' }
        : undefined,
      city: params.city ?? '',
    },
  }) as { data?: { createPerson?: { id: string } } } | null

  return created?.data?.createPerson?.id ?? null
}
