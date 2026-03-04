import type { StockEntry, StockEntryPayload } from '../types'
import type { PendingOp } from './db'

/**
 * Applies pending offline ops to a cached stock entry array, producing the locally-correct view.
 * Used both for optimistic UI (after each offline mutation) and for hydration on app restart.
 */
export function applyOpsToCache(entries: StockEntry[], ops: PendingOp[]): StockEntry[] {
  let result = [...entries]

  for (const op of ops) {
    if (op.type === 'ADD' && op.tempId !== null) {
      const p = op.payload as StockEntryPayload
      result = [
        ...result,
        {
          id: op.tempId,
          productId: op.productId,
          quantity: p.quantity,
          subType: p.subType ?? null,
          purchasedDate: p.purchasedDate ?? null,
          expiryDate: p.expiryDate ?? null,
          location: p.location ?? null,
          notes: p.notes ?? null,
          expiryStatus: null,
        },
      ]
    } else if (op.type === 'PATCH' && op.entryId !== null) {
      const { quantity } = op.payload as { quantity: number }
      result = result.map((e) => (e.id === op.entryId ? { ...e, quantity } : e))
    } else if (op.type === 'UPDATE' && op.entryId !== null) {
      const p = op.payload as StockEntryPayload
      result = result.map((e) =>
        e.id === op.entryId
          ? {
              ...e,
              quantity: p.quantity,
              subType: p.subType ?? null,
              purchasedDate: p.purchasedDate ?? null,
              expiryDate: p.expiryDate ?? null,
              location: p.location ?? null,
              notes: p.notes ?? null,
            }
          : e,
      )
    } else if (op.type === 'DELETE' && op.entryId !== null) {
      result = result.filter((e) => e.id !== op.entryId)
    }
  }

  return result
}
