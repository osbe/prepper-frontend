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
import type { Category, ProductPayload, StockEntry, StockEntryPayload } from '../types'
import { useBackendStatus } from '../context/useBackendStatus'
import { isBackendUnreachable } from '../api/client'
import { db } from '../offline/db'
import { applyOpsToCache } from '../offline/applyOpsToCache'

export const useProducts = (category?: Category) =>
  useQuery({
    queryKey: ['products', category ?? null],
    queryFn: () => getProducts(category),
  })

export const useProduct = (id: number) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id),
  })

export const useProductStock = (id: number) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', id, 'stock'],
    queryFn: async () => {
      let serverData: StockEntry[]
      try {
        serverData = await getProductStock(id)
      } catch {
        // Backend unreachable — fall back to last known server state, stripping
        // pending-op-derived entries (negative IDs) to avoid double-applying ops
        const prev = qc.getQueryData<StockEntry[]>(['products', id, 'stock']) ?? []
        serverData = prev.filter((e) => e.id > 0)
      }
      const ops = await db.pendingOps.where('productId').equals(id).sortBy('createdAt')
      return ops.length > 0 ? applyOpsToCache(serverData, ops) : serverData
    },
  })
}

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useUpdateProduct = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
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
    },
  })
}
