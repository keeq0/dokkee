import { describe, it, expect } from 'vitest'
import { getFileSizeInMB } from '@/helpers/memoryUtils'

describe('memoryUtils', () => {
  it('getFileSizeInMB парсит размеры', () => {
    expect(getFileSizeInMB({ size: '75 MB' })).toBe(75)
    expect(getFileSizeInMB({ size: '160.5 MB' })).toBe(160.5)
    expect(getFileSizeInMB({ size: '2 ГБ' })).toBe(2048)
    expect(getFileSizeInMB({ size: '512 КБ' })).toBe(0.5)
    expect(getFileSizeInMB({ size: '1 TB' })).toBe(1048576)
  })
})