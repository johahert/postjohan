import type { SavedState } from '../types'
import { STORAGE_KEY } from '../constants'

// ── Helpers ────────────────────────────────────────────────────────────

export function loadState(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SavedState>) : {}
  } catch {
    return {}
  }
}

export function saveState(state: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isJsonContentType(headers: Record<string, string>): boolean {
  return Object.entries(headers).some(
    ([k, v]) => k.toLowerCase() === 'content-type' && v.toLowerCase().includes('json'),
  )
}

export function tryParseJson(text: string): unknown | undefined {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function toInterfaceName(key: string): string {
  return capitalize(
    key.replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase()).replace(/[^a-zA-Z0-9]/g, ''),
  )
}

export function generateTypesFromJson(
  value: unknown,
  rootName = 'Root',
  nested = false,
): string {
  const interfaces: string[] = []

  /** Sample up to `limit` objects in an array to build a representative
   *  object where null values are replaced by non-null values found in
   *  later entries so we can infer proper types. */
  const SAMPLE_LIMIT = 50

  function mergeObjectSamples(items: Record<string, unknown>[]): Record<string, unknown> {
    if (items.length === 0) return {}
    const merged: Record<string, unknown> = {}
    const nullKeys = new Set<string>()

    // Seed with the first item (deep-clone so we can mutate nested values)
    for (const [k, v] of Object.entries(items[0])) {
      merged[k] = v
      if (v === null) nullKeys.add(k)
    }

    // Scan later items to resolve null keys
    const max = Math.min(items.length, SAMPLE_LIMIT)
    for (let i = 1; i < max && nullKeys.size > 0; i++) {
      const obj = items[i]
      if (typeof obj !== 'object' || obj === null) continue
      for (const key of [...nullKeys]) {
        const val = obj[key]
        if (val !== null && val !== undefined) {
          merged[key] = val
          nullKeys.delete(key)
        }
      }
    }

    // Recursively merge nested objects and arrays of objects
    for (const key of Object.keys(merged)) {
      const val = merged[key]

      // Nested single object: gather that same key from all items and merge
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        const nestedItems = items
          .slice(0, max)
          .map((item) => item[key])
          .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v))
        if (nestedItems.length > 1) {
          merged[key] = mergeObjectSamples(nestedItems)
        }
      }

      // Nested array of objects: pool all array entries and merge
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const allEntries: Record<string, unknown>[] = []
        for (let i = 0; i < max && i < items.length; i++) {
          const arr = items[i][key]
          if (Array.isArray(arr)) {
            for (const entry of arr) {
              if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
                allEntries.push(entry as Record<string, unknown>)
                if (allEntries.length >= SAMPLE_LIMIT) break
              }
            }
          }
          if (allEntries.length >= SAMPLE_LIMIT) break
        }
        if (allEntries.length > 1) {
          merged[key] = [mergeObjectSamples(allEntries)]
        }
      }
    }

    return merged
  }

  function inferType(val: unknown, name: string, depth = 1): string {
    if (val === null) return 'null'
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]'
      // If the array contains objects, merge samples to resolve nulls
      if (typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const representative = mergeObjectSamples(
          val.filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)),
        )
        const itemType = inferType(representative, name + 'Item', depth)
        return `${itemType}[]`
      }
      const itemType = inferType(val[0], name + 'Item', depth)
      return `${itemType}[]`
    }
    if (typeof val === 'object') {
      const iName = toInterfaceName(name)
      if (nested) {
        buildInterface(val as Record<string, unknown>, iName)
        return iName
      }
      // inline object type
      const entries = Object.entries(val as Record<string, unknown>)
      if (entries.length === 0) return 'Record<string, unknown>'
      const indent = '  '.repeat(depth)
      const closingIndent = '  '.repeat(depth - 1)
      const fields = entries
        .map(([k, v]) => {
          const safe = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
          return `${indent}${safe}: ${inferType(v, name + capitalize(k), depth + 1)};`
        })
        .join('\n')
      return `{\n${fields}\n${closingIndent}}`
    }
    if (typeof val === 'string') return 'string'
    if (typeof val === 'number') return 'number'
    if (typeof val === 'boolean') return 'boolean'
    return 'unknown'
  }

  function buildInterface(obj: Record<string, unknown>, name: string) {
    const fields = Object.entries(obj)
      .map(([k, v]) => {
        const safe = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
        return `  ${safe}: ${inferType(v, name + capitalize(k), 2)};`
      })
      .join('\n')
    interfaces.push(`interface ${name} {\n${fields}\n}`)
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    buildInterface(value as Record<string, unknown>, toInterfaceName(rootName))
  } else if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const representative = mergeObjectSamples(
        value.filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)),
      )
      buildInterface(representative, toInterfaceName(rootName))
      interfaces.push(`type ${toInterfaceName(rootName)}List = ${toInterfaceName(rootName)}[]`)
    } else {
      const itemType = value.length > 0 ? inferType(value[0], rootName) : 'unknown'
      interfaces.push(`type ${toInterfaceName(rootName)} = ${itemType}[]`)
    }
  } else {
    interfaces.push(`type ${toInterfaceName(rootName)} = ${inferType(value, rootName)}`)
  }

  return interfaces.join('\n\n')
}

