import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PreparednessRating from './PreparednessRating'
import type { Product, StockEntry } from '../../types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Test product',
    category: 'PRESERVED_FOOD',
    unit: 'CANS',
    targetQuantity: 10,
    currentStock: 0,
    notes: null,
    ...overrides,
  }
}

function makeExpiredEntry(productId: number, quantity: number): StockEntry {
  return {
    id: 99,
    productId,
    quantity,
    subType: null,
    purchasedDate: null,
    expiryDate: '2020-01-01',
    location: null,
    notes: null,
    expiryStatus: 'EXPIRED',
  }
}

const filledStars = () => screen.queryAllByText('★').length

describe('PreparednessRating', () => {
  it('renders nothing when product list is empty', () => {
    const { container } = render(<PreparednessRating products={[]} expired={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows 0 filled stars and hint_add_food_or_water when no stock', () => {
    const products = [makeProduct({ id: 1, currentStock: 0, targetQuantity: 10 })]
    render(<PreparednessRating products={products} expired={[]} />)
    expect(filledStars()).toBe(0)
    expect(screen.getByText('preparedness.hint_add_food_or_water')).toBeInTheDocument()
  })

  it('shows 5 filled stars and perfect message when all targets are met', () => {
    const products = [
      makeProduct({ id: 1, category: 'PRESERVED_FOOD', currentStock: 10, targetQuantity: 10 }),
      makeProduct({ id: 2, category: 'WATER', currentStock: 5, targetQuantity: 5 }),
    ]
    render(<PreparednessRating products={products} expired={[]} />)
    expect(filledStars()).toBe(5)
    expect(screen.getByText('preparedness.perfect')).toBeInTheDocument()
  })

  it('shows hint_food_or_water_half when both half-targets are unearned', () => {
    const products = [
      makeProduct({ id: 1, category: 'PRESERVED_FOOD', currentStock: 1, targetQuantity: 10 }),
      makeProduct({ id: 2, category: 'WATER', currentStock: 1, targetQuantity: 10 }),
    ]
    render(<PreparednessRating products={products} expired={[]} />)
    expect(filledStars()).toBe(2)
    expect(screen.getByText('preparedness.hint_food_or_water_half')).toBeInTheDocument()
  })

  it('subtracts expired stock when counting stars', () => {
    const product = makeProduct({ id: 1, category: 'PRESERVED_FOOD', currentStock: 2, targetQuantity: 2 })

    // Without expired: star 0 (some food > 0) and star 2 (food >= 50% target) are earned → 2 stars
    const { rerender } = render(<PreparednessRating products={[product]} expired={[]} />)
    expect(filledStars()).toBe(2)

    // Expire all stock: nonExpiredStock drops to 0 → 0 stars
    rerender(<PreparednessRating products={[product]} expired={[makeExpiredEntry(1, 2)]} />)
    expect(filledStars()).toBe(0)
    expect(screen.getByText('preparedness.hint_add_food_or_water')).toBeInTheDocument()
  })
})
