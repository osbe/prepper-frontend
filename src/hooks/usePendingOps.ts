import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { liveQuery } from 'dexie'
import { db } from '../offline/db'
import type { PendingOp } from '../offline/db'

/** Returns the set of entry IDs that have pending ops for a given product.
 *  Negative IDs are tempIds from offline ADD ops; positive IDs are from PATCH/UPDATE ops. */
function toPendingIds(ops: PendingOp[]): Set<number> {
  const ids = new Set<number>()
  for (const op of ops) {
    if (op.type === 'ADD' && op.tempId !== null) ids.add(op.tempId)
    else if ((op.type === 'PATCH' || op.type === 'UPDATE') && op.entryId !== null) ids.add(op.entryId)
  }
  return ids
}

/** Subscribes to pending ops for a product and exposes a discard function.
 *  Discarding removes the op(s) from Dexie and invalidates the product stock cache. */
export function usePendingOps(productId: number) {
  const qc = useQueryClient()
  const [pendingEntryIds, setPendingEntryIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.pendingOps.where('productId').equals(productId).toArray()
    ).subscribe({
      next: (ops) => setPendingEntryIds(toPendingIds(ops)),
      error: (err) => console.error('[usePendingOps] liveQuery error', err),
    })
    return () => subscription.unsubscribe()
  }, [productId])

  const discard = useCallback(async (entryId: number) => {
    const ops = await db.pendingOps.where('productId').equals(productId).toArray()
    const toDelete = ops
      .filter((op) => {
        if (entryId < 0) {
          // tempId: discard the ADD op and any follow-up PATCH/UPDATE ops referencing the same temp ID
          return op.tempId === entryId || op.entryId === entryId
        }
        return op.entryId === entryId
      })
      .map((op) => op.id!)
    await db.pendingOps.bulkDelete(toDelete)
    await qc.invalidateQueries({ queryKey: ['products', productId, 'stock'] })
    await qc.invalidateQueries({ queryKey: ['products'] })
    await qc.invalidateQueries({ queryKey: ['stock'] })
  }, [productId, qc])

  return { pendingEntryIds, discard }
}