export function highlightTs(code: string): React.ReactNode[] {
  // tokenize line-by-line to preserve whitespace
  const lines = code.split('\n')
  const result: React.ReactNode[] = []
  let globalKey = 0

  const tokenRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)|([{}\[\]()=;,:])|(".+?")|( +)/g

  lines.forEach((line, lineIdx) => {
    let match: RegExpExecArray | null
    let lastIndex = 0

    tokenRegex.lastIndex = 0
    while ((match = tokenRegex.exec(line)) !== null) {
      // any gap (shouldn't happen but safety)
      if (match.index > lastIndex) {
        result.push(line.slice(lastIndex, match.index))
      }
      lastIndex = tokenRegex.lastIndex

      const token = match[0]
      const key = globalKey++

      if (match[3]) {
        // quoted string (property name with special chars)
        result.push(
          <span key={key} className="text-sky-600 dark:text-sky-400">{token}</span>,
        )
      } else if (match[2]) {
        // brackets / punctuation
        if (token === '{' || token === '}') {
          result.push(
            <span key={key} className="text-amber-600 dark:text-amber-400">{token}</span>,
          )
        } else if (token === '[' || token === ']') {
          result.push(
            <span key={key} className="text-amber-600 dark:text-amber-400">{token}</span>,
          )
        } else if (token === ':' || token === '=' || token === ',' || token === ';') {
          result.push(
            <span key={key} className="text-slate-500 dark:text-slate-400">{token}</span>,
          )
        } else {
          result.push(token)
        }
      } else if (match[1]) {
        // identifier or keyword
        if (token === 'interface' || token === 'type') {
          result.push(
            <span key={key} className="text-purple-600 dark:text-purple-400">{token}</span>,
          )
        } else if (token === 'string' || token === 'number' || token === 'boolean' || token === 'null' || token === 'unknown') {
          result.push(
            <span key={key} className="text-teal-600 dark:text-teal-400">{token}</span>,
          )
        } else if (token === 'Record') {
          result.push(
            <span key={key} className="text-teal-600 dark:text-teal-400">{token}</span>,
          )
        } else {
          // check context: is it a property key (followed by :) or a type name
          const rest = line.slice(tokenRegex.lastIndex).trimStart()
          if (rest.startsWith(':')) {
            // property name
            result.push(
              <span key={key} className="text-sky-600 dark:text-sky-400">{token}</span>,
            )
          } else {
            // type / interface name
            result.push(
              <span key={key} className="text-emerald-600 dark:text-emerald-400">{token}</span>,
            )
          }
        }
      } else {
        // spaces
        result.push(token)
      }
    }

    // remaining text
    if (lastIndex < line.length) {
      result.push(line.slice(lastIndex))
    }

    if (lineIdx < lines.length - 1) {
      result.push('\n')
    }
  })

  return result
}
