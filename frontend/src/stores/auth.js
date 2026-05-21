import { defineStore } from 'pinia'
import { api } from '@/services/api'

let initPromise = null

export const useAuthStore = defineStore('auth', {
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

    init() {
      if (!initPromise) {
        initPromise = this.fetchMe()
      }
      return initPromise
    },

    async login({ username, password }) {
      await api.post('/auth/sign-in', { username, password }, { baseURL: '' })
      await this.fetchMe()
    },

    async register({ username, password }) {
      await api.post('/auth/sign-up', { username, password }, { baseURL: '' })
      await this.fetchMe()
    },

    async logout() {
      try {
        await api.post('/auth/logout', null, { baseURL: '' })
      } catch (e) {
        // intentionally ignored: cookie may already be invalid
      }
      this.reset()
    },

    reset() {
      this.user = null
      this.status = 'guest'
      initPromise = null
    }
  }
})
