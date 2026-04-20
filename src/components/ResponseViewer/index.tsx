import { useState } from 'react'
import type { ResponseData } from '../../types'
import { isJsonContentType, tryParseJson } from '../../utils/httpUtils'
import { JsonNode } from '../JsonNode'
import { TypesModal } from '../TypesModal'
import { FalconSVG } from '../FalconSVG'

interface ResponseViewerProps {
  response: ResponseData | null
  error: string | null
  finalUrl: string
  showTypesModal: boolean
  onShowTypesModal: (show: boolean) => void
  isSending: boolean
  isSendingStage: string
}

function StatusBadge({ status }: { status: number }) {
  const isOk  = status < 300
  const isRed = status >= 400
  return (
    <span
      className={`font-mono font-semibold text-[12px] px-2 py-px rounded-sm
        ${isOk  ? 'text-[#5dbd7a] bg-[rgba(93,189,122,0.12)]'  : ''}
        ${isRed ? 'text-[#cc5c5c] bg-[rgba(204,92,92,0.12)]'   : ''}
        ${!isOk && !isRed ? 'text-[#d4924a] bg-[rgba(212,146,74,0.12)]' : ''}`}
    >
      {status}
    </span>
  )
}

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <div className="p-5 flex flex-col gap-2.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="shimmer-line shrink-0" style={{ width: 8 + (i % 3) * 4, height: 12 }} />
          <div className="shimmer-line" style={{ width: `${40 + (i * 17) % 45}%`, height: 12 }} />
          <div className="shimmer-line ml-auto" style={{ width: `${15 + (i * 11) % 25}%`, height: 12 }} />
        </div>
      ))}
    </div>
  )
}

function ProgressStrip({ stage }: { stage: string }) {
  return (
    <div className="p-5 border-b border-edge">
      <p className="text-[10px] font-mono text-ink-3 uppercase tracking-[0.08em] mb-3">
        {stage === 'connecting' ? 'Establishing connection'
         : stage === 'sending'  ? 'Transmitting request'
         : 'Streaming response'}
      </p>
      <div className="flex gap-[2.5px]">
        {Array.from({ length: 36 }, (_, i) => {
          const filled = stage === 'connecting' ? i < 9
                       : stage === 'sending'    ? i < 22
                       : i < 30
          return (
            <div
              key={i}
              className={`flex-1 h-[3px] rounded-sm transition-colors duration-300
                ${filled ? 'bg-accent' : 'bg-layer-3'}`}
              style={{ transitionDelay: `${i * 0.018}s` }}
            />
          )
        })}
      </div>
    </div>
  )
}

function TickIndicator({ stage }: { stage: string }) {
  return (
    <div className="flex items-center gap-2 ml-1.5">
      <div className="flex gap-[3px]">
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="w-[3px] h-[10px] rounded-sm bg-accent opacity-[0.15]"
            style={{ animation: `tickPulse 1.6s ${(i / 14) * 1.6}s infinite` }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono text-ink-3">{stage}…</span>
    </div>
  )
}

type ResTab = 'body' | 'headers' | 'cookies'

export function ResponseViewer({
  response, error, finalUrl, showTypesModal, onShowTypesModal,
  isSending, isSendingStage,
}: ResponseViewerProps) {
  const [resTab, setResTab] = useState<ResTab>('body')
  const parsedBody = response ? tryParseJson(response.body ?? '') : undefined

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header row */}
      <div className="h-10 border-b border-edge bg-layer-1 flex items-center px-4 gap-2 shrink-0">
        <span className="text-[12px] font-medium text-ink">Response</span>

        {/* Status + timing */}
        {response && (
          <div className="flex items-center gap-2.5 ml-1.5">
            <StatusBadge status={response.statusCode} />
            <span className="text-[11px] font-mono text-ink-3">{response.statusText}</span>
            <span className="text-[11px] text-edge-strong">·</span>
            <span className="text-[11px] font-mono text-ink-2">{response.timeTotal}ms</span>
            <span className="text-[11px] text-edge-strong">·</span>
            <span className="text-[11px] font-mono text-ink-2">
              {(response.sizeDownload / 1024).toFixed(2)} KB
            </span>
          </div>
        )}

        {/* Loading tick indicator */}
        {isSending && <TickIndicator stage={isSendingStage} />}

        <div className="flex-1" />

        {/* TS Types button */}
        {response && parsedBody !== undefined && (
          <button
            onClick={() => onShowTypesModal(true)}
            className="bg-layer-2 border border-edge text-accent rounded px-2.5 py-[3px] text-[10px] font-semibold font-sans hover:border-accent transition-colors"
          >
            {'{ } TS Types'}
          </button>
        )}

        {/* Response sub-tabs */}
        {response && (['body', 'headers', 'cookies'] as ResTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setResTab(t)}
            className={`px-3 py-[8px] -my-px text-[12px] font-sans border-b-2 transition-colors capitalize
              ${resTab === t
                ? 'text-ink border-accent font-medium'
                : 'text-ink-3 border-transparent hover:text-ink-2'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-layer-0">
        {/* Empty state */}
        {!isSending && !response && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FalconSVG size={64} color="var(--accent)" />
            <div className="text-center">
              <p className="text-[13px] font-medium text-ink-2 mb-1">Ready to send</p>
              <p className="text-[12px] text-ink-3">
                Press{' '}
                <kbd className="bg-layer-2 border border-edge rounded px-1.5 py-px font-mono text-[11px]">
                  ⌘ Enter
                </kbd>{' '}
                to fire
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="m-4 rounded-[6px] border border-[rgba(204,92,92,0.3)] bg-[rgba(204,92,92,0.08)] p-3 text-[#cc5c5c] text-[12px] font-mono">
            {error}
          </div>
        )}

        {/* Loading */}
        {isSending && (
          <div className="anim-fade-in">
            <ProgressStrip stage={isSendingStage} />
            <SkeletonRows />
          </div>
        )}

        {/* Response content */}
        {!isSending && response && (
          <div className="anim-slide-up p-5">
            {resTab === 'body' && (
              <ResponseBody body={response.body ?? ''} headers={response.headers} />
            )}
            {resTab === 'headers' && (
              <div className="font-mono text-[12px] divide-y divide-edge">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-2">
                    <span className="text-[#5ab4d8] w-56 shrink-0">{k}</span>
                    <span className="text-ink-2">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {resTab === 'cookies' && (
              <p className="text-ink-3 text-[12px] font-mono">{'// No cookies in response'}</p>
            )}
          </div>
        )}
      </div>

      {showTypesModal && parsedBody !== undefined && (
        <TypesModal json={parsedBody} url={finalUrl} onClose={() => onShowTypesModal(false)} />
      )}
    </div>
  )
}

function ResponseBody({ body, headers }: { body: string; headers: Record<string, string> }) {
  if (!body) {
    return <p className="text-[12px] text-ink-3 font-mono">{'// No body returned'}</p>
  }
  const parsed = isJsonContentType(headers) ? tryParseJson(body) : undefined
  if (parsed !== undefined) {
    return (
      <div className="font-mono text-[12px] text-ink max-h-[500px] overflow-auto">
        <JsonNode value={parsed} defaultOpen />
      </div>
    )
  }
  return (
    <pre className="font-mono text-[12px] text-ink whitespace-pre-wrap break-words max-h-[500px] overflow-auto">
      {body}
    </pre>
  )
}
