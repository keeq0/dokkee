import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const interceptorsResponseUse = vi.fn()
  const post = vi.fn()
  const get = vi.fn()
  const instance = {
    defaults: { baseURL: '', withCredentials: false },
    interceptors: { response: { use: interceptorsResponseUse } },
    post,
    get
  }
  return {
    default: {
      create: vi.fn((config) => {
        Object.assign(instance.defaults, config)
        return instance
      })
    }
  }
})

import axios from 'axios'
import { api, setupApiInterceptors } from '@/services/api'

describe('services/api', () => {
  it('создаёт axios instance с baseURL=/api и withCredentials=true', () => {
    expect(api.defaults.baseURL).toBe('/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setupApiInterceptors регистрирует response-interceptor', () => {
    setupApiInterceptors({ onUnauthorized: vi.fn() })
    expect(api.interceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('interceptor вызывает onUnauthorized при 401', async () => {
    const onUnauthorized = vi.fn()
    setupApiInterceptors({ onUnauthorized })
    const [, errorHandler] = api.interceptors.response.use.mock.calls[0]
    await expect(errorHandler({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 }
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('interceptor НЕ вызывает onUnauthorized при не-401', async () => {
    const onUnauthorized = vi.fn()
    setupApiInterceptors({ onUnauthorized })
    const [, errorHandler] = api.interceptors.response.use.mock.calls[0]
    await expect(errorHandler({ response: { status: 500 } })).rejects.toBeTruthy()
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('interceptor пропускает успешные ответы', () => {
    setupApiInterceptors({ onUnauthorized: vi.fn() })
    const [successHandler] = api.interceptors.response.use.mock.calls[0]
    const response = { status: 200, data: { ok: true } }
    expect(successHandler(response)).toBe(response)
  })
})
