import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisMemoryBar from '@/components/AnalysisMemoryBar.vue'

const mockDocuments = [
  { name: 'Work', size: '75 MB' },
  { name: 'Docs', size: '160 MB' }
]

describe('AnalysisMemoryBar', () => {
  it('рендерит сегменты памяти', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AnalysisMemoryBar, { props: { documents: mockDocuments } })
    vi.advanceTimersByTime(600)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.analysis-memory-bar__segment').length).toBe(2)
    vi.useRealTimers()
  })

  it('показывает тултип при наведении на сегмент', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AnalysisMemoryBar, { props: { documents: mockDocuments } })
    vi.advanceTimersByTime(600)
    await wrapper.vm.$nextTick()
    const segment = wrapper.find('.analysis-memory-bar__segment')
    await segment.trigger('mouseover')
    expect(wrapper.vm.hoveredSegment).toBe(0)
    vi.useRealTimers()
  })
})