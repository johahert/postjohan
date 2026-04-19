import type { ResponseData } from '../../types'

interface ResponseMetaProps {
  response: ResponseData
}

export function ResponseMeta({ response }: ResponseMetaProps) {
  const statusClass =
    response.statusCode < 300
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
      : response.statusCode < 400
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'

  return (
    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
      <span className={`rounded-full px-3 py-1 ${statusClass}`}>
        {response.statusCode} {response.statusText}
      </span>
      <span>{(response.timeTotal * 1000).toFixed(0)} ms</span>
      <span>{(response.sizeDownload / 1024).toFixed(1)} KB</span>
    </div>
  )
}
