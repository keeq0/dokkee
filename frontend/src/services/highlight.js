/**
 * Подсветка точного вхождения текста в произвольном DOM-узле, в т.ч. когда
 * вхождение пересекает границы дочерних тегов. Используется и для DOCX-превью
 * (docx-preview), и для PDF, отрендеренного в HTML.
 *
 * Текст нормализуется:
 * - NFC + удаление soft-hyphen и zero-width
 * - унификация тире (-, –, —, −) и кавычек (« » " " „ " ' ')
 * - схлопывание whitespace в одиночный пробел
 *
 * Если точный матч не найден - пробуем case-insensitive вариант. Это покрывает
 * подавляющее большинство расхождений между DeepSeek-цитатой и реальным
 * текстом из PDF/DOCX.
 */

const DEFAULT_TAG = 'mark'
const WS_RE = /\s+/g
// Soft hyphen, zero-width space/non-joiner/joiner, word-joiner, BOM.
/* eslint-disable no-irregular-whitespace, no-misleading-character-class */
const SOFT_HYPHEN_AND_ZW_RE = /[­​‌‍⁠﻿]/g
// Дефисы и тире: hyphen..horizontal bar, минус, hyphen bullet.
const DASH_RE = /[‐-―−⁃]/g
// Кавычки: ёлочки, "smart", "...", одинарные.
const QUOTE_RE = /[«»“-‟‘-‛]/g
/* eslint-enable no-irregular-whitespace, no-misleading-character-class */

function normalizeChar(ch) {
  if (DASH_RE.test(ch)) return '-'
  if (QUOTE_RE.test(ch)) return '"'
  if (SOFT_HYPHEN_AND_ZW_RE.test(ch)) return ''
  return ch
}

/**
 * Собирает текст из root в виде нормализованной строки и одновременно строит
 * массив "оригинальных" сегментов (TextNode + позиция в исходнике) и параллельно
 * "нормализованных" позиций — чтобы потом по найденному в нормализованной
 * строке индексу восстановить Range на исходном DOM.
 */
function collectNormalizedTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const items = []
  let normalizedText = ''
  let lastWasSpace = true
  let node = walker.nextNode()
  while (node) {
    const rawValue = node.nodeValue ?? ''
    const value = rawValue.normalize ? rawValue.normalize('NFC') : rawValue
    const map = new Array(value.length)
    for (let i = 0; i < value.length; i++) {
      const orig = value[i]
      const normCh = normalizeChar(orig)
      if (normCh === '') {
        map[i] = -1
        continue
      }
      if (/\s/.test(normCh)) {
        if (lastWasSpace) {
          map[i] = -1
        } else {
          map[i] = normalizedText.length
          normalizedText += ' '
          lastWasSpace = true
        }
      } else {
        map[i] = normalizedText.length
        normalizedText += normCh
        lastWasSpace = false
      }
    }
    items.push({ node, map, value })
    node = walker.nextNode()
  }
  return { text: normalizedText, items }
}

function applyDataset(el, dataset) {
  if (!dataset) return
  Object.entries(dataset).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    el.dataset[key] = String(value)
  })
}

function normalizeQuery(q) {
  let s = String(q)
  s = s.normalize ? s.normalize('NFC') : s
  let out = ''
  for (const ch of s) out += normalizeChar(ch)
  return out.replace(WS_RE, ' ').trim()
}

/**
 * Находит первое вхождение нормализованного query и восстанавливает Range
 * на исходных TextNode-ах. Если exact не найден - пробует case-insensitive.
 */
function buildRangeFromNormalized(items, normalizedText, needle) {
  let idx = normalizedText.indexOf(needle)
  if (idx < 0) {
    const lcText = normalizedText.toLowerCase()
    const lcNeedle = needle.toLowerCase()
    idx = lcText.indexOf(lcNeedle)
  }
  if (idx < 0) return null
  const endIdx = idx + needle.length

  function findOriginalPosition(targetNormalized, isEnd) {
    for (const entry of items) {
      for (let i = 0; i < entry.map.length; i++) {
        const mapped = entry.map[i]
        if (mapped < 0) continue
        if (!isEnd && mapped === targetNormalized) {
          return { node: entry.node, offset: i }
        }
        if (isEnd && mapped === targetNormalized - 1) {
          return { node: entry.node, offset: i + 1 }
        }
      }
    }
    return null
  }

  const start = findOriginalPosition(idx, false)
  const end = findOriginalPosition(endIdx, true)
  if (!start || !end) return null

  const range = document.createRange()
  try {
    range.setStart(start.node, start.offset)
    range.setEnd(end.node, end.offset)
  } catch (error) {
    return null
  }
  return range
}

/**
 * mode='wrap': оборачивает в `<tag>` через surroundContents или
 * extractContents+insertNode. Подходит для DOCX (mammoth-HTML).
 *
 * mode='overlay': создаёт абсолютно позиционированные элементы поверх
 * каждого client-rect. Подходит для PDF text-layer.
 *
 * @param {Element} root
 * @param {string}  query
 * @param {Object}  opts
 * @returns {Element|Element[]|null}
 */
export function highlightTextInRoot(root, query, opts = {}) {
  if (!root || !query) return null
  const {
    className = '',
    dataset = null,
    onClick,
    tag = DEFAULT_TAG,
    mode = 'wrap'
  } = opts
  const needle = normalizeQuery(query)
  if (needle.length < 1) return null

  const { text, items } = collectNormalizedTextNodes(root)
  const range = buildRangeFromNormalized(items, text, needle)
  if (!range) return null

  if (mode === 'overlay') {
    return createOverlayHighlights(root, range, { className, dataset, onClick })
  }

  const wrapper = document.createElement(tag)
  if (className) wrapper.className = className
  applyDataset(wrapper, dataset)
  if (typeof onClick === 'function') {
    wrapper.addEventListener('click', onClick)
  }

  try {
    if (range.startContainer === range.endContainer) {
      range.surroundContents(wrapper)
    } else {
      wrapper.appendChild(range.extractContents())
      range.insertNode(wrapper)
    }
  } catch (error) {
    return null
  }
  return wrapper
}

function createOverlayHighlights(root, range, { className, dataset, onClick }) {
  const rectList = typeof range.getClientRects === 'function' ? range.getClientRects() : []
  if (!rectList || rectList.length === 0) return null
  const rootRect = root.getBoundingClientRect()
  const scrollX = root.scrollLeft || 0
  const scrollY = root.scrollTop || 0
  const overlays = []
  for (const rect of Array.from(rectList)) {
    if (!rect.width || !rect.height) continue
    const overlay = document.createElement('span')
    if (className) overlay.className = className
    applyDataset(overlay, dataset)
    overlay.style.position = 'absolute'
    overlay.style.left = `${rect.left - rootRect.left + scrollX}px`
    overlay.style.top = `${rect.top - rootRect.top + scrollY}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
    overlay.style.pointerEvents = 'auto'
    if (typeof onClick === 'function') {
      overlay.addEventListener('click', onClick)
    }
    root.appendChild(overlay)
    overlays.push(overlay)
  }
  return overlays.length > 0 ? overlays : null
}

/**
 * Разворачивает все элементы по селектору внутри root.
 */
export function clearHighlights(root, selector) {
  if (!root || !selector) return
  root.querySelectorAll(selector).forEach((el) => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    if (typeof parent.normalize === 'function') parent.normalize()
  })
}
