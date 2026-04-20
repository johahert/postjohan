import type { KVEntry } from '../types'

interface KVEditorProps {
  items: KVEntry[]
  onAdd: () => void
  onChange: (index: number, field: keyof KVEntry, value: string | boolean) => void
  onRemove: (index: number) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

const inputCls = 'flex-1 h-8 bg-layer-2 border border-edge rounded-[5px] px-2.5 text-ink font-mono text-[12px] outline-none placeholder-ink-3 min-w-0'

export function KVEditor({
  items, onAdd, onChange, onRemove,
  keyPlaceholder = 'Key', valuePlaceholder = 'Value',
}: KVEditorProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-1.5">
        {items.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={entry.enabled}
              onChange={(e) => onChange(i, 'enabled', e.target.checked)}
              className="accent-accent cursor-pointer shrink-0"
            />
            <input
              value={entry.key}
              onChange={(e) => onChange(i, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className={inputCls}
            />
            <input
              value={entry.value}
              onChange={(e) => onChange(i, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className={inputCls}
            />
            <button
              onClick={() => onRemove(i)}
              aria-label="Remove"
              className="text-ink-3 hover:text-red-400 text-[15px] px-1 transition-colors shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-2 border border-dashed border-edge-strong text-ink-3 hover:text-accent hover:border-accent rounded-[5px] px-3 py-[5px] text-[12px] font-sans transition-colors"
      >
        + Add row
      </button>
    </div>
  )
}
