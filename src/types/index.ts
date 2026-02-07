// ── Types ──────────────────────────────────────────────────────────────

export type KVEntry = { key: string; value: string; enabled: boolean }

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

export type AuthConfig = {
  type: AuthType
  bearer: string
  basicUser: string
  basicPass: string
  apiKeyHeader: string
  apiKeyValue: string
}

export type AuthProfile = {
  id: string
  name: string
  auth: AuthConfig
}

export type ResponseData = {
  statusCode: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeTotal: number
  sizeDownload: number
}

export type HistoryEntry = {
  id: string
  method: string
  url: string
  statusCode?: number
  timeTotal?: number
  createdAt: string
}

export type SavedState = {
  method: string
  url: string
  headers: KVEntry[]
  params: KVEntry[]
  body: string
  auth: AuthConfig
  history: HistoryEntry[]
  profiles: AuthProfile[]
  activeProfileId: string | null
  darkMode: boolean
}
