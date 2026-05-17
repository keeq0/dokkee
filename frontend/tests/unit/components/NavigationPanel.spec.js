import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NavigationPanel from '@/components/NavigationPanel.vue'

// Мокаем роутер
const routes = [
  { path: '/', name: 'MainPage' },
  { path: '/documents', name: 'DocumentPage' },
  { path: '/analysis', name: 'AnalysisPage' },
  { path: '/account', name: 'AccountPage' }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('NavigationPanel', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('отображает пункты меню', () => {
    const wrapper = mount(NavigationPanel, {
      global: { plugins: [router] }
    })
    const items = wrapper.findAll('.navigation__item')
    expect(items.length).toBe(5)
    expect(wrapper.text()).toContain('Главная')
    expect(wrapper.text()).toContain('Документы')
  })

  it('при клике на "Документы" вызывает router.push и сохраняет в localStorage', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(NavigationPanel, {
      global: { plugins: [router] }
    })
    await wrapper.findAll('.navigation__item')[1].trigger('click')
    expect(pushSpy).toHaveBeenCalledWith({ name: 'DocumentPage' })
    expect(localStorage.getItem('activeNav')).toBe('Документы')
  })
})