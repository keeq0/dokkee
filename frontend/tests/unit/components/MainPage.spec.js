import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import MainPage from '@/views/MainPage.vue'

vi.mock('@/components/AnalysisResult.vue', () => ({
  default: {
    name: 'AnalysisResult',
    template: '<div class="mock-analysis">Mock AnalysisResult</div>',
    props: ['expanded'],
    emits: ['analysis-complete', 'show-assistant'],
    methods: {
      updatePdfSize() {}
    }
  }
}))

vi.mock('@/components/UploadDocuments.vue', () => ({
  default: {
    name: 'UploadDocuments',
    template: '<div class="mock-upload" />',
    props: ['collapsed', 'processing'],
    emits: ['update-pdf', 'toggle-menu', 'processing-started']
  }
}))

function mountMain() {
  return mount(MainPage, {
    global: { plugins: [createTestingPinia({ stubActions: false })] }
  })
}

describe('MainPage', () => {
  it('рендерит заголовок и кнопку "Скрыть меню"', () => {
    const wrapper = mountMain()
    expect(wrapper.text()).toContain('Загрузка документов')
    expect(wrapper.find('.main-page__hide').text()).toBe('Скрыть меню')
  })

  it('по клику на "Скрыть меню" сворачивает UploadDocuments', async () => {
    const wrapper = mountMain()
    const container = wrapper.find('.upload-documents-container')
    expect(container.classes()).not.toContain('collapsed')
    await wrapper.find('.main-page__hide').trigger('click')
    expect(wrapper.find('.upload-documents-container').classes()).toContain('collapsed')
  })
})