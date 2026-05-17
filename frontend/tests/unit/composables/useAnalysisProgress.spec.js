import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createProgressEmulator,
  getProgressStatusText
} from '@/composables/useAnalysisProgress'

describe('getProgressStatusText', () => {
  it.each([
    [0, 'Начинаю…'],
    [5, 'Начинаю…'],
    [10, 'Читаю…'],
    [29, 'Читаю…'],
    [30, 'Ищу детали…'],
    [49, 'Ищу детали…'],
    [50, 'Структурирую…'],
    [69, 'Структурирую…'],
    [70, 'Почти готово…'],
    [89, 'Почти готово…'],
    [90, 'Заканчиваю…'],
    [99, 'Заканчиваю…'],
    [100, 'Готово']
  ])('progress=%s -> "%s"', (progress, expected) => {
    expect(getProgressStatusText(progress)).toBe(expected)
  })
})

describe('createProgressEmulator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('бросает ошибку, если onProgress не передан', () => {
    expect(() => createProgressEmulator()).toThrow(/onProgress/)
  })

  it('тикает раз в секунду, увеличивая прогресс на tickStep', () => {
    const onProgress = vi.fn()
    const emulator = createProgressEmulator({ onProgress, tickMs: 1000, tickStep: 2, cap: 10 })
    emulator.start()
    // Первый вызов — onProgress(0) при start
    expect(onProgress).toHaveBeenLastCalledWith(0)
    vi.advanceTimersByTime(1000)
    expect(onProgress).toHaveBeenLastCalledWith(2)
    vi.advanceTimersByTime(1000)
    expect(onProgress).toHaveBeenLastCalledWith(4)
    vi.advanceTimersByTime(1000)
    expect(onProgress).toHaveBeenLastCalledWith(6)
  })

  it('останавливается на cap и не превышает его', () => {
    const onProgress = vi.fn()
    const emulator = createProgressEmulator({ onProgress, tickMs: 100, tickStep: 5, cap: 10 })
    emulator.start()
    vi.advanceTimersByTime(1000)
    const calls = onProgress.mock.calls.map((c) => c[0])
    expect(Math.max(...calls)).toBe(10)
    // Дальнейшие тики не выходят за cap.
    vi.advanceTimersByTime(1000)
    const callsAfter = onProgress.mock.calls.map((c) => c[0])
    expect(Math.max(...callsAfter)).toBe(10)
  })

  it('stop прекращает дальнейшие тики', () => {
    const onProgress = vi.fn()
    const emulator = createProgressEmulator({ onProgress, tickMs: 100, tickStep: 5 })
    emulator.start()
    vi.advanceTimersByTime(100)
    emulator.stop()
    const callsBefore = onProgress.mock.calls.length
    vi.advanceTimersByTime(1000)
    expect(onProgress.mock.calls.length).toBe(callsBefore)
    expect(emulator.isRunning()).toBe(false)
  })

  it('повторный start без stop игнорируется', () => {
    const onProgress = vi.fn()
    const emulator = createProgressEmulator({ onProgress, tickMs: 100, tickStep: 5 })
    emulator.start()
    emulator.start()
    vi.advanceTimersByTime(100)
    // На старте onProgress(0) и через 100ms - onProgress(5). Итого 2 вызова, не больше.
    expect(onProgress.mock.calls.length).toBe(2)
  })

  it('значения по умолчанию: tickMs=1000, tickStep=1, cap=99', () => {
    const onProgress = vi.fn()
    const emulator = createProgressEmulator({ onProgress })
    emulator.start()
    expect(onProgress).toHaveBeenLastCalledWith(0)
    vi.advanceTimersByTime(1000)
    expect(onProgress).toHaveBeenLastCalledWith(1)
  })
})
