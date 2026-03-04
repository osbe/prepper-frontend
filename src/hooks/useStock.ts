import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  deleteStockEntry,
  getExpiredStock,
  getExpiringStock,
  getLowStock,
  patchStockEntry,
  putStockEntry,
} from '../api/stock'
import type { StockEntry, StockEntryPayload } from '../types'
import { useBackendStatus } from '../context/useBackendStatus'
import { isBackendUnreachable } from '../api/client'
import { db } from '../offline/db'

export const useExpiredStock = () =>
  useQuery({ queryKey: ['stock', 'expired'], queryFn: getExpiredStock })

export const useExpiringStock = (days = 30) =>
  useQuery({
    queryKey: ['stock', 'expiring', days],
    queryFn: () => getExpiringStock(days),
  })

export const useLowStock = () =>
  useQuery({ queryKey: ['stock', 'low'], queryFn: getLowStock })

export const usePatchStock = () => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }): Promise<StockEntry> => {
      if (!isOffline) {
        try {
          return await patchStockEntry(id, quantity)
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      const productId = findProductIdInCache(qc, id) ?? 0
      await db.pendingOps.add({
        type: 'PATCH',
        productId,
        entryId: id,
        tempId: null,
        payload: { quantity },
        createdAt: Date.now(),
      })
      return { id, quantity } as StockEntry
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export const useUpdateStock = () => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & StockEntryPayload): Promise<StockEntry> => {
      if (!isOffline) {
        try {
          return await putStockEntry(id, payload)
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      const productId = findProductIdInCache(qc, id) ?? 0
      await db.pendingOps.add({
        type: 'UPDATE',
        productId,
        entryId: id,
        tempId: null,
        payload,
        createdAt: Date.now(),
      })
      return { id, ...payload } as StockEntry
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export const useDeleteStock = () => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      if (!isOffline) {
        try {
          await deleteStockEntry(id)
          return
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      const productId = findProductIdInCache(qc, id) ?? 0
      await db.pendingOps.add({
        type: 'DELETE',
        productId,
        entryId: id,
        tempId: null,
        payload: null,
        createdAt: Date.now(),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

/** Scan the TQ cache to find which product owns the given stock entry id. */
function findProductIdInCache(qc: QueryClient, entryId: number): number | null {
  const queries = qc.getQueriesData<StockEntry[]>({ queryKey: ['products'] })
  for (const [key, data] of queries) {
    if (!Array.isArray(key) || key.length !== 3 || key[2] !== 'stock') continue
    if (!Array.isArray(data)) continue
    if (data.some((e) => e.id === entryId)) return key[1] as number
  }
  return null
}
