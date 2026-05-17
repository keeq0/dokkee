import { describe, it, expect } from 'vitest'
import { formatDateToDDMMYYYY, formatDateForInput } from '@/helpers/dateUtils'

describe('dateUtils', () => {
  it('formatDateToDDMMYYYY корректно форматирует дату', () => {
    expect(formatDateToDDMMYYYY('2025-03-15')).toBe('15.03.2025')
    expect(formatDateToDDMMYYYY('2025-12-01')).toBe('01.12.2025')
  })

  it('formatDateForInput возвращает строку для input type="date"', () => {
    const date = new Date(2025, 2, 15) // 15 марта 2025
    expect(formatDateForInput(date)).toBe('2025-03-15')
  })
})