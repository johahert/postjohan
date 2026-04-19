import type { KVEntry } from '../types'

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
    <div className="mt-4 space-y-2">
      {items.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={entry.enabled}
            onChange={(e) => onChange(index, 'enabled', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
          />
          <input
            value={entry.key}
            onChange={(e) => onChange(index, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-indigo-500"
          />
          <input
            value={entry.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-indigo-500"
          />
          <button
            onClick={() => onRemove(index)}
            aria-label="Remove item"
            className="rounded px-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="rounded-lg border border-dashed border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        + Add
      </button>
    </div>
  )
}
