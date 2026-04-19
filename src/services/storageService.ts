import type { SavedState } from '../types'
import { STORAGE_KEY } from '../constants'

export function loadState(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SavedState>) : {}
  } catch {
    return {}
  }
}

export function saveState(state: SavedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore persistence failures to match loadState's fault-tolerant behavior.
  }
}
