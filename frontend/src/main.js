import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupApiInterceptors } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import '@/styles/tokens.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

const auth = useAuthStore()
setupApiInterceptors({
  onUnauthorized: () => {
    auth.reset()
    const current = router.currentRoute.value
    if (current.name !== 'Login') {
      router.push({
        name: 'Login',
        query: current.fullPath !== '/' ? { next: current.fullPath } : undefined
      })
    }
  }
})

app.mount('#app')
