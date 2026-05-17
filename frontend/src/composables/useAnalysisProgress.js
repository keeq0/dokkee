/**
 * Эмуляция прогресса анализа документа.
 *
 * Тик раз в 1 секунду: за tickStep процентов до целевого предела (по умолчанию
 * 99% — финал 100% выставляет код, когда DeepSeek вернёт ответ).
 */

const DEFAULT_TICK_MS = 1000
const DEFAULT_TICK_STEP = 1
const DEFAULT_CAP = 99

const STATUS_BUCKETS = Object.freeze([
  { min: 100, text: 'Готово' },
  { min: 90, text: 'Заканчиваю…' },
  { min: 70, text: 'Почти готово…' },
  { min: 50, text: 'Структурирую…' },
  { min: 30, text: 'Ищу детали…' },
  { min: 10, text: 'Читаю…' },
  { min: 0, text: 'Начинаю…' }
])

export function getProgressStatusText(progress) {
  for (const bucket of STATUS_BUCKETS) {
    if (progress >= bucket.min) return bucket.text
  }
  return ''
}

/**
 * Создаёт эмулятор прогресса с тиком раз в секунду.
 * @param {Object} opts
 * @param {(progress: number) => void} opts.onProgress
 * @param {number} [opts.tickMs] - интервал тика в мс
 * @param {number} [opts.tickStep] - прирост на каждом тике (в %)
 * @param {number} [opts.cap] - до какого процента эмулировать (финал ставится снаружи)
 */
export function createProgressEmulator({
  onProgress,
  tickMs = DEFAULT_TICK_MS,
  tickStep = DEFAULT_TICK_STEP,
  cap = DEFAULT_CAP
} = {}) {
  if (typeof onProgress !== 'function') {
    throw new Error('createProgressEmulator: onProgress callback is required')
  }

  let timer = null
  let current = 0
  let running = false

  function tick() {
    if (!running) return
    current = Math.min(cap, current + tickStep)
    onProgress(current)
    if (current < cap) {
      timer = setTimeout(tick, tickMs)
    } else {
      timer = null
    }
  }

  return {
    start() {
      if (running) return
      running = true
      current = 0
      onProgress(0)
      timer = setTimeout(tick, tickMs)
    },
    stop() {
      running = false
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
    isRunning() {
      return running
    }
  }
}
