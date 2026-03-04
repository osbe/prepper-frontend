import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import type { ReactNode } from 'react'
import { useProducts, useProduct } from './useProducts'
import type { Product } from '../types'

const mocks = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  dbWhere: vi.fn(),
}))

vi.mock('../api/products', () => ({
  getProducts: mocks.getProducts,
  getProduct: mocks.getProduct,
  getProductStock: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  addStockEntry: vi.fn(),
}))

vi.mock('../offline/db', () => ({
  db: {
    pendingOps: {
      where: mocks.dbWhere,
      add: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
  },
}))

// --- helpers ---

function product(id: number, category: Product['category'] = 'CANNED'): Product {
  return { id, name: `Product ${id}`, category, unit: 'KG', targetQuantity: 10, currentStock: 5, notes: null }
}

function networkError() {
  return new axios.AxiosError('Network Error')
}

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

function makeQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.dbWhere.mockReturnValue({ equals: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve([])) })) })
})

// ---------------------------------------------------------------------------

describe('useProducts — offline fallback', () => {
  it('returns cached product list when backend is unreachable', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', null], [product(1), product(2)])
    mocks.getProducts.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProducts(), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array when backend is unreachable and no cache exists', async () => {
    const qc = makeQc()
    mocks.getProducts.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProducts(), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('filters by category from the unfiltered list cache when offline', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', null], [product(1, 'CANNED'), product(2, 'WATER')])
    mocks.getProducts.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProducts('CANNED'), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].category).toBe('CANNED')
  })

  it('propagates non-network errors', async () => {
    const qc = makeQc()
    mocks.getProducts.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useProducts(), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------

describe('useProduct — offline fallback', () => {
  it('returns product from its own cache key when backend is unreachable', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', 1], product(1))
    mocks.getProduct.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProduct(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe(1)
  })

  it('finds the product in the list cache when its own cache key is empty', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', null], [product(1), product(2)])
    mocks.getProduct.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProduct(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe(1)
  })

  it('propagates error when backend is unreachable and no cache exists', async () => {
    const qc = makeQc()
    mocks.getProduct.mockRejectedValue(networkError())

    const { result } = renderHook(() => useProduct(99), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('propagates non-network errors regardless of cache', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', 1], product(1))
    mocks.getProduct.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useProduct(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
