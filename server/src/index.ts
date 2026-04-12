export { createApp } from './app'

import { createApp } from './app'

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
