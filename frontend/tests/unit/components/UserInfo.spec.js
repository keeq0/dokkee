import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserInfo from '@/components/UserInfo.vue'

describe('UserInfo', () => {
  it('отображает имя, фамилию, подписку, баланс', () => {
    const wrapper = mount(UserInfo, {
      props: {
        userName: 'Сергей',
        surname: 'Мякотных',
        subscription: 'Продвинутая',
        balance: 15
      }
    })
    expect(wrapper.text()).toContain('Сергей Мякотных')
    expect(wrapper.text()).toContain('Продвинутая')
    expect(wrapper.text()).toContain('15')
  })
})