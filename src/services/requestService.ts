import type { ResponseData } from '../types'

export interface RequestPayload {
  method: string
  url: string
  headers: Record<string, string>
  body?: string
}

export async function executeRequest(payload: RequestPayload): Promise<ResponseData> {
  const res = await fetch('/api/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with ${res.status}`)
  }

  return res.json() as Promise<ResponseData>
}
