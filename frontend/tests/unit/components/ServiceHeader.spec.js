import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Мокаем дочерние компоненты, которые могут иметь свои проблемы
vi.mock('@/components/LanguageDropdown.vue', () => ({
  default: { template: '<div class="mock-language">Language</div>' }
}))
vi.mock('@/components/SearchBar.vue', () => ({
  default: { template: '<div class="mock-search">Search</div>' }
}))
vi.mock('@/components/NotificationPanel.vue', () => ({
  default: { template: '<div class="mock-notification">Notif</div>' }
}))
vi.mock('@/components/UserInfo.vue', () => ({
  default: { template: '<div class="mock-user">User</div>' }
}))

import ServiceHeader from '@/components/ServiceHeader.vue'

describe('ServiceHeader', () => {
  it('рендерит приветствие и компоненты', () => {
    const wrapper = mount(ServiceHeader)
    expect(wrapper.text()).toContain('Добрый день')
    expect(wrapper.find('.mock-language').exists()).toBe(true)
    expect(wrapper.find('.mock-search').exists()).toBe(true)
    expect(wrapper.find('.mock-notification').exists()).toBe(true)
    expect(wrapper.find('.mock-user').exists()).toBe(true)
  })
})