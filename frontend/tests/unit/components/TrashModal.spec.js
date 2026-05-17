import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TrashModal from '@/components/TrashModal.vue'

describe('TrashModal', () => {
  it('отображается при show=true', () => {
    const wrapper = mount(TrashModal, { props: { show: true } })
    expect(wrapper.find('.trash-modal').exists()).toBe(true)
  })

  it('скрыт при show=false', () => {
    const wrapper = mount(TrashModal, { props: { show: false } })
    expect(wrapper.find('.trash-modal').exists()).toBe(false)
  })

  it('кнопка закрытия эмитит close', async () => {
    const wrapper = mount(TrashModal, { props: { show: true } })
    await wrapper.find('.trash__exit').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})