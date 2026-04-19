import type { HistoryEntry } from '../../types'

const METHOD_COLOR: Record<string, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-amber-600 dark:text-amber-400',
  PUT: 'text-blue-600 dark:text-blue-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  DELETE: 'text-rose-600 dark:text-rose-400',
  HEAD: 'text-slate-600 dark:text-slate-400',
  OPTIONS: 'text-cyan-600 dark:text-cyan-400',
}

interface HistoryItemProps {
  entry: HistoryEntry
  onSelect: (entry: HistoryEntry) => void
}

export function HistoryItem({ entry, onSelect }: HistoryItemProps) {
  const statusClass = entry.statusCode
    ? entry.statusCode < 300
      ? 'text-emerald-600 dark:text-emerald-400'
      : entry.statusCode < 400
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'
    : 'text-slate-300 dark:text-slate-600'

  return (
    <button
      onClick={() => onSelect(entry)}
      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-xs shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
    >
      <div className="flex items-center justify-between">
        <span className={`font-bold ${METHOD_COLOR[entry.method] ?? ''}`}>{entry.method}</span>
        <span className={statusClass}>{entry.statusCode ?? '—'}</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{entry.url}</p>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>{entry.createdAt}</span>
        {entry.timeTotal !== undefined && (
          <span>{(entry.timeTotal * 1000).toFixed(0)} ms</span>
        )}
      </div>
    </button>
  )
}
