import client from './client'
import type { Product, StockEntry } from '../types'

export const getExpiredStock = () =>
  client.get<StockEntry[]>('/stock/expired').then((r) => r.data)

export const getExpiringStock = (days = 30) =>
  client.get<StockEntry[]>('/stock/expiring', { params: { days } }).then((r) => r.data)

export const getLowStock = () =>
  client.get<Product[]>('/stock/low').then((r) => r.data)

export const patchStockEntry = (id: number, quantity: number) =>
  client.patch<StockEntry>(`/stock/${id}`, { quantity }).then((r) => r.data)

export const deleteStockEntry = (id: number) =>
  client.delete(`/stock/${id}`)
