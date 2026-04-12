import type { HistoryEntry } from '../../types'
import { HistoryItem } from './HistoryItem'

interface HistorySidebarProps {
  history: HistoryEntry[]
  onSelectEntry: (entry: HistoryEntry) => void
  onClear: () => void
}

export function HistorySidebar({ history, onSelectEntry, onClear }: HistorySidebarProps) {
  return (
    <aside>
      <div className="sticky top-6 rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">History</h2>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-semibold text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-3 max-h-[calc(100vh-180px)] space-y-2 overflow-y-auto">
          {history.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              No requests yet.
            </p>
          ) : (
            history.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} onSelect={onSelectEntry} />
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
