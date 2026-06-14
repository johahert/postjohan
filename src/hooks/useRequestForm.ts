import { useState } from 'react'
import type { KVEntry, ParamEntry } from '../types'
import { METHODS, TABS, type Tab } from '../constants'

interface RequestFormInitial {
  method?: string
  url?: string
  headers?: KVEntry[]
  params?: ParamEntry[]
  body?: string
}

export function useRequestForm(initial: RequestFormInitial = {}) {
  const [method, setMethod] = useState<(typeof METHODS)[number]>(
    (initial.method as (typeof METHODS)[number]) ?? 'GET',
  )
  const [url, setUrl] = useState(initial.url ?? 'https://jsonplaceholder.typicode.com/todos/1')
  const [headers, setHeaders] = useState<KVEntry[]>(
    initial.headers ?? [{ key: 'Accept', value: 'application/json', enabled: true }],
  )
  const [params, setParams] = useState<ParamEntry[]>(initial.params ?? [])
  const [body, setBody] = useState(initial.body ?? '')
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0])
  // Tracks which saved endpoint (if any) is currently loaded into the form.
  const [loadedEndpointId, setLoadedEndpointId] = useState<string | null>(null)

  return {
    method, setMethod,
    url, setUrl,
    headers, setHeaders,
    params, setParams,
    body, setBody,
    activeTab, setActiveTab,
    loadedEndpointId, setLoadedEndpointId,
  }
}
