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
  accent: string
}

function StatusBadge({ status }: { status: number }) {
  const color = status < 300 ? '#5dbd7a' : status < 400 ? '#d4924a' : '#cc5c5c'
  const bg = status < 300 ? 'rgba(93,189,122,0.12)' : status < 400 ? 'rgba(212,146,74,0.12)' : 'rgba(204,92,92,0.12)'
  return (
    <span style={{
      color, background: bg, padding: '2px 8px', borderRadius: 3,
      fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 12,
    }}>
      {status}
    </span>
  )
}

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="shimmer-line" style={{ width: 8 + (i % 3) * 4, height: 12, flexShrink: 0 }} />
          <div className="shimmer-line" style={{ width: `${40 + (i * 17) % 45}%`, height: 12 }} />
          <div className="shimmer-line" style={{ width: `${15 + (i * 11) % 25}%`, height: 12, marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  )
}

function ResponseBody({ body, headers }: { body: string; headers: Record<string, string> }) {
  if (!body) {
    return <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace" }}>{'// No body returned'}</p>
  }
  const isJson = isJsonContentType(headers)
  const parsed = isJson ? tryParseJson(body) : undefined
  if (parsed !== undefined) {
    return (
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text0)' }}>
        <JsonNode value={parsed} defaultOpen={true} />
      </div>
    )
  }
  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text0)' }}>
      {body}
    </pre>
  )
}

export function ResponseViewer({
  response, error, finalUrl, showTypesModal, onShowTypesModal, isSending, isSendingStage, accent,
}: ResponseViewerProps) {
  const [resTab, setResTab] = useState<'body' | 'headers' | 'cookies'>('body')
  const parsedBody = response ? tryParseJson(response.body || '') : undefined

  const stageName =
    isSendingStage === 'connecting' ? 'Establishing connection' :
    isSendingStage === 'sending' ? 'Transmitting request' : 'Streaming response'

  const stageLabel =
    isSendingStage === 'connecting' ? 'connecting' :
    isSendingStage === 'sending' ? 'sending' : 'receiving'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--bg1)', gap: 8, height: 40,
      }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text0)' }}>Response</span>

        {response && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
            <StatusBadge status={response.statusCode} />
            <span style={{ color: 'var(--text2)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
              {response.statusText}
            </span>
            <span style={{ color: 'var(--text2)', fontSize: 11 }}>·</span>
            <span style={{ color: 'var(--text1)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
              {response.timeTotal}ms
            </span>
            <span style={{ color: 'var(--text2)', fontSize: 11 }}>·</span>
            <span style={{ color: 'var(--text1)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
              {(response.sizeDownload / 1024).toFixed(2)} KB
            </span>
          </div>
        )}

        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{
                  width: 3, height: 10, borderRadius: 1, background: accent,
                  animation: `tickPulse 1.6s ${(i / 14) * 1.6}s infinite`, opacity: 0.15,
                }} />
              ))}
            </div>
            <span style={{ color: 'var(--text2)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
              {stageLabel}…
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {response && parsedBody !== undefined && (
          <button
            onClick={() => onShowTypesModal(true)}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', color: accent,
              borderRadius: 4, padding: '3px 10px', fontSize: 10, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
          >
            {'{ } TS Types'}
          </button>
        )}

        {response && (
          <div style={{ display: 'flex' }}>
            {(['body', 'headers', 'cookies'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setResTab(t)}
                style={{
                  padding: '8px 12px', background: 'none', border: 'none',
                  color: resTab === t ? 'var(--text0)' : 'var(--text2)',
                  fontFamily: "'Inter',sans-serif", fontSize: 12, cursor: 'pointer',
                  borderBottom: resTab === t ? `2px solid ${accent}` : '2px solid transparent',
                  marginBottom: -1, textTransform: 'capitalize', fontWeight: resTab === t ? 500 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body area */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg0)' }}>
        {!isSending && !response && !error && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 16,
          }}>
            <FalconSVG size={64} color={accent} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 500, marginBottom: 4 }}>Ready to send</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                Press{' '}
                <kbd style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 3, padding: '2px 6px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                }}>
                  ⌘ Enter
                </kbd>{' '}
                to fire
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            margin: '16px 24px', borderRadius: 6, border: '1px solid rgba(204,92,92,0.3)',
            background: 'rgba(204,92,92,0.08)', padding: '12px 16px',
            color: '#cc5c5c', fontSize: 12, fontFamily: "'JetBrains Mono',monospace",
          }}>
            {error}
          </div>
        )}

        {isSending && (
          <div className="anim-fade-in">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                fontSize: 10, color: 'var(--text2)', fontFamily: "'JetBrains Mono',monospace",
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
              }}>
                {stageName}
              </div>
              <div style={{ display: 'flex', gap: 2.5 }}>
                {Array.from({ length: 36 }, (_, i) => {
                  const filled = isSendingStage === 'connecting' ? i < 9 : isSendingStage === 'sending' ? i < 22 : i < 30
                  return (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 1,
                      background: filled ? accent : 'var(--bg3)',
                      transition: 'background 0.35s ease',
                      transitionDelay: `${i * 0.018}s`,
                    }} />
                  )
                })}
              </div>
            </div>
            <SkeletonRows count={8} />
          </div>
        )}

        {!isSending && response && (
          <div className="anim-slide-up" style={{ padding: '16px 24px' }}>
            {resTab === 'body' && (
              <ResponseBody body={response.body || ''} headers={response.headers} />
            )}
            {resTab === 'headers' && (
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: '#5ab4d8', minWidth: 220 }}>{k}</span>
                    <span style={{ color: 'var(--text1)' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {resTab === 'cookies' && (
              <div style={{ color: 'var(--text2)', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
                {'// No cookies in response'}
              </div>
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
