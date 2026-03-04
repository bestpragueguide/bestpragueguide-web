export interface IpInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  org?: string
}

export async function getIpInfo(ip: string): Promise<IpInfo> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1') {
    return { ip }
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return {
        ip,
        city: data.city,
        region: data.regionName,
        country: data.country,
        org: data.isp,
      }
    }
  } catch {
    // Geolookup failed, continue with IP only
  }
  return { ip }
}

export function formatLocation(ipInfo: IpInfo): string {
  return [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(', ')
}
