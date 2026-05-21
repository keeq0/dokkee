import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LandingLayout from '@/layouts/LandingLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

import LandingPage from '@/views/landing/LandingPage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import RegisterPage from '@/views/auth/RegisterPage.vue'

import MainPage from '@/views/MainPage.vue'
import DocumentPage from '@/views/DocumentPage.vue'
import AnalysisPage from '@/views/AnalysisPage.vue'
import AccountPage from '@/views/AccountPage.vue'

const routes = [
  {
    path: '/',
    component: LandingLayout,
    children: [
      { path: '', name: 'Landing', component: LandingPage },
      { path: 'login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
      { path: 'register', name: 'Register', component: RegisterPage, meta: { guestOnly: true } }
    ]
  },
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'MainPage', component: MainPage },
      { path: 'documents', name: 'DocumentPage', component: DocumentPage },
      { path: 'analysis', name: 'AnalysisPage', component: AnalysisPage },
      { path: 'account', name: 'AccountPage', component: AccountPage }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isAuthenticated) {
    return { name: 'Login', query: { next: to.fullPath } }
  }
  if (to.matched.some((r) => r.meta.requiresSuperAdmin) && !auth.isSuperAdmin) {
    return { name: 'MainPage' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'MainPage' }
  }
})

export default router
