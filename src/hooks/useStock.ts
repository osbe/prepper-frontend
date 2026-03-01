import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteStockEntry,
  getExpiredStock,
  getExpiringStock,
  getLowStock,
  patchStockEntry,
  putStockEntry,
} from '../api/stock'
import type { StockEntryPayload } from '../types'

export const useExpiredStock = () =>
  useQuery({ queryKey: ['stock', 'expired'], queryFn: getExpiredStock })

export const useExpiringStock = (days = 30) =>
  useQuery({
    queryKey: ['stock', 'expiring', days],
    queryFn: () => getExpiringStock(days),
  })

export const useLowStock = () =>
  useQuery({ queryKey: ['stock', 'low'], queryFn: getLowStock })

export const usePatchStock = (productId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      patchStockEntry(id, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', productId, 'stock'] })
      qc.invalidateQueries({ queryKey: ['products', productId] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export const useUpdateStock = (productId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & StockEntryPayload) =>
      putStockEntry(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', productId, 'stock'] })
      qc.invalidateQueries({ queryKey: ['products', productId] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export const useDeleteStock = (productId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStockEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', productId, 'stock'] })
      qc.invalidateQueries({ queryKey: ['products', productId] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}
