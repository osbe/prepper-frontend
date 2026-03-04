import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import type { ReactNode } from 'react'
import { useProductStock, useAddStockEntry } from './useProducts'
import type { StockEntry, StockEntryPayload } from '../types'
import type { PendingOp } from '../offline/db'

// Hoist mock fns so vi.mock factories can reference them
const mocks = vi.hoisted(() => ({
  getProductStock: vi.fn(),
  addStockEntry: vi.fn(),
  useBackendStatus: vi.fn(() => false as boolean),
  dbWhere: vi.fn(),
  dbAdd: vi.fn(),
}))

vi.mock('../api/products', () => ({
  getProductStock: mocks.getProductStock,
  addStockEntry: mocks.addStockEntry,
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

vi.mock('../context/useBackendStatus', () => ({
  useBackendStatus: mocks.useBackendStatus,
}))

vi.mock('../offline/db', () => ({
  db: {
    pendingOps: {
      where: mocks.dbWhere,
      add: mocks.dbAdd,
      count: vi.fn(() => Promise.resolve(0)),
    },
  },
}))

// --- Test helpers ---

const entry = (id: number, quantity = 5): StockEntry => ({
  id, productId: 1, quantity, subType: null, purchasedDate: null,
  expiryDate: null, location: null, notes: null, expiryStatus: null,
})

const op = (overrides: Partial<PendingOp>): PendingOp => ({
  type: 'ADD', productId: 1, entryId: null, tempId: null,
  payload: null, createdAt: Date.now(), ...overrides,
})

/** Returns a mock for `db.pendingOps.where(...).equals(...).sortBy(...)` */
function dbWhereChain(ops: PendingOp[] = []) {
  return { equals: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve(ops)) })) }
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
  mocks.useBackendStatus.mockReturnValue(false)
  mocks.dbWhere.mockReturnValue(dbWhereChain())
  mocks.dbAdd.mockResolvedValue(1)
})

// ---------------------------------------------------------------------------

describe('useProductStock — offline fallback', () => {
  it('applies pending Dexie ops on top of server data when online', async () => {
    const qc = makeQc()
    mocks.getProductStock.mockResolvedValue([entry(1, 5)])
    mocks.dbWhere.mockReturnValue(dbWhereChain([
      op({ type: 'PATCH', entryId: 1, payload: { quantity: 10 } }),
    ]))

    const { result } = renderHook(() => useProductStock(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].quantity).toBe(10)
  })

  it('falls back to filtered cache + re-applies Dexie ops when backend is unreachable', async () => {
    const qc = makeQc()
    // Cache holds a real entry and the temp entry from an earlier offline ADD
    qc.setQueryData(['products', 1, 'stock'], [entry(1, 5), entry(-100, 3)])

    mocks.getProductStock.mockRejectedValue(new axios.AxiosError('Network Error', 'ECONNREFUSED'))
    // Dexie still holds the ADD op (not synced yet)
    mocks.dbWhere.mockReturnValue(dbWhereChain([
      op({ type: 'ADD', tempId: -100, payload: { quantity: 3 } }),
    ]))

    const { result } = renderHook(() => useProductStock(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should have entry(1) from filtered cache + re-applied ADD — exactly 2, no duplicates
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: -100 }),
    ]))
  })

  it('returns only the pending ops when backend is unreachable and cache is empty', async () => {
    const qc = makeQc()
    mocks.getProductStock.mockRejectedValue(new axios.AxiosError('Network Error', 'ECONNREFUSED'))
    mocks.dbWhere.mockReturnValue(dbWhereChain([
      op({ type: 'ADD', tempId: -200, payload: { quantity: 7 } }),
    ]))

    const { result } = renderHook(() => useProductStock(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0]).toMatchObject({ id: -200, quantity: 7 })
  })

  it('does not duplicate entries when the query refetches repeatedly while offline', async () => {
    const qc = makeQc()
    qc.setQueryData(['products', 1, 'stock'], [entry(1), entry(-100, 3)])

    mocks.getProductStock.mockRejectedValue(new axios.AxiosError('Network Error', 'ECONNREFUSED'))
    mocks.dbWhere.mockReturnValue(dbWhereChain([
      op({ type: 'ADD', tempId: -100, payload: { quantity: 3 } }),
    ]))

    const { result } = renderHook(() => useProductStock(1), { wrapper: wrapper(qc) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Second refetch — as triggered e.g. by invalidateQueries after a failed sync attempt
    await act(async () => {
      await result.current.refetch()
    })

    // Still exactly 2 entries — no duplicate from double-applying the ADD op
    expect(result.current.data).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------

describe('useAddStockEntry — offline queuing', () => {
  it('queues an ADD op to Dexie and returns a fake entry with negative ID when offline', async () => {
    mocks.useBackendStatus.mockReturnValue(true) // offline

    const qc = makeQc()
    const { result } = renderHook(() => useAddStockEntry(42), { wrapper: wrapper(qc) })

    const payload: StockEntryPayload = { quantity: 5 }
    let fake: StockEntry | undefined

    await act(async () => {
      fake = await result.current.mutateAsync(payload)
    })

    expect(mocks.addStockEntry).not.toHaveBeenCalled()
    expect(mocks.dbAdd).toHaveBeenCalledWith(expect.objectContaining({
      type: 'ADD',
      productId: 42,
      payload,
      tempId: expect.any(Number),
    }))
    expect((mocks.dbAdd.mock.calls[0][0] as PendingOp).tempId!).toBeLessThan(0)
    expect(fake!.id).toBeLessThan(0)
    expect(fake!.quantity).toBe(5)
    expect(fake!.productId).toBe(42)
  })

  it('calls the API directly when online', async () => {
    mocks.useBackendStatus.mockReturnValue(false) // online
    mocks.addStockEntry.mockResolvedValue(entry(99, 5))

    const qc = makeQc()
    const { result } = renderHook(() => useAddStockEntry(42), { wrapper: wrapper(qc) })

    await act(async () => {
      await result.current.mutateAsync({ quantity: 5 })
    })

    expect(mocks.addStockEntry).toHaveBeenCalledWith(42, { quantity: 5 })
    expect(mocks.dbAdd).not.toHaveBeenCalled()
  })
})
