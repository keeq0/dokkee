import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisStatistics from '@/components/AnalysisStatistics.vue'

describe('AnalysisStatistics', () => {
  it('рендерит все под-компоненты', () => {
    const wrapper = mount(AnalysisStatistics)
    expect(wrapper.find('.statistics__docs').exists()).toBe(true)
    expect(wrapper.find('.documents__checked').exists()).toBe(true)
    expect(wrapper.find('.statistics__danger').exists()).toBe(true)
    expect(wrapper.find('.statistics__contragents').exists()).toBe(true)
  })
})