import type { AuthConfig } from '../types'

// ── Constants ──────────────────────────────────────────────────────────

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

export const TABS = ['Headers', 'Params', 'Body', 'Auth'] as const

export type Tab = (typeof TABS)[number]

export const STORAGE_KEY = 'postjohan-state'

export const defaultAuth = (): AuthConfig => ({
  type: 'none',
  bearer: '',
  basicUser: '',
  basicPass: '',
  apiKeyHeader: 'X-API-Key',
  apiKeyValue: '',
})
