import { Router } from 'express'
import { readConfig, writeConfig } from '../services/configService'

export function configRouter(configDir: string): Router {
  const router = Router()

  router.get('/api/config', (_req, res) => {
    res.json(readConfig(configDir))
  })

  router.put('/api/config', (req, res) => {
    try {
      const existing = readConfig(configDir)
      const merged = { ...existing, ...req.body }
      writeConfig(configDir, merged)
      res.json(merged)
    } catch (err) {
      res.status(500).json({ message: 'Failed to write config', details: String(err) })
    }
  })

  return router
}
