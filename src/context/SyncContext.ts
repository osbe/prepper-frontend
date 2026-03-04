import { createContext } from 'react'

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced'

export interface SyncContextValue {
  status: SyncStatus
  pendingCount: number
  sync: () => Promise<void>
}

export const SyncContext = createContext<SyncContextValue>({
  status: 'idle',
  pendingCount: 0,
  sync: async () => {},
})
