import { useContext } from 'react'
import { SyncContext } from './SyncContext'
import type { SyncContextValue } from './SyncContext'

export function useSync(): SyncContextValue {
  return useContext(SyncContext)
}
