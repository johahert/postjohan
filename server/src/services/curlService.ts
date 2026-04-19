import { spawn } from 'node:child_process'

export interface CurlResult {
  statusCode: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeTotal: number
  sizeDownload: number
}

export interface CurlOptions {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string | Record<string, unknown>
}

export function execCurl(options: CurlOptions): Promise<CurlResult> {
  return new Promise((resolve, reject) => {
    const { method, url, headers, body } = options
    const curlTimeoutMs = 30000

    const headerArgs: string[] = []
    if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headerArgs.push('-H', `${key}: ${value}`)
        }
      })
    }

    const args = [
      '-i',
      '-s',
      '--max-time',
      String(curlTimeoutMs / 1000),
      '-X',
      method.toUpperCase(),
      String(url),
      ...headerArgs,
    ]

    if (body) {
      args.push('--data-raw', typeof body === 'string' ? body : JSON.stringify(body))
    }

    args.push('-w', '\n\n__CURL_STATS__%{http_code}|||%{time_total}|||%{size_download}')

    const curl = spawn('curl', args)
    let stdout = ''
    let stderr = ''
    let settled = false
    let didTimeout = false

    const timeout = setTimeout(() => {
      if (settled) {
        return
      }

      didTimeout = true
      curl.kill('SIGKILL')
    }, curlTimeoutMs)

    curl.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    curl.stderr.on('data', (chunk) => { stderr += chunk.toString() })

    curl.on('error', (error) => {
      if (settled) {
        return
      }

      settled = true
      clearTimeout(timeout)
      reject(error)
    })

    curl.on('close', (code) => {
      if (settled) {
        return
      }

      settled = true
      clearTimeout(timeout)

      if (didTimeout) {
        reject(new Error(`curl request timed out after ${curlTimeoutMs}ms`))
        return
      }

      if (code !== 0) {
        reject(new Error(stderr || stdout))
        return
      }

      const [rawOutput, statsRaw = ''] = stdout.split('\n\n__CURL_STATS__')
      const [statusCodeText, timeTotalText, sizeDownloadText] = statsRaw.split('|||')

      const headerBodyParts = rawOutput.split(/\r?\n\r?\n/)
      const bodyText = headerBodyParts.pop() ?? ''
      const headersText = headerBodyParts.pop() ?? ''

      const headerLines = headersText.split(/\r?\n/).filter(Boolean)
      const statusLine = headerLines.shift() ?? ''

      const statusMatch = statusLine.match(/HTTP\/\d\.\d\s+(\d+)\s*(.*)/)
      const statusCode = statusMatch ? Number(statusMatch[1]) : Number(statusCodeText)
      const statusText = statusMatch ? statusMatch[2] : ''

      const headerMap: Record<string, string> = {}
      headerLines.forEach((line) => {
        const separatorIndex = line.indexOf(':')
        if (separatorIndex > -1) {
          const key = line.slice(0, separatorIndex).trim()
          const value = line.slice(separatorIndex + 1).trim()
          headerMap[key] = value
        }
      })

      resolve({
        statusCode,
        statusText,
        headers: headerMap,
        body: bodyText,
        timeTotal: Number(timeTotalText || 0),
        sizeDownload: Number(sizeDownloadText || 0),
      })
    })
  })
}
