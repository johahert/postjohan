import fs from 'node:fs'
import path from 'node:path'

function configPath(configDir: string): string {
  return path.join(configDir, 'config.json')
}

export function readConfig(configDir: string): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(configPath(configDir), 'utf-8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function writeConfig(configDir: string, data: Record<string, unknown>): void {
  fs.mkdirSync(configDir, { recursive: true })
  fs.writeFileSync(configPath(configDir), JSON.stringify(data, null, 2), 'utf-8')
}
