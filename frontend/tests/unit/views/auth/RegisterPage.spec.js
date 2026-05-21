import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RegisterPage from '@/views/auth/RegisterPage.vue'
import { useAuthStore } from '@/stores/auth'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  RouterLink: { template: '<a><slot /></a>' }
}))

function makeWrapper() {
  return mount(RegisterPage, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      stubs: { RouterLink: { template: '<a><slot /></a>' } }
    }
  })
}

describe('RegisterPage', () => {
  beforeEach(() => { push.mockReset() })

  it('рендерит форму с username, password, confirm', () => {
    const w = makeWrapper()
    expect(w.find('[data-testid="register-username"]').exists()).toBe(true)
    expect(w.find('[data-testid="register-password"]').exists()).toBe(true)
    expect(w.find('[data-testid="register-confirm"]').exists()).toBe(true)
    expect(w.find('[data-testid="register-submit"]').exists()).toBe(true)
  })

  it('submit disabled пока поля не заполнены или пароли не совпадают', async () => {
    const w = makeWrapper()
    const submit = w.find('[data-testid="register-submit"]')
    expect(submit.attributes('disabled')).toBeDefined()

    await w.find('[data-testid="register-username"]').setValue('new')
    await w.find('[data-testid="register-password"]').setValue('pwd')
    await w.find('[data-testid="register-confirm"]').setValue('other')
    expect(submit.attributes('disabled')).toBeDefined()

    await w.find('[data-testid="register-confirm"]').setValue('pwd')
    expect(submit.attributes('disabled')).toBeUndefined()
  })

  it('submit вызывает auth.register и редиректит на /app', async () => {
    const w = makeWrapper()
    const auth = useAuthStore()
    auth.register = vi.fn().mockResolvedValue()
    await w.find('[data-testid="register-username"]').setValue('new')
    await w.find('[data-testid="register-password"]').setValue('pwd')
    await w.find('[data-testid="register-confirm"]').setValue('pwd')
    await w.find('form').trigger('submit.prevent')
    expect(auth.register).toHaveBeenCalledWith({ username: 'new', password: 'pwd' })
    await new Promise((r) => setTimeout(r, 0))
    expect(push).toHaveBeenCalledWith('/app')
  })

  it('при ошибке backend показывает текст', async () => {
    const w = makeWrapper()
    const auth = useAuthStore()
    auth.register = vi.fn().mockRejectedValue({
      response: { data: { message: 'username taken' } }
    })
    await w.find('[data-testid="register-username"]').setValue('new')
    await w.find('[data-testid="register-password"]').setValue('pwd')
    await w.find('[data-testid="register-confirm"]').setValue('pwd')
    await w.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 0))
    expect(w.find('[data-testid="register-error"]').text()).toContain('username taken')
  })
})
