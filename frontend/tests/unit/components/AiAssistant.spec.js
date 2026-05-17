import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useDocumentsStore, createDocumentRecord } from '@/stores/documents'

vi.mock('@/services/reportExport', () => ({
  downloadAnalysisReport: vi.fn().mockResolvedValue(undefined)
}))

import AiAssistant from '@/components/AiAssistant.vue'
import { downloadAnalysisReport } from '@/services/reportExport'

function mountAssistant(props = {}, setup) {
  const pinia = createTestingPinia({ stubActions: false })
  const wrapper = mount(AiAssistant, {
    props: { visible: true, ...props },
    global: { plugins: [pinia] }
  })
  const store = useDocumentsStore()
  if (setup) setup(store)
  return { wrapper, store }
}

describe('AiAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  

  it('отображает заголовок и кнопку "Скрыть"', () => {
    const { wrapper } = mountAssistant()
    expect(wrapper.text()).toContain('ИИ-помощник')
    expect(wrapper.find('.assistant__close').exists()).toBe(true)
  })

  it('при клике на "Скрыть" эмитит close и скрывается', async () => {
    const { wrapper } = mountAssistant()
    await wrapper.find('.assistant__close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.vm.internalVisible).toBe(false)
  })

  it('chatMessages берётся из store.selected.chatHistory', () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      rec.chatHistory = [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' }
      ]
      s.add(rec)
      s.select(rec.id)
    })
    expect(wrapper.vm.chatMessages).toHaveLength(2)
    expect(wrapper.vm.chatMessages[0].content).toBe('hi')
  })

  it('pinned-risk badge показывается, если в сторе есть pinnedRisk', async () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      rec.pinnedRisk = {
        level: 'Большие риски',
        name: 'Штраф',
        quote: '1 000 000 руб',
        comment: 'высокая сумма'
      }
      s.add(rec)
      s.select(rec.id)
    })
    wrapper.vm.allMessagesComplete = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.chat-pinned-risk').exists()).toBe(true)
    expect(wrapper.text()).toContain('Штраф')
    expect(wrapper.text()).toContain('1 000 000')
  })

  it('clearPinnedRisk сбрасывает pinnedRisk в сторе', async () => {
    const { wrapper, store } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      rec.pinnedRisk = { level: 'Сомнительно', name: 'X', quote: 'y', comment: 'z' }
      s.add(rec)
      s.select(rec.id)
    })
    wrapper.vm.allMessagesComplete = true
    await wrapper.vm.$nextTick()
    await wrapper.find('.chat-pinned-risk__close').trigger('click')
    expect(store.selected.pinnedRisk).toBeNull()
  })

  it('buildPinnedPreamble включает блок с риском', () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      s.add(rec)
      s.select(rec.id)
    })
    const prompt = wrapper.vm.buildPinnedPreamble({
      level: 'Большие риски',
      name: 'Штраф 1М',
      quote: 'фиксированная сумма',
      comment: 'кабальные условия',
      section: 'п. 4.2'
    })
    expect(prompt).toContain('Штраф 1М')
    expect(prompt).toContain('фиксированная сумма')
    expect(prompt).toContain('Большие риски')
    expect(prompt).toContain('п. 4.2')
  })

  it('buildPinnedPreamble возвращает null без риска', () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      s.add(rec)
      s.select(rec.id)
    })
    expect(wrapper.vm.buildPinnedPreamble(null)).toBeNull()
  })

  it('пользовательское сообщение с pinnedRisk показывает риск над текстом', async () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      rec.chatHistory = [
        {
          role: 'user',
          content: 'Расскажи подробнее',
          pinnedRisk: {
            level: 'Сомнительно',
            name: 'Скрытая комиссия',
            quote: 'комиссия 5%',
            comment: 'неочевидно'
          }
        }
      ]
      s.add(rec)
      s.select(rec.id)
    })
    wrapper.vm.allMessagesComplete = true
    await wrapper.vm.$nextTick()
    const pinnedInChat = wrapper.find('.chat-pinned-risk--inline')
    expect(pinnedInChat.exists()).toBe(true)
    expect(pinnedInChat.text()).toContain('Скрытая комиссия')
    expect(pinnedInChat.text()).toContain('комиссия 5%')
  })

    it.skip('после получения analysisResult отображает второе сообщение', async () => {
    const wrapper = mount(AiAssistant, { 
        props: { visible: true, analysisResult: 'Анализ успешен' } 
    })
    // Даём время на инициализацию
    await new Promise(resolve => setTimeout(resolve, 100))
    // Запускаем второй этап принудительно (если не запустился)
    if (!wrapper.vm.showSecondLoading && !wrapper.vm.typedSecondHeader) {
        wrapper.vm.startSecondSequence()
        await wrapper.vm.$nextTick()
    }
    expect(wrapper.text()).toContain('Анализ ваших документов')
    })

  it('кнопки "Скачать отчёт" и "Скачать готовый документ" появляются только после allMessagesComplete', async () => {
    const { wrapper } = mountAssistant()
    expect(wrapper.find('.footer__button.report').classes()).not.toContain('visible')
    wrapper.vm.allMessagesComplete = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.footer__button.report').classes()).toContain('visible')
  })

  it('метод downloadReport вызывает сервис reportExport с отчётом из стора', async () => {
    const { wrapper } = mountAssistant({}, (s) => {
      const rec = createDocumentRecord({ name: 'contract.pdf', type: 'pdf' })
      s.add(rec)
      s.select(rec.id)
      s.setAnalysisResult(rec.id, '## Отчёт\n\nТекст')
    })
    downloadAnalysisReport.mockClear()
    await wrapper.vm.downloadReport()
    expect(downloadAnalysisReport).toHaveBeenCalledOnce()
    const args = downloadAnalysisReport.mock.calls[0][0]
    expect(args.markdown).toContain('Отчёт')
    expect(args.title).toContain('contract.pdf')
    expect(args.filename).toContain('report-contract')
  })
})