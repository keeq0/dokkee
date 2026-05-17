import { createRouter, createWebHistory } from 'vue-router'

import LandingLayout from '@/layouts/LandingLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

import LandingPage from '@/views/landing/LandingPage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'

import MainPage from '@/views/MainPage.vue'
import DocumentPage from '@/views/DocumentPage.vue'
import AnalysisPage from '@/views/AnalysisPage.vue'
import AccountPage from '@/views/AccountPage.vue'

const routes = [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: LandingPage
      },
      {
        path: 'login',
        name: 'Login',
        component: LoginPage
      }
    ]
  },
  {
    path: '/app',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'MainPage',
        component: MainPage
      },
      {
        path: 'documents',
        name: 'DocumentPage',
        component: DocumentPage
      },
      {
        path: 'analysis',
        name: 'AnalysisPage',
        component: AnalysisPage
      },
      {
        path: 'account',
        name: 'AccountPage',
        component: AccountPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
