import { createContext } from 'react'

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced'

export interface SyncContextValue {
  status: SyncStatus
  pendingCount: number
  prefetching: boolean
  setPrefetching: (v: boolean) => void
  sync: () => Promise<void>
}

export const SyncContext = createContext<SyncContextValue | null>(null)
