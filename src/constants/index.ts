import type { App, AuthConfig, Endpoint, Environment } from '../types'

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

// ── Factory helpers ────────────────────────────────────────────────────

export const newApp = (name: string): App => ({
  id: crypto.randomUUID(),
  name,
  environments: [],
  activeEnvironmentId: null,
  endpoints: [],
})

export const newEnvironment = (name: string, baseUrl = ''): Environment => ({
  id: crypto.randomUUID(),
  name,
  baseUrl,
})

export const newEndpoint = (partial: Omit<Endpoint, 'id'>): Endpoint => ({
  id: crypto.randomUUID(),
  ...partial,
})
