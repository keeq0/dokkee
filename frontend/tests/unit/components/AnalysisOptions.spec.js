import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisOptions from '@/components/AnalysisOptions.vue'

describe('AnalysisOptions', () => {
  it('открывает фильтр периода при клике', async () => {
    const wrapper = mount(AnalysisOptions)
    await wrapper.find('.period-filter').trigger('click')
    expect(wrapper.vm.isPeriodOpen).toBe(true)
  })

  it('выбирает предустановленный период', async () => {
    const wrapper = mount(AnalysisOptions)
    await wrapper.find('.period-filter').trigger('click')
    const preset = wrapper.findAll('.period-preset')[0]
    await preset.trigger('click')
    expect(wrapper.vm.periodStart).toBeTruthy()
    expect(wrapper.emitted('period-changed')).toBeTruthy()
  })

  it('открывает фильтр типа файлов', async () => {
    const wrapper = mount(AnalysisOptions)
    await wrapper.findAll('.storage__filter')[1].trigger('click')
    expect(wrapper.vm.isFileTypeOpen).toBe(true)
  })

  it('выбирает тип файлов', async () => {
    const wrapper = mount(AnalysisOptions)
    await wrapper.findAll('.storage__filter')[1].trigger('click')
    const option = wrapper.findAll('.filter-option')[1]
    await option.trigger('click')
    expect(wrapper.emitted('file-type-changed')[0][0]).toBe('documents')
  })
})