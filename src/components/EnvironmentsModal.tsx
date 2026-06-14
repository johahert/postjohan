import { useState } from 'react'
import type { Environment } from '../types'

interface EnvironmentsModalProps {
  appName: string
  environments: Environment[]
  activeEnvironmentId: string | null
  onAdd: (name: string, baseUrl: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Environment, 'id'>>) => void
  onDelete: (id: string) => void
  onSetActive: (id: string | null) => void
  onClose: () => void
}

export function EnvironmentsModal({
  appName,
  environments,
  activeEnvironmentId,
  onAdd,
  onUpdate,
  onDelete,
  onSetActive,
  onClose,
}: EnvironmentsModalProps) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim(), baseUrl.trim())
    setName('')
    setBaseUrl('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Environments — {appName}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Existing environments */}
        <div className="space-y-2">
          {environments.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500">No environments yet.</p>
          )}
          {environments.map((env) => (
            <div key={env.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="active-env"
                checked={activeEnvironmentId === env.id}
                onChange={() => onSetActive(env.id)}
                aria-label="Set active"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <input
                value={env.name}
                onChange={(e) => onUpdate(env.id, { name: e.target.value })}
                placeholder="Name"
                className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
              <input
                value={env.baseUrl}
                onChange={(e) => onUpdate(env.id, { baseUrl: e.target.value })}
                placeholder="https://staging.example.com"
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
              <button
                onClick={() => onDelete(env.id)}
                aria-label="Delete environment"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Staging)"
            className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Base URL"
            className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
