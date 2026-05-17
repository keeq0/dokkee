import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentsArea from '@/components/DocumentsArea.vue'

// Мок для IntersectionObserver
beforeEach(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe() {
      this.callback([{ isIntersecting: true, target: {} }])
    }
    unobserve() {}
    disconnect() {}
  }
})

describe('DocumentsArea', () => {
  it('переключает вид между плиткой и списком', async () => {
    const wrapper = mount(DocumentsArea)
    expect(wrapper.vm.currentView).toBe('tile')
    await wrapper.find('.view__button img[src*="list"]').trigger('click')
    expect(wrapper.vm.currentView).toBe('list')
    await wrapper.find('.view__button img[src*="tile"]').trigger('click')
    expect(wrapper.vm.currentView).toBe('tile')
  })

  it('сохраняет вид в localStorage', async () => {
    const wrapper = mount(DocumentsArea)
    await wrapper.find('.view__button img[src*="list"]').trigger('click')
    expect(localStorage.getItem('documentView')).toBe('list')
  })
})