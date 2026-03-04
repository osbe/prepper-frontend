import { describe, it, expect } from 'vitest'
import { applyOpsToCache } from './applyOpsToCache'
import type { StockEntry } from '../types'
import type { PendingOp } from './db'

const entry = (id: number, quantity = 5): StockEntry => ({
  id,
  productId: 1,
  quantity,
  subType: null,
  purchasedDate: null,
  expiryDate: null,
  location: null,
  notes: null,
  expiryStatus: null,
})

const op = (overrides: Partial<PendingOp>): PendingOp => ({
  type: 'ADD',
  productId: 1,
  entryId: null,
  tempId: null,
  payload: null,
  createdAt: Date.now(),
  ...overrides,
})

describe('applyOpsToCache', () => {
  it('ADD appends a new entry with tempId', () => {
    const result = applyOpsToCache(
      [entry(1)],
      [op({ type: 'ADD', tempId: -100, payload: { quantity: 3, subType: 'Penne', expiryDate: '2026-01-01' } })],
    )
    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ id: -100, quantity: 3, subType: 'Penne', expiryDate: '2026-01-01' })
  })

  it('PATCH updates the matching entry quantity', () => {
    const result = applyOpsToCache(
      [entry(1, 5), entry(2, 10)],
      [op({ type: 'PATCH', entryId: 1, payload: { quantity: 2 } })],
    )
    expect(result[0].quantity).toBe(2)
    expect(result[1].quantity).toBe(10)
  })

  it('UPDATE replaces matching entry fields', () => {
    const result = applyOpsToCache(
      [entry(1, 5)],
      [op({ type: 'UPDATE', entryId: 1, payload: { quantity: 8, subType: 'Fusilli', location: 'Shelf B' } })],
    )
    expect(result[0]).toMatchObject({ quantity: 8, subType: 'Fusilli', location: 'Shelf B' })
  })

  it('DELETE removes the matching entry', () => {
    const result = applyOpsToCache([entry(1), entry(2)], [op({ type: 'DELETE', entryId: 1 })])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('applies multiple ops in order', () => {
    const result = applyOpsToCache(
      [entry(1, 5)],
      [
        op({ type: 'ADD', tempId: -100, payload: { quantity: 3 } }),
        op({ type: 'PATCH', entryId: 1, payload: { quantity: 1 } }),
        op({ type: 'DELETE', entryId: -100 }),
      ],
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 1, quantity: 1 })
  })

  it('ignores ops with unknown entryId', () => {
    const original = [entry(1)]
    const result = applyOpsToCache(original, [op({ type: 'DELETE', entryId: 999 })])
    expect(result).toEqual(original)
  })

  it('returns empty array when all entries are deleted', () => {
    const result = applyOpsToCache([entry(1)], [op({ type: 'DELETE', entryId: 1 })])
    expect(result).toHaveLength(0)
  })
})
