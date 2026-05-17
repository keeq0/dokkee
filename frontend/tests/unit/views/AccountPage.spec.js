import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountPage from '@/views/AccountPage.vue'

describe('AccountPage', () => {
  it('рендерит заголовок', () => {
    const wrapper = mount(AccountPage)
    expect(wrapper.find('h1').text()).toBe('Мой аккаунт')
  })
})