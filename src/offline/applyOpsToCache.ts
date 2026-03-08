import type { Product, ProductPayload, StockEntry, StockEntryPayload } from '../types'
import { syncingOpIds } from './db'
import type { PendingOp } from './db'

/**
 * Applies pending offline ops to a cached stock entry array, producing the locally-correct view.
 * Used both for optimistic UI (after each offline mutation) and for hydration on app restart.
 */
export function applyOpsToCache(entries: StockEntry[], ops: PendingOp[]): StockEntry[] {
  let result = [...entries]

  for (const op of ops) {
    // Skip ops currently being sent to the server — they're handled by sync directly.
    // This prevents duplication when a refetch sees server data (entry already created)
    // alongside a pending op that hasn't been deleted from Dexie yet.
    if (op.id !== undefined && syncingOpIds.has(op.id)) continue

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
    } else {
      console.error('[applyOpsToCache] Unrecognised or malformed op, skipping', op)
    }
  }

  return result
}

/**
 * Applies pending offline product ops to a cached product array, producing the locally-correct view.
 * Used in useProducts query fns so offline-created/edited/deleted products are immediately visible.
 */
export function applyProductOpsToCache(products: Product[], ops: PendingOp[]): Product[] {
  let result = [...products]

  for (const op of ops) {
    if (op.id !== undefined && syncingOpIds.has(op.id)) continue

    if (op.type === 'CREATE_PRODUCT' && op.tempId !== null) {
      const p = op.payload as ProductPayload
      result = [
        ...result,
        {
          id: op.tempId,
          name: p.name,
          category: p.category,
          unit: p.unit,
          targetQuantity: p.targetQuantity,
          currentStock: 0,
          notes: p.notes ?? null,
        },
      ]
    } else if (op.type === 'UPDATE_PRODUCT') {
      const p = op.payload as ProductPayload
      result = result.map((product) =>
        product.id === op.productId
          ? { ...product, name: p.name, category: p.category, unit: p.unit, targetQuantity: p.targetQuantity, notes: p.notes ?? null }
          : product,
      )
    } else if (op.type === 'DELETE_PRODUCT') {
      result = result.filter((product) => product.id !== op.productId)
    }
  }

  return result
}
