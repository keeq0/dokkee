import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import DocumentPage from '../views/DocumentPage.vue'
import AnalysisPage from '../views/AnalysisPage.vue'
import AccountPage from '../views/AccountPage.vue'

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/documents',
    name: 'DocumentPage',
    component: DocumentPage
  },
  {
    path: '/analysis',
    name: 'AnalysisPage',
    component: AnalysisPage
  },
  {
    path: '/account',
    name: 'AccountPage',
    component: AccountPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
