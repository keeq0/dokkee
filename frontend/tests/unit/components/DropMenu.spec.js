import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DropMenu from '@/components/DropMenu.vue'

describe('DropMenu', () => {
  it('рендерит зону загрузки', () => {
    const wrapper = mount(DropMenu)
    expect(wrapper.text()).toContain('Загрузите файл(-ы) сюда')
    expect(wrapper.find('.drop-menu__icon').exists()).toBe(true)
  })

  it('при клике на зону вызывает выбор файла через input', async () => {
    const wrapper = mount(DropMenu)
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput.element, 'click')
    await wrapper.find('.drop-menu__zone').trigger('click')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('эмитит files-added при выборе файлов через input', async () => {
    const wrapper = mount(DropMenu)
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    expect(wrapper.emitted('files-added')[0][0]).toEqual([file])
  })

  it('эмитит files-added при перетаскивании файлов', async () => {
    const wrapper = mount(DropMenu)
    const dataTransfer = {
      files: [new File(['text'], 'test.docx', { type: 'application/docx' })]
    }
    await wrapper.find('.drop-menu__zone').trigger('drop', { dataTransfer })
    expect(wrapper.emitted('files-added')[0][0]).toEqual(dataTransfer.files)
    // проверяем, что isDragging сбросился
    expect(wrapper.vm.isDragging).toBe(false)
  })

  it('меняет класс при drag-over', async () => {
    const wrapper = mount(DropMenu)
    const zone = wrapper.find('.drop-menu__zone')
    await zone.trigger('dragover')
    expect(zone.classes()).toContain('drop-menu__zone--dragover')
    await zone.trigger('dragleave')
    expect(zone.classes()).not.toContain('drop-menu__zone--dragover')
  })
})