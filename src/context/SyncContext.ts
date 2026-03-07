import { createContext } from 'react'

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced'

export interface ConflictInfo {
  productId: number
  productName: string
}

export interface SyncContextValue {
  status: SyncStatus
  pendingCount: number
  prefetching: boolean
  setPrefetching: (v: boolean) => void
  sync: () => Promise<void>
  conflicts: ConflictInfo[]
  clearConflicts: () => void
  resolvedProductIds: Map<number, number>
}

export const SyncContext = createContext<SyncContextValue | null>(null)
