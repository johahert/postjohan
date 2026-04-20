import { useState } from 'react'

export function JsonNode({ label, value, defaultOpen = true }: { label?: string; value: unknown; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  const labelEl = label !== undefined ? (
    <span style={{ color: 'var(--accent)' }}>"{label}"</span>
  ) : null

  const sep = labelEl ? <span style={{ color: 'var(--text2)' }}>: </span> : null

  if (value === null) {
    return <span>{labelEl}{sep}<span style={{ color: 'var(--text2)' }}>null</span></span>
  }

  if (typeof value === 'string') {
    return <span>{labelEl}{sep}<span style={{ color: '#5dbd7a', wordBreak: 'break-all' }}>"{value}"</span></span>
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span>{labelEl}{sep}<span style={{ color: '#d4924a' }}>{String(value)}</span></span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>{labelEl}{sep}<span style={{ color: 'var(--text2)' }}>[]</span></span>
    }
    return (
      <div style={{ minWidth: 0 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: 0 }}
        >
          <span style={{ display: 'inline-block', width: 12, fontSize: 9, lineHeight: 1 }}>{open ? '▼' : '▶'}</span>
          {labelEl}{sep}
          <span style={{ color: 'var(--text2)', fontSize: 10 }}>Array[{value.length}]</span>
        </button>
        {open && (
          <div style={{ marginLeft: 16, borderLeft: '1px solid var(--border2)', paddingLeft: 12 }}>
            {value.map((item, i) => (
              <div key={i} style={{ padding: '1px 0' }}>
                <JsonNode label={String(i)} value={item} defaultOpen={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return <span>{labelEl}{sep}<span style={{ color: 'var(--text2)' }}>{'{}'}</span></span>
    }
    return (
      <div style={{ minWidth: 0 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: 0 }}
        >
          <span style={{ display: 'inline-block', width: 12, fontSize: 9, lineHeight: 1 }}>{open ? '▼' : '▶'}</span>
          {labelEl}{sep}
          <span style={{ color: 'var(--text2)', fontSize: 10 }}>{`{${entries.length}}`}</span>
        </button>
        {open && (
          <div style={{ marginLeft: 16, borderLeft: '1px solid var(--border2)', paddingLeft: 12 }}>
            {entries.map(([k, v]) => (
              <div key={k} style={{ padding: '1px 0' }}>
                <JsonNode label={k} value={v} defaultOpen={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <span style={{ color: 'var(--text0)' }}>{String(value)}</span>
}
