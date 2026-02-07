import { useState } from 'react'

// ── Collapsible JSON Viewer ────────────────────────────────────────────

export function JsonNode({ label, value, defaultOpen = true }: { label?: string; value: unknown; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  const labelEl = label !== undefined ? (
    <span className="text-indigo-600 dark:text-indigo-400">"{label}"</span>
  ) : null

  // null
  if (value === null) {
    return (
      <span>
        {labelEl}{labelEl && <span className="text-slate-500">: </span>}
        <span className="text-slate-400 dark:text-slate-500">null</span>
      </span>
    )
  }

  // primitives
  if (typeof value === 'string') {
    return (
      <span>
        {labelEl}{labelEl && <span className="text-slate-500">: </span>}
        <span className="text-emerald-600 dark:text-emerald-400 break-all">"{value}"</span>
      </span>
    )
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return (
      <span>
        {labelEl}{labelEl && <span className="text-slate-500">: </span>}
        <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>
      </span>
    )
  }

  // arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span>
          {labelEl}{labelEl && <span className="text-slate-500">: </span>}
          <span className="text-slate-500">[]</span>
        </span>
      )
    }
    return (
      <div className="min-w-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className="inline-block w-3 text-[10px] leading-none">{open ? '▼' : '▶'}</span>
          {labelEl}{labelEl && <span className="text-slate-500">: </span>}
          <span className="text-slate-400 text-[10px]">Array[{value.length}]</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-slate-200 pl-3 dark:border-slate-700">
            {value.map((item, i) => (
              <div key={i} className="py-[1px]">
                <JsonNode label={String(i)} value={item} defaultOpen={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // objects
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return (
        <span>
          {labelEl}{labelEl && <span className="text-slate-500">: </span>}
          <span className="text-slate-500">{'{}'}</span>
        </span>
      )
    }
    return (
      <div className="min-w-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className="inline-block w-3 text-[10px] leading-none">{open ? '▼' : '▶'}</span>
          {labelEl}{labelEl && <span className="text-slate-500">: </span>}
          <span className="text-slate-400 text-[10px]">{`{${entries.length}}`}</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-slate-200 pl-3 dark:border-slate-700">
            {entries.map(([k, v]) => (
              <div key={k} className="py-[1px]">
                <JsonNode label={k} value={v} defaultOpen={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <span>{String(value)}</span>
}
