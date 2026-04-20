import { useState } from 'react'
import type { HistoryEntry } from '../types'

const METHOD_COLORS: Record<string, string> = {
  GET: '#5dbd7a', POST: '#5ab4d8', PUT: '#e09a4d', PATCH: '#9d7fe0', DELETE: '#cc5c5c',
}

interface CollectionsSidebarProps {
  history: HistoryEntry[]
  onSelectEntry: (entry: HistoryEntry) => void
  onClear: () => void
  onNewRequest: () => void
  accent: string
  accentDim: string
  accentGlow: string
}

export function CollectionsSidebar({
  history,
  onSelectEntry,
  onClear,
  onNewRequest,
  accent,
  accentDim,
  accentGlow,
}: CollectionsSidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState('')

  const filtered = history.filter(
    (e) =>
      !search ||
      e.url.toLowerCase().includes(search.toLowerCase()) ||
      e.method.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div style={{
      width: 236, borderRight: '1px solid var(--border)', flexShrink: 0,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg1)',
    }}>
      {/* Search */}
      <div style={{ padding: '10px 10px 8px' }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6,
          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
        }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="var(--text2)" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            style={{
              background: 'none', border: 'none', color: 'var(--text0)',
              fontFamily: "'Inter',sans-serif", fontSize: 12,
              padding: '7px 0', outline: 'none', flex: 1,
            }}
          />
        </div>
      </div>

      {/* Recent requests collection */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {/* Collection header */}
        <div
          onClick={() => setExpanded((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', userSelect: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none' }}
        >
          <svg
            width="9" height="9" viewBox="0 0 9 9" fill="none"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', color: 'var(--text2)', flexShrink: 0 }}
          >
            <path d="M2.5 1.5l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
            color: accent, background: accentDim, padding: '1px 5px', borderRadius: 2,
          }}>RC</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text1)', flex: 1 }}>Recent</span>
          <span style={{ fontSize: 10, color: 'var(--text2)' }}>{history.length}</span>
        </div>

        {/* History entries */}
        {expanded && (
          filtered.length === 0 ? (
            <div style={{ padding: '12px 16px 12px 26px', fontSize: 11, color: 'var(--text2)', fontStyle: 'italic' }}>
              {search ? 'No matches' : 'No requests yet'}
            </div>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 26px', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg2)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none' }}
              >
                <span style={{
                  color: METHOD_COLORS[entry.method] ?? '#9dada2',
                  fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 10,
                  minWidth: 36, display: 'inline-block',
                }}>
                  {entry.method}
                </span>
                <span style={{
                  fontSize: 11, color: 'var(--text1)', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>
                  {entry.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                </span>
                {entry.statusCode && (
                  <span style={{
                    fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                    color: entry.statusCode < 300 ? '#5dbd7a' : entry.statusCode < 400 ? '#d4924a' : '#cc5c5c',
                  }}>
                    {entry.statusCode}
                  </span>
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {history.length > 0 && (
          <button
            onClick={onClear}
            style={{
              width: '100%', background: 'none', border: '1px dashed var(--border2)',
              color: 'var(--text2)', borderRadius: 6, padding: '5px', cursor: 'pointer',
              fontFamily: "'Inter',sans-serif", fontSize: 11, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#cc5c5c'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#cc5c5c' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)' }}
          >
            Clear history
          </button>
        )}
        <button
          onClick={onNewRequest}
          style={{
            width: '100%', background: accentDim, border: `1px solid ${accentGlow}`,
            color: accent, borderRadius: 6, padding: '7px',
            fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}
        >
          + New Request
        </button>
      </div>
    </div>
  )
}
