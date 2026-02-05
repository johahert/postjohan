import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

function configPath(configDir: string) {
  return path.join(configDir, 'config.json')
}

function readConfig(configDir: string): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(configPath(configDir), 'utf-8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function writeConfig(configDir: string, data: Record<string, unknown>) {
  fs.mkdirSync(configDir, { recursive: true })
  fs.writeFileSync(configPath(configDir), JSON.stringify(data, null, 2), 'utf-8')
}

export function createApp(staticDir?: string, configDir?: string) {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  // Serve static frontend files in production
  if (staticDir) {
    app.use(express.static(staticDir))
  }

  // Resolve config directory (default: cwd)
  const cfgDir = configDir ?? process.cwd()

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // ── Config file persistence ───────────────────────────────────────

  app.get('/api/config', (_req, res) => {
    res.json(readConfig(cfgDir))
  })

  app.put('/api/config', (req, res) => {
    try {
      const existing = readConfig(cfgDir)
      const merged = { ...existing, ...req.body }
      writeConfig(cfgDir, merged)
      res.json(merged)
    } catch (err) {
      res.status(500).json({ message: 'Failed to write config', details: String(err) })
    }
  })

app.post('/api/request', async (req, res) => {
  const { method, url, headers, body } = req.body ?? {}

  if (!method || !url) {
    res.status(400).json({ message: 'method and url are required' })
    return
  }

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
    '-X',
    String(method).toUpperCase(),
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

  curl.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })

  curl.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  curl.on('close', (code) => {
    if (code !== 0) {
      res.status(500).json({ message: 'curl failed', details: stderr || stdout })
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

    res.json({
      statusCode,
      statusText,
      headers: headerMap,
      body: bodyText,
      timeTotal: Number(timeTotalText || 0),
      sizeDownload: Number(sizeDownloadText || 0),
    })
  })
})

  // In production, serve index.html for any non-API route (SPA fallback)
  if (staticDir) {
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'))
    })
  }

  return app
}

export function startServer(staticDir?: string, port = 8080, configDir?: string): Promise<number> {
  return new Promise((resolve) => {
    const app = createApp(staticDir, configDir)
    const server = app.listen(port, () => {
      const addr = server.address()
      const boundPort = typeof addr === 'object' && addr ? addr.port : port
      console.log(`Server listening on http://localhost:${boundPort}`)
      resolve(boundPort)
    })
  })
}

// Run standalone when executed directly
const isMain = require.main === module
if (isMain) {
  const port = process.env.PORT ? Number(process.env.PORT) : 8080
  startServer(undefined, port)
}
