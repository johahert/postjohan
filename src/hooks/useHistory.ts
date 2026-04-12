import { useState } from 'react'
import type { HistoryEntry } from '../types'

const HISTORY_LIMIT = 50

export function useHistory(initial: HistoryEntry[] = []) {
  const [history, setHistory] = useState<HistoryEntry[]>(initial)

  const addEntry = (entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT))
  }

  const clearHistory = () => setHistory([])

  return { history, setHistory, addEntry, clearHistory }
}
