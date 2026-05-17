import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, breaks: true, linkify: true, typographer: true })
md.enable(['table'])

const REPORT_STYLES = `
  body, .report { font-family: 'PT Sans', Arial, sans-serif; color: #1f1f1f; line-height: 1.5; }
  .report__title { font-size: 24px; font-weight: 700; margin: 0 0 6px; color: #2c3e50; border-bottom: 2px solid #6C67FD; padding-bottom: 8px; }
  .report__meta { font-size: 11px; color: #666; margin-bottom: 18px; }
  .report__body { font-size: 12px; }
  .report__body h1 { font-size: 20px; margin: 20px 0 6px; }
  .report__body h2 { font-size: 16px; margin: 16px 0 6px; border-bottom: 1px solid #d9d9d9; padding-bottom: 4px; }
  .report__body h3 { font-size: 14px; margin: 12px 0 4px; }
  .report__body h4 { font-size: 13px; margin: 10px 0 4px; }
  .report__body p { margin: 0.5em 0; }
  .report__body ul, .report__body ol { margin: 0.5em 0 0.5em 1.4em; }
  .report__body li { margin: 0.25em 0; }
  .report__body table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
  .report__body th, .report__body td { border: 1px solid #c8c8c8; padding: 6px 10px; vertical-align: top; }
  .report__body th { background: #f2f2f2; font-weight: 600; }
  .report__body blockquote { border-left: 3px solid #6C67FD; padding: 4px 10px; color: #444; background: #f7f7f7; margin: 0.6em 0; }
  .report__body code { background: #f1f1f1; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
`

export function renderReportHtml({ title = 'Отчёт анализа документа', markdown = '', meta = '' } = {}) {
  const body = md.render(String(markdown || ''))
  return `<div class="report">
    <style>${REPORT_STYLES}</style>
    <h1 class="report__title">${escapeHtml(title)}</h1>
    ${meta ? `<div class="report__meta">${escapeHtml(meta)}</div>` : ''}
    <div class="report__body">${body}</div>
  </div>`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilename(name = 'report') {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120) || 'report'
}

export async function downloadAnalysisReport({
  title = 'Отчёт анализа документа',
  markdown = '',
  filename = 'report',
  meta = ''
} = {}) {
  if (!markdown) {
    throw new Error('downloadAnalysisReport: markdown is empty')
  }

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;'
  container.innerHTML = renderReportHtml({ title, markdown, meta })
  document.body.appendChild(container)

  try {
    const { default: html2pdf } = await import('html2pdf.js')
    await html2pdf()
      .set({
        margin: [12, 12, 14, 12],
        filename: `${sanitizeFilename(filename)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(container.firstElementChild)
      .save()
  } finally {
    container.remove()
  }
}
