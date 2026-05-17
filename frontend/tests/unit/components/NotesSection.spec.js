import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotesSection from '@/components/NotesSection.vue'

describe('NotesSection', () => {
  it('добавляет новую заметку при клике на +', async () => {
    const wrapper = mount(NotesSection)
    const initialLength = wrapper.vm.notes.length
    await wrapper.find('.header__button').trigger('click')
    expect(wrapper.vm.notes.length).toBe(initialLength + 1)
    expect(wrapper.vm.notes[0].title).toBe('Новая заметка')
  })
})