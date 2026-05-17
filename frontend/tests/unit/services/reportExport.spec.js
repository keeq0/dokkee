import { describe, it, expect, vi, beforeEach } from 'vitest'

const saveMock = vi.fn().mockResolvedValue(undefined)
const fromMock = vi.fn().mockReturnValue({ save: saveMock })
const setMock = vi.fn().mockReturnValue({ from: fromMock })
const html2pdfMock = vi.fn(() => ({ set: setMock }))

vi.mock('html2pdf.js', () => ({ default: html2pdfMock }))

import { downloadAnalysisReport, renderReportHtml } from '@/services/reportExport'

describe('renderReportHtml', () => {
  it('конвертирует markdown в html со стилями', () => {
    const html = renderReportHtml({
      title: 'T',
      markdown: '## Header\n- item 1\n- item 2',
      meta: 'meta'
    })
    expect(html).toContain('<style>')
    expect(html).toContain('class="report__title"')
    expect(html).toContain('<h2>Header</h2>')
    expect(html).toContain('<li>item 1</li>')
    expect(html).toContain('meta')
  })

  it('экранирует HTML в title и meta', () => {
    const html = renderReportHtml({
      title: '<bad>X</bad>',
      markdown: 'text',
      meta: '<scr>'
    })
    expect(html).toContain('&lt;bad&gt;X&lt;/bad&gt;')
    expect(html).toContain('&lt;scr&gt;')
  })

  it('не добавляет блок meta если он пустой', () => {
    const html = renderReportHtml({ title: 'T', markdown: 'x' })
    expect(html).not.toContain('class="report__meta"')
  })
})

describe('downloadAnalysisReport', () => {
  beforeEach(() => {
    html2pdfMock.mockClear()
    setMock.mockClear()
    fromMock.mockClear()
    saveMock.mockClear()
    document.body.innerHTML = ''
  })

  it('бросает ошибку при пустом markdown', async () => {
    await expect(downloadAnalysisReport({ markdown: '' })).rejects.toThrow(/empty/)
  })

  it('создаёт временный контейнер, вызывает html2pdf и удаляет контейнер', async () => {
    await downloadAnalysisReport({
      title: 'Test',
      markdown: '## Body',
      filename: 'my report',
      meta: '2026-01-01'
    })
    expect(html2pdfMock).toHaveBeenCalledOnce()
    expect(setMock).toHaveBeenCalledOnce()
    const config = setMock.mock.calls[0][0]
    expect(config.filename).toBe('my report.pdf')
    expect(config.jsPDF.format).toBe('a4')
    expect(saveMock).toHaveBeenCalledOnce()
    expect(document.body.children.length).toBe(0)
  })

  it('санитизирует имя файла', async () => {
    await downloadAnalysisReport({
      markdown: '## ok',
      filename: 'bad/name:with*chars?<>'
    })
    const config = setMock.mock.calls[0][0]
    expect(config.filename).toBe('bad_name_with_chars___.pdf')
  })

  it('удаляет контейнер даже если save упал', async () => {
    saveMock.mockRejectedValueOnce(new Error('boom'))
    await expect(
      downloadAnalysisReport({ markdown: '## ok', filename: 'x' })
    ).rejects.toThrow(/boom/)
    expect(document.body.children.length).toBe(0)
  })
})
