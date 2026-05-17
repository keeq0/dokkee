import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisPage from '@/views/AnalysisPage.vue'

describe('AnalysisPage', () => {
  it('рендерит страницу анализа', () => {
    const wrapper = mount(AnalysisPage)
    expect(wrapper.text()).toContain('Статистика и аналитика')
    expect(wrapper.text()).toContain('Анализ моих документов')
  })
})