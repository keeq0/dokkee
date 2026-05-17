import { describe, it, expect, vi } from 'vitest'
import { highlightTextInRoot, clearHighlights } from '@/services/highlight'

function makeRoot(html) {
  const root = document.createElement('div')
  root.innerHTML = html
  return root
}

describe('highlightTextInRoot', () => {
  it('подсвечивает фрагмент в одном TextNode (DOCX-like)', () => {
    const root = makeRoot('<p>Текст контракта с подсветкой</p>')
    const result = highlightTextInRoot(root, 'контракта', {
      className: 'risk-highlight risk-highlight--warn',
      dataset: { riskId: '3' }
    })
    expect(result).not.toBeNull()
    expect(root.querySelector('mark.risk-highlight--warn')?.textContent).toBe('контракта')
    expect(root.querySelector('mark')?.dataset.riskId).toBe('3')
  })

  it('подсвечивает фрагмент, пересекающий границы тегов', () => {
    const root = makeRoot('<p>Срок <strong>поставки</strong> 30 дней</p>')
    const mark = highlightTextInRoot(root, 'Срок поставки 30', {
      className: 'risk-highlight'
    })
    expect(mark).not.toBeNull()
    expect(mark.textContent).toBe('Срок поставки 30')
    expect(mark.querySelector('strong')?.textContent).toBe('поставки')
  })

  it('возвращает null если фрагмент не найден', () => {
    const root = makeRoot('<p>Один текст</p>')
    expect(highlightTextInRoot(root, 'отсутствует')).toBeNull()
  })

  it('возвращает null для пустого запроса или root', () => {
    const root = makeRoot('<p>x</p>')
    expect(highlightTextInRoot(null, 'x')).toBeNull()
    expect(highlightTextInRoot(root, '')).toBeNull()
  })

  it('навешивает onClick на созданный mark', () => {
    const root = makeRoot('<p>текст</p>')
    const onClick = vi.fn()
    const mark = highlightTextInRoot(root, 'текст', { className: 'h', onClick })
    mark.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('поддерживает кастомный tag', () => {
    const root = makeRoot('<p>текст</p>')
    const result = highlightTextInRoot(root, 'текст', { tag: 'span', className: 'h' })
    expect(result.tagName).toBe('SPAN')
  })

  it('подсвечивает фрагмент через несколько уровней вложенности (PDF text-layer like)', () => {
    const root = document.createElement('div')
    root.className = 'text-layer'
    ;['Сторона', 'обязана', 'уплатить', '1000', 'рублей'].forEach((part) => {
      const span = document.createElement('span')
      span.textContent = part
      root.appendChild(span)
    })
    const mark = highlightTextInRoot(root, 'обязанауплатить', { className: 'h' })
    expect(mark).not.toBeNull()
    expect(mark.textContent).toBe('обязанауплатить')
    expect(mark.querySelectorAll('span').length).toBeGreaterThan(0)
  })
})

describe('clearHighlights', () => {
  it('разворачивает все mark.risk-highlight и оставляет текст', () => {
    const root = makeRoot('<p>текст <mark class="risk-highlight">подсветка</mark> ещё</p>')
    clearHighlights(root, 'mark.risk-highlight')
    expect(root.querySelectorAll('mark').length).toBe(0)
    expect(root.textContent).toBe('текст подсветка ещё')
  })

  it('не падает на пустом root', () => {
    expect(() => clearHighlights(null, 'mark')).not.toThrow()
  })
})
