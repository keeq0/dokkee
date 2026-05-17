import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTextStreamer } from '@/composables/useStreamingText'

describe('createTextStreamer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('бросает ошибку без onUpdate', () => {
    expect(() => createTextStreamer({ content: 'abc' })).toThrow(/onUpdate/)
  })

  it('эмитит чанки заданного размера через интервал', () => {
    const onUpdate = vi.fn()
    const onDone = vi.fn()
    const streamer = createTextStreamer({
      content: 'abcdefghij',
      onUpdate,
      onDone,
      chunkSize: 2,
      delay: 10
    })
    streamer.start()
    expect(onUpdate).toHaveBeenLastCalledWith('')
    vi.advanceTimersByTime(10)
    expect(onUpdate).toHaveBeenLastCalledWith('ab')
    vi.advanceTimersByTime(10)
    expect(onUpdate).toHaveBeenLastCalledWith('abcd')
    vi.runAllTimers()
    expect(onUpdate).toHaveBeenLastCalledWith('abcdefghij')
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('stop({flush:true}) сразу выводит полный текст', () => {
    const onUpdate = vi.fn()
    const onDone = vi.fn()
    const streamer = createTextStreamer({
      content: 'abcdef',
      onUpdate,
      onDone,
      chunkSize: 1,
      delay: 100
    })
    streamer.start()
    vi.advanceTimersByTime(100)
    expect(onUpdate).toHaveBeenLastCalledWith('a')
    streamer.stop({ flush: true })
    expect(onUpdate).toHaveBeenLastCalledWith('abcdef')
    expect(onDone).toHaveBeenCalledOnce()
    expect(streamer.isRunning()).toBe(false)
  })

  it('stop без flush останавливает обновления', () => {
    const onUpdate = vi.fn()
    const streamer = createTextStreamer({
      content: 'abcdef',
      onUpdate,
      chunkSize: 1,
      delay: 100
    })
    streamer.start()
    vi.advanceTimersByTime(100)
    streamer.stop()
    vi.advanceTimersByTime(10000)
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('start с пустым content вызывает onDone сразу', () => {
    const onUpdate = vi.fn()
    const onDone = vi.fn()
    const streamer = createTextStreamer({ content: '', onUpdate, onDone })
    streamer.start()
    expect(onDone).toHaveBeenCalledOnce()
    expect(streamer.isRunning()).toBe(false)
  })

  it('повторный start без stop игнорируется', () => {
    const onUpdate = vi.fn()
    const streamer = createTextStreamer({
      content: 'abcdef',
      onUpdate,
      chunkSize: 1,
      delay: 100
    })
    streamer.start()
    streamer.start()
    vi.advanceTimersByTime(100)
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })
})
