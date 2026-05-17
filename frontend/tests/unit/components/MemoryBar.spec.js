import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MemoryBar from '@/components/MemoryBar.vue'

describe('MemoryBar', () => {
  it('отображает начальное значение 0 МБ', () => {
    const wrapper = mount(MemoryBar, { props: { documents: [{ size: '75 MB' }] } })
    expect(wrapper.text()).toContain('0 МБ')
  })

  it('показывает общий объём памяти', () => {
    const wrapper = mount(MemoryBar, { props: { documents: [{ size: '75 MB' }] } })
    expect(wrapper.text()).toContain('/ 2 ГБ')
  })
})