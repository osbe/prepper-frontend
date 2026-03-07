import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'
import type { Product, StockEntry } from '../../types'
import type { PendingOp } from '../../offline/db'

vi.mock('./Navbar', () => ({ default: () => null }))
vi.mock('./BottomTabBar', () => ({ default: () => null }))
vi.mock('../../context/useSync', () => ({
  useSync: () => ({ setPrefetching: vi.fn(), conflicts: [], clearConflicts: vi.fn() }),
}))

const mocks = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getProductStock: vi.fn(),
  dbWhere: vi.fn(),
}))

vi.mock('../../api/products', () => ({
  getProducts: mocks.getProducts,
  getProduct: vi.fn(),
  getProductStock: mocks.getProductStock,
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  addStockEntry: vi.fn(),
}))

vi.mock('../../offline/db', () => ({
  db: {
    pendingOps: {
      where: mocks.dbWhere,
      filter: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve([])) })),
      add: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    queryCache: {
      put: vi.fn(() => Promise.resolve()),
      get: vi.fn(() => Promise.resolve(undefined)),
      delete: vi.fn(() => Promise.resolve()),
    },
  },
}))

// --- helpers ---

function product(id: number, category: Product['category'] = 'PRESERVED_FOOD'): Product {
  return { id, name: `Product ${id}`, category, unit: 'KG', targetQuantity: 10, currentStock: 5, notes: null }
}

function stockEntry(id: number, productId: number): StockEntry {
  return { id, productId, quantity: 1, subType: null, purchasedDate: null, expiryDate: null, location: null, notes: null, expiryStatus: null }
}

function op(overrides: Partial<PendingOp>): PendingOp {
  return { type: 'ADD', productId: 1, entryId: null, tempId: null, payload: null, createdAt: Date.now(), ...overrides }
}

function dbWhereChain(ops: PendingOp[] = []) {
  return { equals: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve(ops)) })) }
}

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<Layout />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return qc
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.dbWhere.mockReturnValue(dbWhereChain())
})

// ---------------------------------------------------------------------------

describe('Layout — startup prefetch', () => {
  it('fetches and caches the full product list on mount', async () => {
    mocks.getProducts.mockResolvedValue([product(1), product(2)])
    mocks.getProductStock.mockResolvedValue([])

    const qc = setup()

    await waitFor(() => {
      expect(qc.getQueryData(['products', null])).toHaveLength(2)
    })
    expect(mocks.getProducts).toHaveBeenCalledTimes(1)
  })

  it('fetches and caches stock entries for every product', async () => {
    mocks.getProducts.mockResolvedValue([product(1), product(2)])
    mocks.getProductStock
      .mockResolvedValueOnce([stockEntry(10, 1)])
      .mockResolvedValueOnce([stockEntry(20, 2)])

    const qc = setup()

    await waitFor(() => {
      expect(qc.getQueryData(['products', 1, 'stock'])).toHaveLength(1)
      expect(qc.getQueryData(['products', 2, 'stock'])).toHaveLength(1)
    })
    expect(mocks.getProductStock).toHaveBeenCalledWith(1)
    expect(mocks.getProductStock).toHaveBeenCalledWith(2)
  })

  it('merges pending Dexie ops into prefetched stock cache', async () => {
    mocks.getProducts.mockResolvedValue([product(1)])
    mocks.getProductStock.mockResolvedValue([stockEntry(10, 1)])
    mocks.dbWhere.mockReturnValue(dbWhereChain([
      op({ type: 'PATCH', productId: 1, entryId: 10, payload: { quantity: 99 } }),
    ]))

    const qc = setup()

    await waitFor(() => {
      const cached = qc.getQueryData<StockEntry[]>(['products', 1, 'stock'])
      expect(cached).toHaveLength(1)
      expect(cached![0].quantity).toBe(99)
    })
  })

  it('does not fetch stock when the product list is empty', async () => {
    mocks.getProducts.mockResolvedValue([])

    setup()

    await waitFor(() => expect(mocks.getProducts).toHaveBeenCalled())
    expect(mocks.getProductStock).not.toHaveBeenCalled()
  })

  it('does not re-prefetch data that is already fresh in cache', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })
    // Pre-populate cache as if a previous prefetch already ran
    qc.setQueryData(['products', null], [product(1)])
    qc.setQueryData(['products', 1, 'stock'], [stockEntry(10, 1)])

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Layout />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    // Give the effect time to run
    await waitFor(() => expect(mocks.getProducts).not.toHaveBeenCalled())
    expect(mocks.getProductStock).not.toHaveBeenCalled()
  })
})
