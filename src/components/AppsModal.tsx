import { useState } from 'react'
import type { App } from '../types'

interface AppsModalProps {
  apps: App[]
  activeAppId: string | null
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onSetActive: (id: string | null) => void
  onClose: () => void
}

export function AppsModal({
  apps,
  activeAppId,
  onCreate,
  onRename,
  onDelete,
  onSetActive,
  onClose,
}: AppsModalProps) {
  const [name, setName] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim())
    setName('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Apps</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {apps.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500">No apps yet.</p>
          )}
          {apps.map((app) => (
            <div key={app.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="active-app"
                checked={activeAppId === app.id}
                onChange={() => onSetActive(app.id)}
                aria-label="Set active"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <input
                value={app.name}
                onChange={(e) => onRename(app.id, e.target.value)}
                placeholder="App name"
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
              <button
                onClick={() => onDelete(app.id)}
                aria-label="Delete app"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New app name"
            className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
