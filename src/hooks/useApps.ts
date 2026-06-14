import { useMemo, useState } from 'react'
import type { App, Endpoint, Environment } from '../types'
import { newApp, newEndpoint, newEnvironment } from '../constants'

export function useApps(initialApps: App[] = [], initialActiveAppId: string | null = null) {
  const [apps, setApps] = useState<App[]>(initialApps)
  const [activeAppId, setActiveAppId] = useState<string | null>(initialActiveAppId)

  const activeApp = useMemo(
    () => apps.find((a) => a.id === activeAppId) ?? null,
    [apps, activeAppId],
  )

  const activeEnvironment = useMemo(
    () => activeApp?.environments.find((e) => e.id === activeApp.activeEnvironmentId) ?? null,
    [activeApp],
  )

  // ── Helpers ────────────────────────────────────────────────────────────

  // Apply an updater to the active app immutably.
  const updateActiveApp = (updater: (app: App) => App) => {
    setApps((prev) => prev.map((a) => (a.id === activeAppId ? updater(a) : a)))
  }

  // ── Apps ───────────────────────────────────────────────────────────────

  const createApp = (name: string) => {
    if (!name.trim()) return
    const app = newApp(name.trim())
    setApps((prev) => [...prev, app])
    setActiveAppId(app.id)
  }

  const renameApp = (id: string, name: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)))
  }

  const deleteApp = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id))
    if (activeAppId === id) setActiveAppId(null)
  }

  // ── Environments (operate on the active app) ─────────────────────────────

  const addEnvironment = (name: string, baseUrl = '') => {
    if (!name.trim()) return
    const env = newEnvironment(name.trim(), baseUrl)
    updateActiveApp((app) => ({
      ...app,
      environments: [...app.environments, env],
      // Auto-select the first environment added.
      activeEnvironmentId: app.activeEnvironmentId ?? env.id,
    }))
  }

  const updateEnvironment = (id: string, patch: Partial<Omit<Environment, 'id'>>) => {
    updateActiveApp((app) => ({
      ...app,
      environments: app.environments.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  }

  const deleteEnvironment = (id: string) => {
    updateActiveApp((app) => ({
      ...app,
      environments: app.environments.filter((e) => e.id !== id),
      activeEnvironmentId: app.activeEnvironmentId === id ? null : app.activeEnvironmentId,
    }))
  }

  const setActiveEnvironmentId = (id: string | null) => {
    updateActiveApp((app) => ({ ...app, activeEnvironmentId: id }))
  }

  // ── Endpoints (operate on the active app) ────────────────────────────────

  const addEndpoint = (partial: Omit<Endpoint, 'id'>): Endpoint => {
    const endpoint = newEndpoint(partial)
    updateActiveApp((app) => ({ ...app, endpoints: [...app.endpoints, endpoint] }))
    return endpoint
  }

  const updateEndpoint = (id: string, patch: Partial<Omit<Endpoint, 'id'>>) => {
    updateActiveApp((app) => ({
      ...app,
      endpoints: app.endpoints.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  }

  const deleteEndpoint = (id: string) => {
    updateActiveApp((app) => ({
      ...app,
      endpoints: app.endpoints.filter((e) => e.id !== id),
    }))
  }

  return {
    apps, setApps,
    activeAppId, setActiveAppId,
    activeApp,
    activeEnvironment,
    createApp,
    renameApp,
    deleteApp,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironmentId,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
  }
}
