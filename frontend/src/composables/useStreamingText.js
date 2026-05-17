/**
 * Эмуляция стриминга текста: посимвольный вывод заранее полученной строки.
 *
 * Реального SSE/streaming от DeepSeek в этом проекте нет — после получения
 * ответа целиком мы дописываем его в видимое сообщение чанками с задержкой,
 * чтобы интерфейс выглядел как «модель печатает».
 *
 * Используется планирование на основе performance.now() + Worker-таймер для
 * стабильной работы во фоновой вкладке: setTimeout throttled до 1000ms когда
 * вкладка неактивна, поэтому используем Worker (он не throttled).
 */

const DEFAULT_CHUNK_SIZE = 3
const DEFAULT_DELAY_MS = 18

/**
 * Создаёт Worker, который раз в delay ms отправляет 'tick' в main thread.
 * Worker не подвержен фоновому throttling-у браузера.
 */
function createTickWorker(delay) {
  const code = `
    let timer = null
    self.onmessage = (e) => {
      const data = e.data
      if (data && data.type === 'start') {
        const period = data.delay
        if (timer) clearInterval(timer)
        timer = setInterval(() => self.postMessage('tick'), period)
      } else if (data === 'stop' || (data && data.type === 'stop')) {
        if (timer) { clearInterval(timer); timer = null }
      }
    }
  `
  const blob = new Blob([code], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)
  // освобождаем URL после старта worker'а
  worker._workerUrl = url
  worker.postMessage({ type: 'start', delay })
  return worker
}

function disposeWorker(worker) {
  if (!worker) return
  try {
    worker.postMessage('stop')
    worker.terminate()
  } catch (e) {
    // noop
  }
  if (worker._workerUrl) {
    URL.revokeObjectURL(worker._workerUrl)
  }
}

/**
 * Используем Worker в реальном браузере (где setTimeout throttled в фоне),
 * setTimeout - в jsdom-тестах (Worker есть, но коды внутри не исполняются).
 */
function shouldUseWorker() {
  if (typeof Worker === 'undefined') return false
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') return false
  if (typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return false
  return true
}

export function createTextStreamer({
  content = '',
  onUpdate,
  onDone,
  chunkSize = DEFAULT_CHUNK_SIZE,
  delay = DEFAULT_DELAY_MS
} = {}) {
  if (typeof onUpdate !== 'function') {
    throw new Error('createTextStreamer: onUpdate callback is required')
  }
  const total = String(content)
  let index = 0
  let worker = null
  let timer = null
  let running = false

  function tick() {
    if (!running) return
    const next = Math.min(index + chunkSize, total.length)
    onUpdate(total.slice(0, next))
    index = next
    if (index >= total.length) {
      running = false
      disposeWorker(worker)
      worker = null
      if (timer) { clearTimeout(timer); timer = null }
      if (typeof onDone === 'function') onDone()
    }
  }

  function scheduleNextViaTimer() {
    if (!running) return
    timer = setTimeout(() => {
      if (!running) return
      tick()
      if (running) scheduleNextViaTimer()
    }, delay)
  }

  return {
    start() {
      if (running || total.length === 0) {
        if (total.length === 0 && typeof onDone === 'function') onDone()
        return
      }
      running = true
      index = 0
      onUpdate('')
      if (shouldUseWorker()) {
        try {
          worker = createTickWorker(delay)
          worker.onmessage = () => tick()
          return
        } catch (e) {
          worker = null
        }
      }
      scheduleNextViaTimer()
    },
    stop({ flush = false } = {}) {
      running = false
      disposeWorker(worker)
      worker = null
      if (timer) { clearTimeout(timer); timer = null }
      if (flush) {
        onUpdate(total)
        if (typeof onDone === 'function') onDone()
      }
    },
    isRunning() {
      return running
    }
  }
}
