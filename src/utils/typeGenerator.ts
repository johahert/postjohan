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
  rootName = 'Response',
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

    for (const [k, v] of Object.entries(items[0])) {
      merged[k] = v
      if (v === null) nullKeys.add(k)
    }

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

    for (const key of Object.keys(merged)) {
      const val = merged[key]

      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        const nestedItems = items
          .slice(0, max)
          .map((item) => item[key])
          .filter(
            (v): v is Record<string, unknown> =>
              typeof v === 'object' && v !== null && !Array.isArray(v),
          )
        if (nestedItems.length > 1) {
          merged[key] = mergeObjectSamples(nestedItems)
        }
      }

      if (
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === 'object' &&
        val[0] !== null &&
        !Array.isArray(val[0])
      ) {
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
      if (typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const representative = mergeObjectSamples(
          val.filter(
            (v): v is Record<string, unknown> =>
              typeof v === 'object' && v !== null && !Array.isArray(v),
          ),
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
        value.filter(
          (v): v is Record<string, unknown> =>
            typeof v === 'object' && v !== null && !Array.isArray(v),
        ),
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
