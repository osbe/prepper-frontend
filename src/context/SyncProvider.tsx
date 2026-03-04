import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { liveQuery } from 'dexie'
import { NotFoundError, ClientError } from '../api/client'
import { SyncContext } from './SyncContext'
import type { SyncStatus } from './SyncContext'
import { useBackendStatus } from './useBackendStatus'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { db } from '../offline/db'
import type { PendingOp } from '../offline/db'
import type { StockEntryPayload } from '../types'
import { addStockEntry } from '../api/products'
import { patchStockEntry, putStockEntry, deleteStockEntry } from '../api/stock'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()
  const isOnline = useOnlineStatus()
  const isBackendOffline = useBackendStatus()

  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)
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
      // Maps temp IDs (negative ints from offline ADDs) to real server IDs
      const tempIdMap = new Map<number, number>()

      let aborted = false
      for (const op of ops) {
        const ok = await processSingleOp(op, tempIdMap)
        if (!ok) { aborted = true; break }
      }

      await qc.invalidateQueries({ queryKey: ['products'] })
      await qc.invalidateQueries({ queryKey: ['stock'] })
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

  return (
    <SyncContext.Provider value={{ status, pendingCount, prefetching: isPrefetching, setPrefetching: setIsPrefetching, sync }}>
      {children}
    </SyncContext.Provider>
  )
}

async function processSingleOp(op: PendingOp, tempIdMap: Map<number, number>): Promise<boolean> {
  // Resolve any temp IDs that were mapped to real IDs by earlier ops in this sync session
  const resolvedEntryId =
    op.entryId !== null ? (tempIdMap.get(op.entryId) ?? op.entryId) : null

  try {
    if (op.type === 'ADD') {
      const result = await addStockEntry(op.productId, op.payload as StockEntryPayload)
      if (op.tempId !== null) tempIdMap.set(op.tempId, result.id)
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
    // 404 means the target resource is gone and the op can never succeed — discard it,
    // unless the entryId is still a negative tempId (ADD hasn't synced yet — don't discard)
    if (e instanceof NotFoundError) {
      if (resolvedEntryId !== null && resolvedEntryId < 0) {
        console.error('[SyncProvider] op references unresolved tempId, aborting sync', resolvedEntryId, op)
        return false
      }
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
