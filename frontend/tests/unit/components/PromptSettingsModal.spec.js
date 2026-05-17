import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PromptSettingsModal from '@/components/PromptSettingsModal.vue'

function createLocalStorageMock() {
  const data = new Map()
  return {
    getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key, value) => data.set(key, String(value))),
    removeItem: vi.fn((key) => data.delete(key)),
    clear: vi.fn(() => data.clear())
  }
}

describe('PromptSettingsModal', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  it('не рендерит панель при visible=false', () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: false } })
    expect(wrapper.find('.prompt-modal').exists()).toBe(false)
  })

  it('рендерит панель с пятью чекбоксами при visible=true', () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    expect(wrapper.find('.prompt-modal').exists()).toBe(true)
    expect(wrapper.findAll('.prompt-modal__checkbox')).toHaveLength(5)
  })

  it('содержит ожидаемые лейблы из issue', () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    const text = wrapper.text()
    expect(text).toContain('GDPR/152-ФЗ')
    expect(text).toContain('налоговые риски')
    expect(text).toContain('коррупционные')
    expect(text).toContain('трудовые договоры')
    expect(text).toContain('контрагент')
  })

  it('по умолчанию все чекбоксы выключены', () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    wrapper.findAll('.prompt-modal__checkbox').forEach((cb) => {
      expect(cb.element.checked).toBe(false)
    })
  })

  it('по клику на чекбокс значение переключается; счётчик в кнопке растёт', async () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    const first = wrapper.findAll('.prompt-modal__checkbox')[0]
    await first.setValue(true)
    expect(wrapper.find('.prompt-modal__btn--primary').text()).toMatch(/\(1\)/)
    await first.setValue(false)
    expect(wrapper.find('.prompt-modal__btn--primary').text()).not.toMatch(/\(\d+\)/)
  })

  it('confirm эмитит выбранные ключи и сохраняет в localStorage', async () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    const checkboxes = wrapper.findAll('.prompt-modal__checkbox')
    await checkboxes[0].setValue(true) // gdpr
    await checkboxes[2].setValue(true) // corruption
    await wrapper.find('.prompt-modal__btn--primary').trigger('click')
    const emitted = wrapper.emitted('confirm')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual(['gdpr', 'corruption'])
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'dokkee:prompt-options',
      expect.stringContaining('gdpr')
    )
  })

  it('cancel эмитит соответствующее событие и не сохраняет', async () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    await wrapper.findAll('.prompt-modal__checkbox')[0].setValue(true)
    await wrapper.findAll('.prompt-modal__btn')[0].trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('инициализируется из localStorage', () => {
    localStorage.setItem('dokkee:prompt-options', JSON.stringify({ gdpr: true, tax: true }))
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    expect(wrapper.find('.prompt-modal__btn--primary').text()).toMatch(/\(2\)/)
  })

  it('клик по backdrop эмитит cancel', async () => {
    const wrapper = mount(PromptSettingsModal, { props: { visible: true } })
    await wrapper.find('.prompt-modal').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
