import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { chatCompletion, DEEPSEEK_MODELS } from '@/services/deepseek'

vi.mock('axios')

describe('services/deepseek', () => {
  const originalKey = process.env.VUE_APP_DEEPSEEK_KEY

  beforeEach(() => {
    process.env.VUE_APP_DEEPSEEK_KEY = 'sk-test-key'
    axios.post.mockReset()
  })

  afterEach(() => {
    process.env.VUE_APP_DEEPSEEK_KEY = originalKey
  })

  it('бросает понятную ошибку, если ключ не задан', async () => {
    delete process.env.VUE_APP_DEEPSEEK_KEY
    await expect(
      chatCompletion({ messages: [{ role: 'user', content: 'hi' }] })
    ).rejects.toThrow(/VUE_APP_DEEPSEEK_KEY/)
  })

  it('бросает ошибку при пустых messages', async () => {
    await expect(chatCompletion({ messages: [] })).rejects.toThrow(/non-empty array/)
    await expect(chatCompletion({})).rejects.toThrow(/non-empty array/)
  })

  it('передаёт Authorization header с ключом из env', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] }
    })

    await chatCompletion({ messages: [{ role: 'user', content: 'hi' }] })

    const [, , config] = axios.post.mock.calls[0]
    expect(config.headers.Authorization).toBe('Bearer sk-test-key')
  })

  it('возвращает content из первого choice', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'привет' } }] }
    })

    const result = await chatCompletion({ messages: [{ role: 'user', content: 'hi' }] })
    expect(result).toBe('привет')
  })

  it('использует модель по умолчанию deepseek-chat', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] }
    })

    await chatCompletion({ messages: [{ role: 'user', content: 'hi' }] })

    const [, body] = axios.post.mock.calls[0]
    expect(body.model).toBe('deepseek-chat')
  })

  it('принимает кастомную модель и top_p', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] }
    })

    await chatCompletion({
      messages: [{ role: 'user', content: 'hi' }],
      model: DEEPSEEK_MODELS.REASONER,
      topP: 0.7,
      extra: { max_cot_tokens: 1000 }
    })

    const [, body] = axios.post.mock.calls[0]
    expect(body.model).toBe('deepseek-reasoner')
    expect(body.top_p).toBe(0.7)
    expect(body.max_cot_tokens).toBe(1000)
  })

  it('пробрасывает AbortSignal в axios', async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: 'ok' } }] }
    })
    const controller = new AbortController()

    await chatCompletion({
      messages: [{ role: 'user', content: 'hi' }],
      signal: controller.signal
    })

    const [, , config] = axios.post.mock.calls[0]
    expect(config.signal).toBe(controller.signal)
  })
})
