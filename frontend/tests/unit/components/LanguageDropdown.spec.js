import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageDropdown from '@/components/LanguageDropdown.vue'

describe('LanguageDropdown', () => {
  it('отображает текущий язык', () => {
    const wrapper = mount(LanguageDropdown, {
      props: { currentLanguage: 'RU', languages: ['RU', 'EN'] }
    })
    expect(wrapper.find('.header__language').text()).toBe('RU')
  })

  it('при наведении открывает список', async () => {
    const wrapper = mount(LanguageDropdown, {
      props: { currentLanguage: 'RU', languages: ['RU', 'EN'] }
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.language-dropdown__list').classes()).toContain('open')
  })

  it('выбор языка эмитит событие', async () => {
    const wrapper = mount(LanguageDropdown, {
      props: { currentLanguage: 'RU', languages: ['RU', 'EN'] }
    })
    await wrapper.trigger('mouseenter')
    await wrapper.findAll('.language-dropdown__item')[1].trigger('click')
    expect(wrapper.emitted('change-language')[0][0]).toBe('EN')
  })
})