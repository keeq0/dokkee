import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisFilesOptions from '@/components/AnalysisFilesOptions.vue'

describe('AnalysisFilesOptions', () => {
  it('рендерит поле поиска и MemoryBar', () => {
    const wrapper = mount(AnalysisFilesOptions)
    expect(wrapper.find('.options__search').exists()).toBe(true)
    expect(wrapper.find('.analysis-memory-bar').exists()).toBe(true)
  })

  it('обновляет searchQuery при вводе текста', async () => {
    const wrapper = mount(AnalysisFilesOptions)
    const input = wrapper.find('.search__input')
    await input.setValue('test query')
    expect(wrapper.vm.searchQuery).toBe('test query')
  })

  it('эмитит search при вводе', async () => {
    const wrapper = mount(AnalysisFilesOptions)
    const input = wrapper.find('.search__input')
    await input.setValue('test')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0][0]).toBe('test')
  })
})