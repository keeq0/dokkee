import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatisticsDocs from '@/components/StatisticsDocs.vue'

describe('StatisticsDocs', () => {
  it('отображает процент и текст', () => {
    const wrapper = mount(StatisticsDocs, { props: { percentage: 82 } })
    expect(wrapper.text()).toContain('82%')
    expect(wrapper.text()).toContain('ДОКУМЕНТОВ')
    expect(wrapper.text()).toContain('соответствуют стандартам качества')
  })
})