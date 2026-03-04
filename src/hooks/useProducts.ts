import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductStock,
  getProducts,
  addStockEntry,
  updateProduct,
} from '../api/products'
import type { Category, Product, ProductPayload, StockEntry, StockEntryPayload } from '../types'
import { useBackendStatus } from '../context/useBackendStatus'
import { isBackendUnreachable } from '../api/client'
import { db } from '../offline/db'
import { applyOpsToCache } from '../offline/applyOpsToCache'
import { saveQueryCache } from '../offline/queryPersister'

export const useProducts = (category?: Category) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', category ?? null],
    queryFn: async () => {
      try {
        return await getProducts(category)
      } catch (e) {
        if (!isBackendUnreachable(e)) throw e
        const prev = qc.getQueryData<Product[]>(['products', category ?? null])
        if (prev) return prev
        // Scan all product list caches and filter by category
        const allQueries = qc.getQueriesData<Product[]>({ queryKey: ['products'] })
        for (const [, data] of allQueries) {
          if (Array.isArray(data) && data.length > 0) {
            return category ? data.filter((p) => p.category === category) : data
          }
        }
        return []
      }
    },
  })
}

export const useProduct = (id: number) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        return await getProduct(id)
      } catch (e) {
        if (!isBackendUnreachable(e)) throw e
        const prev = qc.getQueryData<Product>(['products', id])
        if (prev) return prev
        // Scan product list caches to find the product
        const allQueries = qc.getQueriesData<Product[]>({ queryKey: ['products'] })
        for (const [, data] of allQueries) {
          if (Array.isArray(data)) {
            const found = data.find((p) => p.id === id)
            if (found) return found
          }
        }
        throw e
      }
    },
  })
}

/** Reusable queryFn for product stock — used by both useProductStock and the startup prefetch. */
export function makeProductStockQueryFn(id: number, qc: ReturnType<typeof useQueryClient>) {
  return async () => {
    let serverData: StockEntry[]
    try {
      serverData = await getProductStock(id)
    } catch (e) {
      if (!isBackendUnreachable(e)) throw e
      // Backend unreachable — fall back to last known server state, stripping
      // pending-op-derived entries (negative IDs) to avoid double-applying ops
      console.warn('[useProductStock] backend unreachable, using stale cache', id)
      const prev = qc.getQueryData<StockEntry[]>(['products', id, 'stock']) ?? []
      serverData = prev.filter((e) => e.id > 0)
    }
    const ops = await db.pendingOps.where('productId').equals(id).sortBy('createdAt')
    return ops.length > 0 ? applyOpsToCache(serverData, ops) : serverData
  }
}

export const useProductStock = (id: number) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', id, 'stock'],
    queryFn: makeProductStockQueryFn(id, qc),
  })
}

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      saveQueryCache()
    },
  })
}

export const useUpdateProduct = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      saveQueryCache()
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      saveQueryCache()
    },
  })
}

export const useAddStockEntry = (productId: number) => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async (payload: StockEntryPayload): Promise<StockEntry> => {
      if (!isOffline) {
        try {
          return await addStockEntry(productId, payload)
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      const tempId = -Date.now()
      await db.pendingOps.add({
        type: 'ADD',
        productId,
        entryId: null,
        tempId,
        payload,
        createdAt: Date.now(),
      })
      return {
        id: tempId,
        productId,
        quantity: payload.quantity,
        subType: payload.subType ?? null,
        purchasedDate: payload.purchasedDate ?? null,
        expiryDate: payload.expiryDate ?? null,
        location: payload.location ?? null,
        notes: payload.notes ?? null,
        expiryStatus: null,
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      saveQueryCache()
    },
  })
}
