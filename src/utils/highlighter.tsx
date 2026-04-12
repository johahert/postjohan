export function highlightTs(code: string): React.ReactNode[] {
  const lines = code.split('\n')
  const result: React.ReactNode[] = []
  let globalKey = 0

  const tokenRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)|([{}\[\]()=;,:])|(".+?")|( +)/g

  lines.forEach((line, lineIdx) => {
    let match: RegExpExecArray | null
    let lastIndex = 0

    tokenRegex.lastIndex = 0
    while ((match = tokenRegex.exec(line)) !== null) {
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
        if (token === '{' || token === '}' || token === '[' || token === ']') {
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
        } else if (
          token === 'string' || token === 'number' || token === 'boolean' ||
          token === 'null' || token === 'unknown' || token === 'Record'
        ) {
          result.push(
            <span key={key} className="text-teal-600 dark:text-teal-400">{token}</span>,
          )
        } else {
          const rest = line.slice(tokenRegex.lastIndex).trimStart()
          if (rest.startsWith(':')) {
            result.push(
              <span key={key} className="text-sky-600 dark:text-sky-400">{token}</span>,
            )
          } else {
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

    if (lastIndex < line.length) {
      result.push(line.slice(lastIndex))
    }

    if (lineIdx < lines.length - 1) {
      result.push('\n')
    }
  })

  return result
}
