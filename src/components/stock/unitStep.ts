import type { Unit } from '../../types'

export function getUnitStep(unit: Unit): number {
  switch (unit) {
    case 'LITERS':  return 0.5
    case 'KG':      return 0.5
    case 'GRAMS':   return 100
    case 'PIECES':  return 1
    case 'CANS':    return 1
    default: {
      const _exhaustive: never = unit
      return _exhaustive
    }
  }
}
