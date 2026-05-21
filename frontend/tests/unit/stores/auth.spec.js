import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

describe('stores/auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    useAuthStore().reset()
  })

  it('инициализируется как гость', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
    expect(store.isAuthenticated).toBe(false)
    expect(store.isSuperAdmin).toBe(false)
  })

  it('isAuthenticated=true только при status=authenticated', () => {
    const store = useAuthStore()
    store.user = { id: 1, username: 'ivan', role: 'user' }
    store.status = 'authenticated'
    expect(store.isAuthenticated).toBe(true)
  })

  it('isSuperAdmin=true только при role=super_admin', () => {
    const store = useAuthStore()
    store.user = { id: 1, username: 'admin', role: 'super_admin' }
    store.status = 'authenticated'
    expect(store.isSuperAdmin).toBe(true)

    store.user.role = 'user'
    expect(store.isSuperAdmin).toBe(false)
  })

  it('init: успешный fetchMe заполняет user и переключает в authenticated', async () => {
    api.get.mockResolvedValue({ data: { id: 7, username: 'ivan', role: 'user' } })
    const store = useAuthStore()
    await store.init()
    expect(api.get).toHaveBeenCalledWith('/me')
    expect(store.user).toEqual({ id: 7, username: 'ivan', role: 'user' })
    expect(store.status).toBe('authenticated')
  })

  it('init: 401 переводит в guest', async () => {
    api.get.mockRejectedValue({ response: { status: 401 } })
    const store = useAuthStore()
    await store.init()
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
  })

  it('init: повторный вызов не делает повторный HTTP запрос', async () => {
    api.get.mockResolvedValue({ data: { id: 1, username: 'ivan', role: 'user' } })
    const store = useAuthStore()
    await store.init()
    await store.init()
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('init: конкурентные вызовы тоже делают один HTTP запрос', async () => {
    api.get.mockResolvedValue({ data: { id: 1, username: 'ivan', role: 'user' } })
    const store = useAuthStore()
    await Promise.all([store.init(), store.init()])
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('login: POST /auth/sign-in -> fetchMe -> authenticated', async () => {
    api.post.mockResolvedValue({ data: { ok: true } })
    api.get.mockResolvedValue({ data: { id: 1, username: 'ivan', role: 'user' } })
    const store = useAuthStore()
    await store.login({ username: 'ivan', password: 'secret' })
    expect(api.post).toHaveBeenCalledWith('/auth/sign-in', {
      username: 'ivan',
      password: 'secret'
    }, { baseURL: '' })
    expect(api.get).toHaveBeenCalledWith('/me')
    expect(store.status).toBe('authenticated')
    expect(store.user.username).toBe('ivan')
  })

  it('login: при ошибке бросает и не меняет user', async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { message: 'bad creds' } } })
    const store = useAuthStore()
    await expect(store.login({ username: 'x', password: 'y' })).rejects.toBeTruthy()
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
  })

  it('register: POST /auth/sign-up -> fetchMe -> authenticated', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 2, username: 'new', role: 'user' } } })
    api.get.mockResolvedValue({ data: { id: 2, username: 'new', role: 'user' } })
    const store = useAuthStore()
    await store.register({ username: 'new', password: 'pwd' })
    expect(api.post).toHaveBeenCalledWith('/auth/sign-up', {
      username: 'new',
      password: 'pwd'
    }, { baseURL: '' })
    expect(store.status).toBe('authenticated')
  })

  it('logout: POST /auth/logout + reset', async () => {
    api.post.mockResolvedValue({ data: { ok: true } })
    const store = useAuthStore()
    store.user = { id: 1, username: 'ivan', role: 'user' }
    store.status = 'authenticated'
    await store.logout()
    expect(api.post).toHaveBeenCalledWith('/auth/logout', null, { baseURL: '' })
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
  })

  it('logout: при сетевой ошибке всё равно сбрасывает state', async () => {
    api.post.mockRejectedValue(new Error('network'))
    const store = useAuthStore()
    store.user = { id: 1, username: 'ivan', role: 'user' }
    store.status = 'authenticated'
    await store.logout()
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
  })

  it('reset: очищает state', () => {
    const store = useAuthStore()
    store.user = { id: 1, username: 'ivan', role: 'user' }
    store.status = 'authenticated'
    store.reset()
    expect(store.user).toBeNull()
    expect(store.status).toBe('guest')
  })
})
