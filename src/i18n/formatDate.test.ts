import { describe, it, expect } from 'vitest'
import { formatDate } from './index'

describe('formatDate', () => {
  it('formats a date in Swedish locale', () => {
    const result = formatDate('2025-06-15', 'sv')
    expect(result).toContain('2025')
    expect(result).toMatch(/jun/i)
  })

  it('formats a date in English locale differently from Swedish', () => {
    const sv = formatDate('2025-06-15', 'sv')
    const en = formatDate('2025-06-15', 'en')
    expect(en).toContain('2025')
    expect(sv).not.toBe(en)
  })

  it('returns the original string for an invalid date', () => {
    const bad = 'not-a-date'
    expect(formatDate(bad, 'sv')).toBe(bad)
  })
})
