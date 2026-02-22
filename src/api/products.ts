import client from './client'
import type { Category, Product, ProductPayload, StockEntry, StockEntryPayload } from '../types'

export const getProducts = (category?: Category) =>
  client
    .get<Product[]>('/products', { params: category ? { category } : undefined })
    .then((r) => r.data)

export const getProduct = (id: number) =>
  client.get<Product>(`/products/${id}`).then((r) => r.data)

export const createProduct = (payload: ProductPayload) =>
  client.post<Product>('/products', payload).then((r) => r.data)

export const updateProduct = (id: number, payload: ProductPayload) =>
  client.put<Product>(`/products/${id}`, payload).then((r) => r.data)

export const deleteProduct = (id: number) =>
  client.delete(`/products/${id}`)

export const getProductStock = (id: number) =>
  client.get<StockEntry[]>(`/products/${id}/stock`).then((r) => r.data)

export const addStockEntry = (productId: number, payload: StockEntryPayload) =>
  client.post<StockEntry>(`/products/${productId}/stock`, payload).then((r) => r.data)
