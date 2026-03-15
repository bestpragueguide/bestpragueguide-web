import Redis from 'ioredis'

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 20

// In-memory fallback when Redis is unavailable
const memoryMap = new Map<string, number[]>()

function memoryRateLimit(key: string): boolean {
  const now = Date.now()
  const timestamps = memoryMap.get(key) || []
  const recent = timestamps.filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) return true

  recent.push(now)
  memoryMap.set(key, recent)
  return false
}

let redisClient: Redis | null = null
let redisAvailable: boolean | null = null

function getRedis(): Redis | null {
  if (redisAvailable === false) return null
  if (redisClient) return redisClient

  const url = process.env.REDIS_URL
  if (!url) {
    redisAvailable = false
    return null
  }

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      enableOfflineQueue: false,
    })

    redisClient.on('error', (err) => {
      console.error('[RateLimit] Redis error:', err.message)
      redisAvailable = false
      redisClient = null
    })

    redisClient.on('connect', () => {
      redisAvailable = true
    })

    redisAvailable = true
    return redisClient
  } catch {
    redisAvailable = false
    return null
  }
}

export async function isRateLimited(
  ip: string,
  scope: string = 'default',
): Promise<boolean> {
  const key = `rate:${scope}:${ip}`

  try {
    const redis = getRedis()
    if (!redis) return memoryRateLimit(key)

    const now = Date.now()
    const windowStart = now - WINDOW_MS
    const ttlSeconds = Math.ceil(WINDOW_MS / 1000)

    // Use sorted set: score = timestamp, member = unique request id
    // Pipeline the commands for efficiency
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    const results = await pipeline.exec()

    if (!results) return memoryRateLimit(key)

    const count = (results[1]?.[1] as number) ?? 0

    if (count >= MAX_REQUESTS) return true

    await redis
      .pipeline()
      .zadd(key, now, `${now}:${Math.random()}`)
      .expire(key, ttlSeconds)
      .exec()

    return false
  } catch {
    // Fall back to in-memory if Redis fails
    return memoryRateLimit(key)
  }
}
