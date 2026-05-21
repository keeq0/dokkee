import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/auth/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'

const push = vi.fn()
const route = { query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
  RouterLink: { template: '<a><slot /></a>' }
}))

function makeWrapper() {
  return mount(LoginPage, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      stubs: { RouterLink: { template: '<a><slot /></a>' } }
    }
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    push.mockReset()
    route.query = {}
  })

  it('рендерит форму с полями username и password', () => {
    const w = makeWrapper()
    expect(w.find('[data-testid="login-username"]').exists()).toBe(true)
    expect(w.find('[data-testid="login-password"]').exists()).toBe(true)
    expect(w.find('[data-testid="login-submit"]').exists()).toBe(true)
  })

  it('submit disabled пока оба поля пустые', async () => {
    const w = makeWrapper()
    const submit = w.find('[data-testid="login-submit"]')
    expect(submit.attributes('disabled')).toBeDefined()
    await w.find('[data-testid="login-username"]').setValue('ivan')
    await w.find('[data-testid="login-password"]').setValue('secret')
    expect(submit.attributes('disabled')).toBeUndefined()
  })

  it('submit вызывает auth.login и редиректит на /app по умолчанию', async () => {
    const w = makeWrapper()
    const auth = useAuthStore()
    auth.login = vi.fn().mockResolvedValue()
    await w.find('[data-testid="login-username"]').setValue('ivan')
    await w.find('[data-testid="login-password"]').setValue('secret')
    await w.find('form').trigger('submit.prevent')
    expect(auth.login).toHaveBeenCalledWith({ username: 'ivan', password: 'secret' })
    await new Promise((r) => setTimeout(r, 0))
    expect(push).toHaveBeenCalledWith('/app')
  })

  it('submit редиректит на ?next если он задан', async () => {
    route.query = { next: '/app/account' }
    const w = makeWrapper()
    const auth = useAuthStore()
    auth.login = vi.fn().mockResolvedValue()
    await w.find('[data-testid="login-username"]').setValue('ivan')
    await w.find('[data-testid="login-password"]').setValue('secret')
    await w.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 0))
    expect(push).toHaveBeenCalledWith('/app/account')
  })

  it('при ошибке backend показывает текст ошибки', async () => {
    const w = makeWrapper()
    const auth = useAuthStore()
    auth.login = vi.fn().mockRejectedValue({
      response: { data: { message: 'invalid credentials' } }
    })
    await w.find('[data-testid="login-username"]').setValue('ivan')
    await w.find('[data-testid="login-password"]').setValue('wrong')
    await w.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 0))
    expect(w.find('[data-testid="login-error"]').text()).toContain('invalid credentials')
    expect(push).not.toHaveBeenCalled()
  })
})
