import { useState } from 'react'

export function JsonNode({
  label, value, defaultOpen = true,
}: {
  label?: string
  value: unknown
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  const keyEl = label !== undefined
    ? <span className="text-accent">"{label}"</span>
    : null
  const sep = keyEl ? <span className="text-ink-3">: </span> : null

  if (value === null) {
    return <span>{keyEl}{sep}<span className="text-ink-3">null</span></span>
  }

  if (typeof value === 'string') {
    return (
      <span>
        {keyEl}{sep}
        <span className="text-method-get break-all">"{value}"</span>
      </span>
    )
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return (
      <span>
        {keyEl}{sep}
        <span className="text-method-put">{String(value)}</span>
      </span>
    )
  }

  const isArray = Array.isArray(value)
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>)

  if (entries.length === 0) {
    return (
      <span>
        {keyEl}{sep}
        <span className="text-ink-3">{isArray ? '[]' : '{}'}</span>
      </span>
    )
  }

  const summary = isArray ? `Array[${entries.length}]` : `{${entries.length}}`

  return (
    <div className="min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-ink-3 hover:text-ink-2 transition-colors font-mono text-[12px]"
      >
        <span className="w-3 text-[9px] leading-none">{open ? '▼' : '▶'}</span>
        {keyEl}{sep}
        <span className="text-[10px] text-ink-3">{summary}</span>
      </button>

      {open && (
        <div className="ml-4 border-l border-edge-strong pl-3">
          {entries.map(([k, v]) => (
            <div key={k} className="py-px">
              <JsonNode label={k} value={v} defaultOpen={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
