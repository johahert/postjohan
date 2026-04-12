import { useMemo, useState } from 'react'
import { generateTypesFromJson } from '../utils/typeGenerator'
import { highlightTs } from '../utils/highlighter'

// ── Helpers ────────────────────────────────────────────────────────────

type ModalTab = 'types' | 'useQuery'

const MODAL_TABS: { id: ModalTab; label: string }[] = [
  { id: 'types', label: 'Types' },
  { id: 'useQuery', label: 'useQuery Hook' },
]

function deriveQueryKeyAndName(url: string): { queryKey: string; hookName: string; fetchUrl: string } {
  try {
    const parsed = new URL(url)
    // Use path segments to build a meaningful name
    const segments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .map((s) => s.replace(/[^a-zA-Z0-9]/g, ''))

    if (segments.length === 0) {
      return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
    }

    // Use the last meaningful segment (skip numeric IDs for the name)
    const meaningful = segments.filter((s) => !/^\d+$/.test(s))
    const base = meaningful.length > 0 ? meaningful[meaningful.length - 1] : segments[0]
    const capitalized = base.charAt(0).toUpperCase() + base.slice(1)

    return {
      queryKey: segments.join('-'),
      hookName: `use${capitalized}`,
      fetchUrl: url,
    }
  } catch {
    return { queryKey: 'data', hookName: 'useData', fetchUrl: url }
  }
}

function generateUseQuerySnippet(types: string, url: string, isArray: boolean, prefix: string): string {
  const { queryKey, hookName, fetchUrl } = deriveQueryKeyAndName(url)
  const rootType = isArray ? `${prefix}[]` : prefix

  return `${types}

// ── ${hookName} ────────────────────────────────────────────────────────

async function fetch${hookName.slice(3)}(): Promise<${rootType}> {
  const res = await fetch('${fetchUrl}')
  if (!res.ok) throw new Error(\`Request failed: \$\{res.status\}\`)
  return res.json()
}

export function ${hookName}() {
  return useQuery({
    queryKey: ['${queryKey}'],
    queryFn: fetch${hookName.slice(3)},
  })
}`
}

// ── Types Modal ────────────────────────────────────────────────────────

export function TypesModal({
  json,
  url,
  onClose,
}: {
  json: unknown
  url: string
  onClose: () => void
}) {
  const [nested, setNested] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<ModalTab>('types')
  const [prefix, setPrefix] = useState('Response')
  const generated = useMemo(() => generateTypesFromJson(json, prefix, nested), [json, prefix, nested])
  const hookSnippet = useMemo(
    () => generateUseQuerySnippet(generated, url, Array.isArray(json), prefix),
    [generated, url, json, prefix],
  )

  const currentCode = activeTab === 'types' ? generated : hookSnippet

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Generated TypeScript
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex items-center gap-1 border-b border-slate-100 dark:border-slate-700">
          {MODAL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCopied(false) }}
              className={`px-4 py-2 text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={nested}
              onChange={(e) => setNested(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
            />
            Extract nested objects as separate interfaces
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            Prefix
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value || 'Response')}
              className="w-28 rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </label>
        </div>

        <div className="relative">
          <pre className="max-h-[400px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 dark:border-slate-700 dark:bg-slate-900">
            {highlightTs(currentCode)}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow transition hover:bg-indigo-500"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
