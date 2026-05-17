import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StorageFilter from '@/components/StorageFilter.vue'

describe('StorageFilter', () => {
  it('открывает выпадающий список по клику', async () => {
    const wrapper = mount(StorageFilter)
    expect(wrapper.vm.isOpen).toBe(false)
    await wrapper.find('.storage__filter').trigger('click')
    expect(wrapper.vm.isOpen).toBe(true)
  })

  it('выбирает опцию и эмитит событие sort-changed', async () => {
    const wrapper = mount(StorageFilter)
    await wrapper.find('.storage__filter').trigger('click')
    const options = wrapper.findAll('.filter-option')
    await options[2].trigger('click')
    expect(wrapper.emitted('sort-changed')[0][0]).toBe('date-new')
    expect(wrapper.vm.isOpen).toBe(false)
  })
})