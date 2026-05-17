import { vi } from 'vitest'

// Мок для URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:fake-url')
global.URL.revokeObjectURL = vi.fn()

// Мок для html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({ toDataURL: () => 'data:image/png' }))
}))

// Мок для jspdf
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn()
  }))
}))

// Мок для axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios')
  return {
    default: {
      ...actual,
      post: vi.fn(() => Promise.resolve({
        data: {
          choices: [{ message: { content: 'Анализ документа: всё хорошо' } }]
        }
      }))
    }
  }
})

// Мок для картинок (чтобы require('@/assets/*.png') не падал)
vi.mock('@/assets/pdf.png', () => ({ default: 'pdf-mock.png' }))
vi.mock('@/assets/doc.png', () => ({ default: 'doc-mock.png' }))
vi.mock('@/assets/search_icon.png', () => ({ default: 'search-mock.png' }))
vi.mock('@/assets/filter_icon.png', () => ({ default: 'filter-mock.png' }))
vi.mock('@/assets/trash.svg', () => ({ default: 'trash-mock.svg' }))
// Добавьте другие картинки по мере необходимости (или один универсальный мок):
vi.mock('@/assets/*.png', () => ({ default: 'mock-image.png' }))
vi.mock('@/assets/*.svg', () => ({ default: 'mock-image.svg' }))


// Мок для IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    this.callback([{ isIntersecting: true, target: {} }])
  }
  unobserve() {}
  disconnect() {}
}