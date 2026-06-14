// ── Types ──────────────────────────────────────────────────────────────

export type KVEntry = { key: string; value: string; enabled: boolean }

// Param = KVEntry plus an optional list of suggested values (backward-compatible with KVEntry).
export type ParamEntry = KVEntry & { commonValues?: string[] }

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

export type Environment = {
  id: string
  name: string // "Staging"
  baseUrl: string // "https://staging.api.com"
}

export type Endpoint = {
  id: string
  name: string // "Get user"
  method: string // GET/POST/...
  path: string // "/users/1" (appended to the active env baseUrl)
  headers: KVEntry[]
  params: ParamEntry[]
  body: string
}

export type App = {
  id: string
  name: string
  environments: Environment[]
  activeEnvironmentId: string | null
  endpoints: Endpoint[]
}

export type SavedState = {
  method: string
  url: string
  headers: KVEntry[]
  params: ParamEntry[]
  body: string
  auth: AuthConfig
  history: HistoryEntry[]
  profiles: AuthProfile[]
  activeProfileId: string | null
  apps: App[]
  activeAppId: string | null
  darkMode: boolean
}
