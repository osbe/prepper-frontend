import Dexie, { type Table } from 'dexie'

export interface PendingOp {
  id?: number
  type: 'ADD' | 'PATCH' | 'UPDATE' | 'DELETE'
  productId: number    // for hydration — which cache key to update
  entryId: number | null  // server ID or temp ID for subsequent ops on offline-added entries
  tempId: number | null   // negative int assigned to ADD ops, resolved to real ID during sync
  payload: unknown     // StockEntryPayload | { quantity: number } | null
  createdAt: number
}

class PrepperDB extends Dexie {
  pendingOps!: Table<PendingOp, number>

  constructor() {
    super('prepper-db')
    this.version(1).stores({ pendingOps: '++id, createdAt, productId' })
  }
}

export const db = new PrepperDB()
