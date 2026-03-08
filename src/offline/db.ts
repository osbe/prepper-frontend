import Dexie, { type Table } from 'dexie'

export interface PendingOp {
  id?: number
  type: 'ADD' | 'PATCH' | 'UPDATE' | 'DELETE' | 'CREATE_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT'
  productId: number    // for hydration — which cache key to update; also the temp product ID for CREATE_PRODUCT ops
  entryId: number | null  // server ID or temp ID for subsequent ops on offline-added entries
  tempId: number | null   // negative int: for ADD ops = stock entry tempId, for CREATE_PRODUCT = product tempId
  payload: unknown     // StockEntryPayload | ProductPayload | { quantity: number } | null
  beforeSnapshot?: unknown  // snapshot of entity at time of queuing, used for conflict detection on UPDATE ops
  createdAt: number
}

export interface QueryCacheSnapshot {
  id: string      // always 'tq'
  state: unknown  // DehydratedState JSON
  savedAt: number
}

class PrepperDB extends Dexie {
  pendingOps!: Table<PendingOp, number>
  queryCache!: Table<QueryCacheSnapshot, string>

  constructor() {
    super('prepper-db')
    this.version(1).stores({ pendingOps: '++id, createdAt, productId' })
    this.version(2).stores({
      pendingOps: '++id, createdAt, productId',
      queryCache: 'id',
    })
  }
}

export const db = new PrepperDB()

/**
 * IDs of pending ops that are currently being sent to the server.
 * Used by applyOpsToCache to skip ops in-flight, preventing duplication
 * when a query refetch sees server data + the not-yet-deleted pending op simultaneously.
 */
export const syncingOpIds = new Set<number>()
