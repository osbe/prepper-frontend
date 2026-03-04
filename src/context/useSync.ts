import { useContext } from 'react'
import { SyncContext } from './SyncContext'
import type { SyncContextValue } from './SyncContext'

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext)
  if (ctx === null) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return ctx
}
