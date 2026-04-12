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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
