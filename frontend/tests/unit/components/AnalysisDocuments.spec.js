import { describe, it, expect} from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisDocuments from '@/components/AnalysisDocuments.vue'

const mockDocuments = [
  { name: 'Работа', color: 'green', size: '75 MB', folders: 6, files: 42, quality: '53%', contractors: 4, risks: 278 },
  { name: 'OZON Банк', color: 'blue', size: '160.5 MB', folders: 8, files: 35, quality: '67%', contractors: 3, risks: 145 }
]

describe('AnalysisDocuments', () => {
  it('рендерит список документов', () => {
    const wrapper = mount(AnalysisDocuments, { props: { documents: mockDocuments } })
    const items = wrapper.findAll('.document')
    expect(items.length).toBe(2)
    expect(wrapper.text()).toContain('Работа')
    expect(wrapper.text()).toContain('OZON Банк')
  })

  it('при клике на документ эмитит событие и обновляет selectedDocument', async () => {
    const wrapper = mount(AnalysisDocuments, { props: { documents: mockDocuments } })
    await wrapper.findAll('.document')[0].trigger('click')
    expect(wrapper.emitted('document-selected')).toBeTruthy()
    expect(wrapper.vm.selectedDocument.name).toBe('Работа')
  })

  it('выбранный документ имеет правильные данные', async () => {
    const wrapper = mount(AnalysisDocuments, { props: { documents: mockDocuments } })
    await wrapper.findAll('.document')[1].trigger('click')
    expect(wrapper.vm.selectedDocument.name).toBe('OZON Банк')
    expect(wrapper.vm.selectedDocument.folders).toBe(8)
    expect(wrapper.vm.selectedDocument.files).toBe(35)
  })
})