import { Router } from 'express'
import { execCurl } from '../services/curlService'

export function requestRouter(): Router {
  const router = Router()

  router.post('/api/request', async (req, res) => {
    const { method, url, headers, body } = req.body ?? {}

    if (!method || !url) {
      res.status(400).json({ message: 'method and url are required' })
      return
    }

    try {
      const result = await execCurl({ method, url, headers, body })
      res.json(result)
    } catch (err) {
      res.status(500).json({ message: 'curl failed', details: String(err) })
    }
  })

  return router
}
