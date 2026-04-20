import type { CSSProperties } from 'react'
import type { KVEntry } from '../types'

const inputStyle: CSSProperties = {
  height: 32, flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '0 10px', color: 'var(--text0)',
  fontFamily: "'JetBrains Mono',monospace", fontSize: 12, outline: 'none',
}

interface KVEditorProps {
  items: KVEntry[]
  onAdd: () => void
  onChange: (index: number, field: keyof KVEntry, value: string | boolean) => void
  onRemove: (index: number) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export function KVEditor({
  items,
  onAdd,
  onChange,
  onRemove,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KVEditorProps) {
  return (
    <div style={{ padding: '12px 16px' }}>
      {items.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={entry.enabled}
            onChange={(e) => onChange(index, 'enabled', e.target.checked)}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <input
            value={entry.key}
            onChange={(e) => onChange(index, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            style={inputStyle}
          />
          <input
            value={entry.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            style={inputStyle}
          />
          <button
            onClick={() => onRemove(index)}
            aria-label="Remove item"
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 15, padding: '0 4px', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#cc5c5c' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        style={{
          background: 'none', border: '1px dashed var(--border2)', color: 'var(--text2)',
          borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
          fontSize: 12, fontFamily: "'Inter',sans-serif", marginTop: 4, transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--accent)'; el.style.borderColor = 'var(--accent)' }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--text2)'; el.style.borderColor = 'var(--border2)' }}
      >
        + Add row
      </button>
    </div>
  )
}
