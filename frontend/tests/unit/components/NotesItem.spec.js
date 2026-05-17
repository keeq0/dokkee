import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotesItem from '@/components/NotesItem.vue'

describe('NotesItem', () => {
  const props = {
    title: 'Test Note',
    content: 'Test content',
    files: ['file1.pdf', 'file2.docx'],
    modifiedDate: '2025-03-15',
    index: 0
  }

  it('рендерит заголовок и список файлов', () => {
    const wrapper = mount(NotesItem, { props })
    expect(wrapper.text()).toContain('Test Note')
    expect(wrapper.text()).toContain('file1.pdf, file2.docx')
  })

  it('при клике разворачивается', async () => {
    const wrapper = mount(NotesItem, { props })
    expect(wrapper.vm.isExpanded).toBe(false)
    await wrapper.trigger('click')
    expect(wrapper.vm.isExpanded).toBe(true)
    expect(wrapper.classes()).toContain('note--expanded')
  })

  it('форматирует дату', () => {
    const wrapper = mount(NotesItem, { props })
    expect(wrapper.find('.note__date').text()).toBe('15.03.2025')
  })
})