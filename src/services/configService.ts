import type { AuthProfile } from '../types'

interface ConfigData {
  profiles?: AuthProfile[]
  activeProfileId?: string | null
}

export async function fetchConfig(): Promise<ConfigData> {
  const res = await fetch('/api/config')
  if (!res.ok) throw new Error('Failed to fetch config')
  return res.json() as Promise<ConfigData>
}

export async function persistConfig(
  profiles: AuthProfile[],
  activeProfileId: string | null,
): Promise<void> {
  await fetch('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profiles, activeProfileId }),
  })
}
