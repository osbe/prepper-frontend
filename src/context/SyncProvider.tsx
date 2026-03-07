import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { liveQuery } from 'dexie'
import { NotFoundError, ClientError } from '../api/client'
import { SyncContext } from './SyncContext'
import type { ConflictInfo, SyncStatus } from './SyncContext'
import { useBackendStatus } from './useBackendStatus'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { db } from '../offline/db'
import type { PendingOp } from '../offline/db'
import type { Product, StockEntry, StockEntryPayload, ProductPayload } from '../types'
import { addStockEntry, createProduct, getProduct, updateProduct, deleteProduct } from '../api/products'
import { patchStockEntry, putStockEntry, deleteStockEntry } from '../api/stock'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  const isOnline = useOnlineStatus()
  const isBackendOffline = useBackendStatus()

  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])
  const [resolvedProductIds, setResolvedProductIds] = useState<Map<number, number>>(new Map())
  const syncInProgress = useRef(false)

  const status: SyncStatus = isSyncing
    ? 'syncing'
    : pendingCount > 0
      ? 'pending'
      : justSynced
        ? 'synced'
        : 'idle'

  // Keep pendingCount in sync with Dexie table via liveQuery observable
  useEffect(() => {
    let subscription: { unsubscribe(): void }
    let retryTimer: ReturnType<typeof setTimeout>

    function subscribe() {
      subscription = liveQuery(() => db.pendingOps.count()).subscribe({
        next: (count) => setPendingCount(count),
        error: (err) => {
          console.error('[SyncProvider] liveQuery failed, resubscribing in 5s', err)
          retryTimer = setTimeout(subscribe, 5000)
        },
      })
    }

    subscribe()
    return () => {
      clearTimeout(retryTimer)
      subscription.unsubscribe()
    }
  }, [])

  const sync = useCallback(async () => {
    if (syncInProgress.current) return
    const count = await db.pendingOps.count()
    if (count === 0) return

    syncInProgress.current = true
    setIsSyncing(true)
    setJustSynced(false)

    try {
      const ops = await db.pendingOps.orderBy('createdAt').toArray()
      // Maps temp stock entry IDs (negative ints) to real server IDs
      const tempIdMap = new Map<number, number>()
      // Maps temp product IDs (negative ints) to real server IDs
      const tempProductIdMap = new Map<number, number>()
      const newConflicts: ConflictInfo[] = []

      let aborted = false
      for (const op of ops) {
        const ok = await processSingleOp(op, tempIdMap, tempProductIdMap, newConflicts, qc)
        if (!ok) { aborted = true; break }
      }

      await qc.invalidateQueries({ queryKey: ['products'] })
      await qc.invalidateQueries({ queryKey: ['stock'] })

      if (tempProductIdMap.size > 0) {
        setResolvedProductIds((prev) => new Map([...prev, ...tempProductIdMap]))
      }
      if (newConflicts.length > 0) {
        setConflicts((prev) => [...prev, ...newConflicts])
      }
      if (!aborted) {
        setJustSynced(true)
        setTimeout(() => setJustSynced(false), 2000)
      }
    } finally {
      syncInProgress.current = false
      setIsSyncing(false)
    }
  }, [qc])

  // Auto-sync when network or backend availability changes
  const prevIsOnline = useRef(isOnline)
  const prevIsBackendOffline = useRef(isBackendOffline)
  const syncRef = useRef(sync)
  syncRef.current = sync

  useEffect(() => {
    const wasOnline = prevIsOnline.current
    const wasBackendOffline = prevIsBackendOffline.current
    prevIsOnline.current = isOnline
    prevIsBackendOffline.current = isBackendOffline

    const networkCameBack = isOnline && !wasOnline
    const backendCameBack = !isBackendOffline && wasBackendOffline

    if (networkCameBack || backendCameBack) {
      syncRef.current()
    }
  }, [isOnline, isBackendOffline])

  const clearConflicts = useCallback(() => setConflicts([]), [])

  return (
    <SyncContext.Provider value={{
      status,
      pendingCount,
      prefetching: isPrefetching,
      setPrefetching: setIsPrefetching,
      sync,
      conflicts,
      clearConflicts,
      resolvedProductIds,
    }}>
      {children}
    </SyncContext.Provider>
  )
}

