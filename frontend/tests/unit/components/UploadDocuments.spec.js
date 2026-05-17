// Мокаем картинки до импорта компонента
vi.mock('@/assets/pdf.png', () => ({ default: 'mock-pdf.png' }))
vi.mock('@/assets/doc.png', () => ({ default: 'mock-doc.png' }))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useDocumentsStore } from '@/stores/documents'
import UploadDocuments from '@/components/UploadDocuments.vue'

function mountUpload() {
  const pinia = createTestingPinia({ stubActions: false })
  const wrapper = mount(UploadDocuments, { global: { plugins: [pinia] } })
  return { wrapper, store: useDocumentsStore() }
}

describe('UploadDocuments', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn()
    })
  })

  it('рендерит описание и кнопку "Мои документы"', () => {
    const { wrapper } = mountUpload()
    expect(wrapper.text()).toContain('Убедитесь, что ваши документы')
    expect(wrapper.find('.upload-documents__button').text()).toBe('Мои документы')
  })

  it('при клике на "Мои документы" открывает список файлов', async () => {
    const { wrapper } = mountUpload()
    await wrapper.find('.upload-documents__button').trigger('click')
    expect(wrapper.vm.showFileList).toBe(true)
    expect(wrapper.find('.file-list').exists()).toBe(true)
  })

  it('добавляет PDF через onFilesAdded и сохраняет в стор', () => {
    const { wrapper, store } = mountUpload()
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' })
    wrapper.vm.onFilesAdded([file])
    expect(store.items).toHaveLength(1)
    expect(store.items[0].name).toBe('test.pdf')
    expect(store.items[0].type).toBe('pdf')
  })

  it('добавляет DOCX через onFilesAdded', () => {
    const { wrapper, store } = mountUpload()
    const file = new File(['dummy'], 'spec.docx', { type: 'application/vnd.openxmlformats' })
    wrapper.vm.onFilesAdded([file])
    expect(store.items).toHaveLength(1)
    expect(store.items[0].type).toBe('docx')
  })

  it('отклоняет .doc и показывает warning', () => {
    const { wrapper, store } = mountUpload()
    const file = new File(['dummy'], 'legacy.doc', { type: 'application/msword' })
    wrapper.vm.onFilesAdded([file])
    expect(store.items).toEqual([])
    expect(wrapper.vm.rejectedFormatWarning).toContain('.doc')
  })

  it('эмитит "processing-started" при старте обработки', async () => {
    const { wrapper } = mountUpload()
    wrapper.vm.agreed = true
    wrapper.vm.onFilesAdded([new File(['dummy'], 'doc.pdf', { type: 'application/pdf' })])
    await wrapper.vm.startProcessing()
    expect(wrapper.emitted('processing-started')).toBeTruthy()
  })

  it('availableFiles считает только idle-документы', () => {
    const { wrapper, store } = mountUpload()
    wrapper.vm.onFilesAdded([new File(['a'], 'a.pdf')])
    wrapper.vm.onFilesAdded([new File(['b'], 'b.pdf')])
    expect(wrapper.vm.availableFiles).toBe(2)
    store.setStatus(store.items[0].id, 'done')
    expect(wrapper.vm.availableFiles).toBe(1)
  })
})
