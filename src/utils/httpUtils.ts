import type { KVEntry, AuthConfig } from '../types'

export function buildFinalUrl(url: string, params: KVEntry[]): string {
  const enabledParams = params.filter((p) => p.enabled && p.key.trim())
  if (enabledParams.length === 0) return url
  try {
    const u = new URL(url)
    enabledParams.forEach((p) => u.searchParams.set(p.key.trim(), p.value))
    return u.toString()
  } catch {
    const qs = enabledParams
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
      .join('&')
    return url + (url.includes('?') ? '&' : '?') + qs
  }
}

export function buildPreparedHeaders(
  headers: KVEntry[],
  auth: AuthConfig,
): Record<string, string> {
  const map: Record<string, string> = {}
  headers
    .filter((e) => e.enabled && e.key.trim())
    .forEach((e) => {
      map[e.key.trim()] = e.value
    })
  if (auth.type === 'bearer' && auth.bearer.trim()) {
    map['Authorization'] = `Bearer ${auth.bearer.trim()}`
  } else if (auth.type === 'basic' && auth.basicUser.trim()) {
    map['Authorization'] = `Basic ${btoa(`${auth.basicUser}:${auth.basicPass}`)}`
  } else if (auth.type === 'api-key' && auth.apiKeyHeader.trim() && auth.apiKeyValue.trim()) {
    map[auth.apiKeyHeader.trim()] = auth.apiKeyValue.trim()
  }
  return map
}

export function isJsonContentType(headers: Record<string, string>): boolean {
  return Object.entries(headers).some(
    ([k, v]) => k.toLowerCase() === 'content-type' && v.toLowerCase().includes('json'),
  )
}

export function tryParseJson(text: string): unknown | undefined {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}
