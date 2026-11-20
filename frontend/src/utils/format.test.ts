import { describe, expect, it } from 'vitest'
import { formatRelative } from './format'

const now = new Date('2026-06-15T12:00:00Z').getTime()
const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString()

describe('formatRelative', () => {
  it.each([
    [ago(30), 'just now'],
    [ago(5 * 60), '5 minutes ago'],
    [ago(2 * 86_400), '2 days ago'],
    [ago(-5 * 86_400), 'in 5 days'],
  ])('formats %s as "%s"', (iso, expected) => {
    expect(formatRelative(iso, now)).toBe(expected)
  })

  it('switches to a calendar date after 3 days, adding the year only when it differs', () => {
    expect(formatRelative('2026-06-10T12:00:00Z', now)).toBe('10 Jun')
    expect(formatRelative('2025-12-01T12:00:00Z', now)).toBe('1 Dec 2025')
  })
})