async function processSingleOp(
  op: PendingOp,
  tempIdMap: Map<number, number>,
  tempProductIdMap: Map<number, number>,
  conflicts: ConflictInfo[],
  qc: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  // Resolve temp product IDs mapped by earlier CREATE_PRODUCT ops in this sync session
  const resolvedProductId = tempProductIdMap.get(op.productId) ?? op.productId
  // Resolve temp stock entry IDs mapped by earlier ADD ops in this sync session
  const resolvedEntryId =
    op.entryId !== null ? (tempIdMap.get(op.entryId) ?? op.entryId) : null

  try {
    if (op.type === 'CREATE_PRODUCT') {
      const result = await createProduct(op.payload as ProductPayload)
      if (op.tempId !== null) {
        tempProductIdMap.set(op.tempId, result.id)

        // Update all dependent ops (both stock and product UPDATE/DELETE) that reference this temp product ID
        const dependentOps = await db.pendingOps.where('productId').equals(op.tempId).toArray()
        for (const dop of dependentOps) {
          await db.pendingOps.update(dop.id!, { productId: result.id })
        }

        // Move product list cache entry from tempId to realId
        qc.setQueryData<Product[]>(['products', null], (old) => {
          if (!old) return old
          return old.map((p) => (p.id === op.tempId ? { ...p, id: result.id } : p))
        })
        // Set the individual product cache entry under the real ID
        qc.setQueryData(['products', result.id], result)
        qc.removeQueries({ queryKey: ['products', op.tempId] })

        // Move stock cache from temp product ID to real product ID
        const tempStock = qc.getQueryData<StockEntry[]>(['products', op.tempId, 'stock'])
        if (tempStock) {
          qc.setQueryData(['products', result.id, 'stock'], tempStock)
          qc.removeQueries({ queryKey: ['products', op.tempId, 'stock'] })
        }
      }
    } else if (op.type === 'UPDATE_PRODUCT') {
      // Conflict detection: compare stored snapshot with current server state
      if (op.beforeSnapshot && resolvedProductId > 0) {
        try {
          const current = await getProduct(resolvedProductId)
          const snapshot = op.beforeSnapshot as Product
          if (
            current.name !== snapshot.name ||
            current.targetQuantity !== snapshot.targetQuantity ||
            current.notes !== snapshot.notes
          ) {
            conflicts.push({ productId: resolvedProductId, productName: current.name })
          }
        } catch {
          // If fetching current state fails, skip conflict detection and proceed
        }
      }
      await updateProduct(resolvedProductId, op.payload as ProductPayload)
    } else if (op.type === 'DELETE_PRODUCT') {
      await deleteProduct(resolvedProductId)
    } else if (op.type === 'ADD') {
      const result = await addStockEntry(resolvedProductId, op.payload as StockEntryPayload)
      if (op.tempId !== null) {
        tempIdMap.set(op.tempId, result.id)

        // Find dependent ops and update their entryId from tempId to the new result.id
        const dependentOps = await db.pendingOps.where('entryId').equals(op.tempId).toArray()
        for (const dop of dependentOps) {
          await db.pendingOps.update(dop.id!, { entryId: result.id })
        }

        // Update the query cache directly to switch the tempId to the real ID
        qc.setQueryData<StockEntry[]>(['products', resolvedProductId, 'stock'], (old) => {
          if (!old) return old
          return old.map((entry) => (entry.id === op.tempId ? { ...entry, id: result.id } : entry))
        })
      }
    } else if (op.type === 'PATCH') {
      await patchStockEntry(resolvedEntryId!, (op.payload as { quantity: number }).quantity)
    } else if (op.type === 'UPDATE') {
      await putStockEntry(resolvedEntryId!, op.payload as StockEntryPayload)
    } else if (op.type === 'DELETE') {
      await deleteStockEntry(resolvedEntryId!)
    }
    await db.pendingOps.delete(op.id!)
    return true
  } catch (e) {
    // 404 means the target resource is gone and the op can never succeed — discard it
    if (e instanceof NotFoundError) {
      await db.pendingOps.delete(op.id!)
      console.warn('[SyncProvider] op discarded (resource not found)', op)
      return true
    }
    // Permanent client error (bad data): discard the op so it doesn't block the queue forever
    if (e instanceof ClientError) {
      await db.pendingOps.delete(op.id!)
      console.error('[SyncProvider] op discarded (bad request, data invalid)', op)
      return true
    }
    // Transient error: leave the op in the queue so it can be retried on the next sync
    console.error('[SyncProvider] op failed, will retry on next sync', op)
    return false
  }
}
