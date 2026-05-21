import { defineStore } from 'pinia'
import { api } from '@/services/api'

const AUTH_BASE = ''

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    status: 'guest',
    _initPromise: null
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

    init() {
      if (!this._initPromise) {
        this._initPromise = this.fetchMe()
      }
      return this._initPromise
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
      this._initPromise = null
    }
  }
})
