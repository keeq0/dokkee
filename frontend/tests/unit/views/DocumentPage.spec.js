import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

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

// Мокаем компоненты, которые могут падать
vi.mock('@/components/StorageSearch.vue', () => ({
  default: { template: '<div class="mock-storage-search"></div>' }
}))
vi.mock('@/components/StorageFilter.vue', () => ({
  default: { template: '<div class="mock-storage-filter"></div>' }
}))
vi.mock('@/components/DocumentsArea.vue', () => ({
  default: { template: '<div class="mock-documents-area"></div>' }
}))
vi.mock('@/components/NotesSection.vue', () => ({
  default: { template: '<div class="mock-notes-section"></div>' }
}))

import DocumentPage from '@/views/DocumentPage.vue'

describe('DocumentPage', () => {
  it('рендерит страницу документов', () => {
    const wrapper = mount(DocumentPage)
    expect(wrapper.find('h1').text()).toBe('Мои документы')
    expect(wrapper.find('.mock-documents-area').exists()).toBe(true)
    expect(wrapper.find('.mock-notes-section').exists()).toBe(true)
  })
})