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
import { applyOpsToCache, applyProductOpsToCache } from '../offline/applyOpsToCache'
import { saveQueryCache } from '../offline/queryPersister'

const PRODUCT_OP_TYPES = ['CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT'] as const

async function getPendingProductOps() {
  return db.pendingOps
    .filter((op) => (PRODUCT_OP_TYPES as readonly string[]).includes(op.type))
    .sortBy('createdAt')
}

export function makeProductsQueryFn(category: Category | undefined, qc: ReturnType<typeof useQueryClient>) {
  return async () => {
    let products: Product[]
    try {
      products = await getProducts(category)
    } catch (e) {
      if (!isBackendUnreachable(e)) throw e
      // Offline fallback: strip any temp ID products from cache — they'll be re-applied from pending ops
      const prev = qc.getQueryData<Product[]>(['products', category ?? null])
      if (prev) {
        products = prev.filter((p) => p.id > 0)
      } else {
        products = []
        const allQueries = qc.getQueriesData<Product[]>({ queryKey: ['products'] })
        for (const [, data] of allQueries) {
          if (Array.isArray(data) && data.length > 0) {
            products = data.filter((p) => p.id > 0)
            if (category) products = products.filter((p) => p.category === category)
            break
          }
        }
      }
    }

    // Always apply pending product ops so offline-created/edited/deleted products are visible
    const ops = await getPendingProductOps()
    if (ops.length > 0) {
      products = applyProductOpsToCache(products, ops)
      if (category) products = products.filter((p) => p.category === category)
    }

    return products
  }
}

export const useProducts = (category?: Category) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', category ?? null],
    queryFn: makeProductsQueryFn(category, qc),
  })
}

export const useProduct = (id: number) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      // Temp ID: construct product from the CREATE_PRODUCT pending op
      if (id < 0) {
        const ops = await db.pendingOps
          .filter((op) => (PRODUCT_OP_TYPES as readonly string[]).includes(op.type) && op.productId === id)
          .sortBy('createdAt')
        const createOp = ops.find((op) => op.type === 'CREATE_PRODUCT')
        if (!createOp) return undefined
        const p = createOp.payload as ProductPayload
        const base: Product = {
          id,
          name: p.name,
          category: p.category,
          unit: p.unit,
          targetQuantity: p.targetQuantity,
          currentStock: 0,
          notes: p.notes ?? null,
        }
        // Apply any subsequent UPDATE ops on this temp product
        const [result] = applyProductOpsToCache([base], ops.filter((op) => op.type !== 'CREATE_PRODUCT'))
        return result ?? base
      }

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
      // Temp product IDs have no server stock yet — start from empty
      if (id < 0) {
        serverData = []
      } else {
        serverData = await getProductStock(id)
      }
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
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async (payload: ProductPayload): Promise<Product> => {
      if (!isOffline) {
        try {
          return await createProduct(payload)
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      const tempId = -Date.now()
      await db.pendingOps.add({
        type: 'CREATE_PRODUCT',
        productId: tempId,
        entryId: null,
        tempId,
        payload,
        createdAt: Date.now(),
      })
      return {
        id: tempId,
        name: payload.name,
        category: payload.category,
        unit: payload.unit,
        targetQuantity: payload.targetQuantity,
        currentStock: 0,
        notes: payload.notes ?? null,
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      saveQueryCache()
    },
  })
}

export const useUpdateProduct = (id: number) => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async (payload: ProductPayload): Promise<Product> => {
      if (!isOffline) {
        try {
          return await updateProduct(id, payload)
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      // Store current state for conflict detection (only meaningful for real server IDs)
      const beforeSnapshot = id > 0 ? qc.getQueryData<Product>(['products', id]) : undefined
      await db.pendingOps.add({
        type: 'UPDATE_PRODUCT',
        productId: id,
        entryId: null,
        tempId: null,
        payload,
        beforeSnapshot,
        createdAt: Date.now(),
      })
      return {
        id,
        name: payload.name,
        category: payload.category,
        unit: payload.unit,
        targetQuantity: payload.targetQuantity,
        currentStock: qc.getQueryData<Product>(['products', id])?.currentStock ?? 0,
        notes: payload.notes ?? null,
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      saveQueryCache()
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  const isOffline = useBackendStatus()
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      if (!isOffline) {
        try {
          await deleteProduct(id)
          return
        } catch (e) {
          if (!isBackendUnreachable(e)) throw e
        }
      }
      await db.pendingOps.add({
        type: 'DELETE_PRODUCT',
        productId: id,
        entryId: null,
        tempId: null,
        payload: null,
        createdAt: Date.now(),
      })
    },
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
