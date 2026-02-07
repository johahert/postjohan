import { useMemo, useState } from 'react'
import { generateTypesFromJson, highlightTs } from '../utils'

// ── Types Modal ────────────────────────────────────────────────────────

export function TypesModal({
  json,
  onClose,
}: {
  json: unknown
  onClose: () => void
}) {
  const [nested, setNested] = useState(false)
  const [copied, setCopied] = useState(false)
  const generated = useMemo(() => generateTypesFromJson(json, 'Root', nested), [json, nested])

  const handleCopy = () => {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Generated TypeScript Types
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={nested}
              onChange={(e) => setNested(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
            />
            Extract nested objects as separate interfaces
          </label>
        </div>

        <div className="relative">
          <pre className="max-h-[400px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 dark:border-slate-700 dark:bg-slate-900">
            {highlightTs(generated)}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow transition hover:bg-indigo-500"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
