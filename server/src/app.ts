import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { healthRouter } from './routes/health'
import { configRouter } from './routes/config'
import { requestRouter } from './routes/request'

export function createApp(staticDir?: string, configDir?: string) {
  const app = express()
  const cfgDir = configDir ?? process.cwd()

  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  if (staticDir) {
    app.use(express.static(staticDir))
  }

  app.use(healthRouter())
  app.use(configRouter(cfgDir))
  app.use(requestRouter())

  // In production, serve index.html for any non-API route (SPA fallback)
  if (staticDir) {
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'))
    })
  }

  return app
}
