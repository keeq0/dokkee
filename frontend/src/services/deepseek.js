import axios from 'axios';

const API_URL = 'https://api.deepseek.com/chat/completions';

function getApiKey() {
  const key = process.env.VUE_APP_DEEPSEEK_KEY;
  if (!key) {
    throw new Error(
      'VUE_APP_DEEPSEEK_KEY is not set. Скопируйте .env.example в .env и проставьте ключ.'
    );
  }
  return key;
}

/**
 * Универсальный вызов DeepSeek Chat Completions.
 * @param {Object}   params
 * @param {Array}    params.messages       массив { role, content }
 * @param {string}   [params.model]        модель (по умолчанию deepseek-chat)
 * @param {number}   [params.temperature]
 * @param {number}   [params.maxTokens]
 * @param {number}   [params.topP]
 * @param {Object}   [params.extra]        прочие поля для тела запроса
 * @param {AbortSignal} [params.signal]    для отмены через AbortController
 * @returns {Promise<string>} текст ответа модели
 */
export async function chatCompletion({
  messages,
  model = 'deepseek-chat',
  temperature = 0.7,
  maxTokens = 2000,
  topP,
  extra = {},
  signal
} = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('chatCompletion: messages must be a non-empty array');
  }

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(topP !== undefined ? { top_p: topP } : {}),
    ...extra
  };

  const response = await axios.post(API_URL, body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`
    },
    signal
  });

  return response.data.choices[0].message.content;
}

export const DEEPSEEK_MODELS = Object.freeze({
  CHAT: 'deepseek-chat',
  REASONER: 'deepseek-reasoner'
});
