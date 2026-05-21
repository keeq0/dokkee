import { defineStore, getActivePinia } from 'pinia'
import { api } from '@/services/api'

const AUTH_BASE = ''

/**
 * Map<pinaInstance, Promise | null>
 * Хранит initPromise отдельно для каждого экземпляра pinia.
 * Это позволяет корректно сбрасывать промис между тестами,
 * где каждый тест создаёт новый экземпляр через createPinia().
 * @type {WeakMap<object, Promise<void> | null>}
 */
const _initPromises = new WeakMap()

const _useAuthStoreBase = defineStore('auth', {
  state: () => ({
    user: null,
    status: 'guest'
  }),

  getters: {
    isAuthenticated: (state) => state.status === 'authenticated' && state.user !== null,
    isSuperAdmin: (state) =>
      state.status === 'authenticated' && state.user?.role === 'super_admin'
  },

  actions: {
    async fetchMe() {
      this.status = 'loading'
      try {
        const { data } = await api.get('/me')
        this.user = data
        this.status = 'authenticated'
      } catch (e) {
        this.user = null
        this.status = 'guest'
      }
    },

    async login({ username, password }) {
      await api.post('/auth/sign-in', { username, password }, { baseURL: AUTH_BASE })
      await this.fetchMe()
    },

    async register({ username, password }) {
      await api.post('/auth/sign-up', { username, password }, { baseURL: AUTH_BASE })
      await this.fetchMe()
    },

    async logout() {
      try {
        await api.post('/auth/logout', null, { baseURL: AUTH_BASE })
      } catch (e) {
        // даже при сетевой ошибке гасим клиентский state
      }
      this.reset()
    },

    reset() {
      this.user = null
      this.status = 'guest'
      const pinia = getActivePinia()
      if (pinia) {
        _initPromises.set(pinia, null)
      }
    }
  }
})

/**
 * Auth store с методом init, возвращающим стабильный Promise-идентификатор.
 * init() вынесен за пределы Pinia action wrapping, чтобы гарантировать
 * что повторный вызов возвращает тот же объект Promise (Pinia оборачивает
 * Promise из action в новый .then().catch() при каждом вызове).
 */
export function useAuthStore() {
  const store = _useAuthStoreBase()
  const pinia = getActivePinia()

  if (!store.init) {
    store.init = function init() {
      const current = pinia ? _initPromises.get(pinia) : null
      if (!current) {
        const p = store.fetchMe()
        if (pinia) {
          _initPromises.set(pinia, p)
        }
        return p
      }
      return current
    }
  }

  return store
}
