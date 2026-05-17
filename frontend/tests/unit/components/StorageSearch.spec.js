import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StorageSearch from '@/components/StorageSearch.vue'

describe('StorageSearch', () => {
  it('рендерит поле ввода', () => {
    const wrapper = mount(StorageSearch)
    expect(wrapper.find('.search__input').exists()).toBe(true)
  })
})