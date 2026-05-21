import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

export function setupApiInterceptors({ onUnauthorized }) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        onUnauthorized()
      }
      return Promise.reject(error)
    }
  )
}
