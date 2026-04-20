import { useState } from 'react'
import type { HistoryEntry } from '../types'

const METHOD_COLOR: Record<string, string> = {
  GET: '#5dbd7a', POST: '#5ab4d8', PUT: '#e09a4d', PATCH: '#9d7fe0', DELETE: '#cc5c5c',
}

function MethodLabel({ method }: { method: string }) {
  return (
    <span
      className="font-mono font-semibold text-[10px] w-9 shrink-0"
      style={{ color: METHOD_COLOR[method] ?? '#9dada2' }}
    >
      {method}
    </span>
  )
}

function StatusDot({ statusCode }: { statusCode: number }) {
  const color = statusCode < 300 ? '#5dbd7a' : statusCode < 400 ? '#d4924a' : '#cc5c5c'
  return (
    <span className="font-mono font-semibold text-[9px] shrink-0" style={{ color }}>
      {statusCode}
    </span>
  )
}

interface CollectionsSidebarProps {
  history: HistoryEntry[]
  onSelectEntry: (entry: HistoryEntry) => void
  onClear: () => void
  onNewRequest: () => void
}

export function CollectionsSidebar({
  history, onSelectEntry, onClear, onNewRequest,
}: CollectionsSidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState('')

  const filtered = search
    ? history.filter(
        (e) =>
          e.url.toLowerCase().includes(search.toLowerCase()) ||
          e.method.toLowerCase().includes(search.toLowerCase()),
      )
    : history

  return (
    <aside className="w-sidebar border-r border-edge bg-layer-1 flex flex-col overflow-hidden shrink-0">
      {/* Search bar */}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5 bg-layer-2 border border-edge rounded-[6px] px-2.5">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="5" stroke="var(--text2)" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="bg-transparent border-none outline-none text-ink placeholder-ink-3 font-sans text-[12px] py-[7px] flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Collection list */}
      <div className="overflow-auto flex-1">
        {/* Collection header row */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-[7px] hover:bg-layer-2 transition-colors text-left"
        >
          <svg
            width="9" height="9" viewBox="0 0 9 9" fill="none"
            className="shrink-0 transition-transform duration-150 text-ink-3"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            <path d="M2.5 1.5l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono font-semibold text-[10px] text-accent bg-accent-dim px-[5px] py-px rounded-sm">
            RC
          </span>
          <span className="text-xs font-medium text-ink-2 flex-1 text-left">Recent</span>
          <span className="text-[10px] text-ink-3">{history.length}</span>
        </button>

        {/* History entries */}
        {expanded && (
          filtered.length === 0 ? (
            <p className="pl-[26px] pr-3 py-2 text-[11px] text-ink-3 italic">
              {search ? 'No matches' : 'No requests yet'}
            </p>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="w-full flex items-center gap-2 px-3 py-[5px] pl-[26px] hover:bg-layer-2 transition-colors text-left group"
              >
                <MethodLabel method={entry.method} />
                <span className="text-[11px] text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  {entry.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                </span>
                {entry.statusCode && <StatusDot statusCode={entry.statusCode} />}
              </button>
            ))
          )
        )}
      </div>

      {/* Footer actions */}
      <div className="p-2.5 border-t border-edge flex flex-col gap-1.5">
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="w-full text-[11px] text-ink-3 hover:text-red-400 border border-dashed border-edge-strong rounded-[6px] py-[5px] transition-colors font-sans"
          >
            Clear history
          </button>
        )}
        <button
          onClick={onNewRequest}
          className="w-full text-xs font-medium text-accent bg-accent-dim border border-accent-glow rounded-[6px] py-[7px] hover:brightness-110 transition-all font-sans"
        >
          + New Request
        </button>
      </div>
    </aside>
  )
}
