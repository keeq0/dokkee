import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@/components/ServiceHeader.vue', () => ({
  default: { template: '<div class="mock-header">Header</div>' }
}))
vi.mock('@/components/ServiceLayout.vue', () => ({
  default: { template: '<div class="mock-layout">Layout</div>' }
}))
vi.mock('@/components/ServiceFooter.vue', () => ({
  default: { template: '<div class="mock-footer">Footer</div>' }
}))

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  RouterLink: { template: '<a><slot /></a>' }
}))

import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

function makeWrapper({ user = null, status = 'guest' } = {}) {
  const wrapper = mount(AppLayout, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      stubs: { RouterLink: { template: '<a><slot /></a>' } }
    }
  })
  const auth = useAuthStore()
  auth.user = user
  auth.status = status
  return { wrapper, auth }
}

describe('AppLayout', () => {
  beforeEach(() => { push.mockReset() })

  it('рендерит шапку, лейаут и подвал', () => {
    const { wrapper } = makeWrapper()
    expect(wrapper.find('.mock-header').exists()).toBe(true)
    expect(wrapper.find('.mock-layout').exists()).toBe(true)
    expect(wrapper.find('.mock-footer').exists()).toBe(true)
  })

  it('user-bar скрыт пока пользователь не аутентифицирован', () => {
    const { wrapper } = makeWrapper()
    expect(wrapper.find('[data-testid="user-bar-username"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="user-bar-logout"]').exists()).toBe(false)
  })

  it('user-bar показывает имя пользователя', async () => {
    const { wrapper } = makeWrapper({
      user: { id: 1, username: 'ivan', role: 'user' },
      status: 'authenticated'
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="user-bar-username"]').text()).toContain('ivan')
  })

  it('ссылка «Админка» скрыта для обычного пользователя', async () => {
    const { wrapper } = makeWrapper({
      user: { id: 1, username: 'ivan', role: 'user' },
      status: 'authenticated'
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="user-bar-admin-link"]').exists()).toBe(false)
  })

  it('ссылка «Админка» видна для super_admin', async () => {
    const { wrapper } = makeWrapper({
      user: { id: 1, username: 'admin', role: 'super_admin' },
      status: 'authenticated'
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="user-bar-admin-link"]').exists()).toBe(true)
  })

  it('logout вызывает auth.logout и редиректит на /', async () => {
    const { wrapper, auth } = makeWrapper({
      user: { id: 1, username: 'ivan', role: 'user' },
      status: 'authenticated'
    })
    auth.logout = vi.fn().mockResolvedValue()
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-testid="user-bar-logout"]').trigger('click')
    expect(auth.logout).toHaveBeenCalledTimes(1)
    await new Promise((r) => setTimeout(r, 0))
    expect(push).toHaveBeenCalledWith('/')
  })
})
