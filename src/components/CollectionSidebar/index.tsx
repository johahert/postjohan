import { useState } from 'react'
import type { Endpoint } from '../../types'
import type { useApps } from '../../hooks/useApps'
import { AppsModal } from '../AppsModal'
import { EnvironmentsModal } from '../EnvironmentsModal'

interface CollectionSidebarProps {
  apps: ReturnType<typeof useApps>
  loadedEndpointId: string | null
  onLoadEndpoint: (endpoint: Endpoint) => void
}

export function CollectionSidebar({ apps, loadedEndpointId, onLoadEndpoint }: CollectionSidebarProps) {
  const [showAppsModal, setShowAppsModal] = useState(false)
  const [showEnvModal, setShowEnvModal] = useState(false)

  const { activeApp, activeEnvironment } = apps

  return (
    <aside className="space-y-4 rounded-2xl bg-white/80 p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
      {/* App selector */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">App</p>
          <button
            onClick={() => setShowAppsModal(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Manage
          </button>
        </div>
        <select
          value={apps.activeAppId ?? ''}
          onChange={(e) => apps.setActiveAppId(e.target.value || null)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="">— Select app —</option>
          {apps.apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {!activeApp && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Create an app to save environments and endpoints.
        </p>
      )}

      {activeApp && (
        <>
          {/* Environment switcher */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                Environment
              </p>
              <button
                onClick={() => setShowEnvModal(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Manage
              </button>
            </div>
            <select
              value={activeApp.activeEnvironmentId ?? ''}
              onChange={(e) => apps.setActiveEnvironmentId(e.target.value || null)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">— No environment —</option>
              {activeApp.environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
            {activeEnvironment && (
              <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">
                {activeEnvironment.baseUrl || 'no base URL'}
              </p>
            )}
          </div>

          {/* Endpoints */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
              Endpoints
            </p>
            <div className="space-y-1">
              {activeApp.endpoints.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No saved endpoints. Build a request and “Save as endpoint”.
                </p>
              )}
              {activeApp.endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition ${
                    loadedEndpointId === ep.id
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30'
                      : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-600 dark:bg-slate-700'
                  }`}
                >
                  <button
                    onClick={() => onLoadEndpoint(ep)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="shrink-0 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {ep.method}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-200">{ep.name}</span>
                  </button>
                  <button
                    onClick={() => apps.deleteEndpoint(ep.id)}
                    aria-label="Delete endpoint"
                    className="shrink-0 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showAppsModal && (
        <AppsModal
          apps={apps.apps}
          activeAppId={apps.activeAppId}
          onCreate={apps.createApp}
          onRename={apps.renameApp}
          onDelete={apps.deleteApp}
          onSetActive={apps.setActiveAppId}
          onClose={() => setShowAppsModal(false)}
        />
      )}

      {showEnvModal && activeApp && (
        <EnvironmentsModal
          appName={activeApp.name}
          environments={activeApp.environments}
          activeEnvironmentId={activeApp.activeEnvironmentId}
          onAdd={apps.addEnvironment}
          onUpdate={apps.updateEnvironment}
          onDelete={apps.deleteEnvironment}
          onSetActive={apps.setActiveEnvironmentId}
          onClose={() => setShowEnvModal(false)}
        />
      )}
    </aside>
  )
}
