import type { ResponseData } from '../../types'
import { isJsonContentType, tryParseJson } from '../../utils/httpUtils'
import { JsonNode } from '../JsonNode'
import { TypesModal } from '../TypesModal'
import { ResponseMeta } from './ResponseMeta'

interface ResponseViewerProps {
  response: ResponseData | null
  error: string | null
  finalUrl: string
  showTypesModal: boolean
  onShowTypesModal: (show: boolean) => void
}

export function ResponseViewer({
  response,
  error,
  finalUrl,
  showTypesModal,
  onShowTypesModal,
}: ResponseViewerProps) {
  const parsedBody = response ? tryParseJson(response.body || '') : undefined

  return (
    <div className="rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Response</h2>
        {response && <ResponseMeta response={response} />}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </div>
      )}

      {!error && !response && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
          Send a request to see the response here.
        </div>
      )}

      {response && (
        <div className="mt-4 space-y-4">
          {/* Body */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                Body
              </p>
              {parsedBody !== undefined && (
                <button
                  onClick={() => onShowTypesModal(true)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-700 dark:text-indigo-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30"
                  title="Generate TypeScript types from response"
                >
                  {'{ } TS Types'}
                </button>
              )}
            </div>
            <ResponseBody body={response.body || ''} headers={response.headers} />
          </div>

          {/* Response headers */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
              Response Headers
            </p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-400">
              {Object.entries(response.headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            </pre>
          </div>
        </div>
      )}

      {showTypesModal && parsedBody !== undefined && (
        <TypesModal
          json={parsedBody}
          url={finalUrl}
          onClose={() => onShowTypesModal(false)}
        />
      )}
    </div>
  )
}

// ── ResponseBody ──────────────────────────────────────────────────────────

interface ResponseBodyProps {
  body: string
  headers: Record<string, string>
}

function ResponseBody({ body, headers }: ResponseBodyProps) {
  if (!body) {
    return <p className="text-xs text-slate-400 dark:text-slate-500">No body returned</p>
  }

  const isJson = isJsonContentType(headers)
  const parsed = isJson ? tryParseJson(body) : undefined

  if (parsed !== undefined) {
    return (
      <div className="max-h-[500px] overflow-auto font-mono text-sm text-slate-700 dark:text-slate-300">
        <JsonNode value={parsed} defaultOpen={true} />
      </div>
    )
  }

  return (
    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-slate-700 dark:text-slate-300">
      {body}
    </pre>
  )
}
