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
import type { Category, ProductPayload, StockEntryPayload } from '../types'

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

export const useProductStock = (id: number) =>
  useQuery({
    queryKey: ['products', id, 'stock'],
    queryFn: () => getProductStock(id),
  })

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
  return useMutation({
    mutationFn: (payload: StockEntryPayload) => addStockEntry(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}
