import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Мокаем все дочерние компоненты
vi.mock('@/components/ServiceHeader.vue', () => ({
  default: { template: '<div class="mock-header">Header</div>' }
}))
vi.mock('@/components/ServiceLayout.vue', () => ({
  default: { template: '<div class="mock-layout">Layout</div>' }
}))
vi.mock('@/components/ServiceFooter.vue', () => ({
  default: { template: '<div class="mock-footer">Footer</div>' }
}))

import ServicePage from '@/views/ServicePage.vue'

describe('ServicePage', () => {
  it('рендерит шапку, лейаут и подвал', () => {
    const wrapper = mount(ServicePage)
    expect(wrapper.find('.mock-header').exists()).toBe(true)
    expect(wrapper.find('.mock-layout').exists()).toBe(true)
    expect(wrapper.find('.mock-footer').exists()).toBe(true)
  })
})