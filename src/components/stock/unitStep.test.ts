import { describe, it, expect } from 'vitest'
import type { Unit } from '../../types'
import { getUnitStep } from './unitStep'

describe('getUnitStep', () => {
  const cases: [Unit, number][] = [
    ['LITERS', 0.5],
    ['KG', 0.5],
    ['GRAMS', 100],
    ['PIECES', 1],
    ['CANS', 1],
  ]

  it.each(cases)('returns %s for unit %s', (unit, expected) => {
    expect(getUnitStep(unit)).toBe(expected)
  })
})
