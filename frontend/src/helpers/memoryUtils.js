export function getFileSizeInMB(doc) {
  if (!doc?.size) return 0
  const sizeStr = String(doc.size).replace(',', '.')
  const size = parseFloat(sizeStr) || 0
  const unit = String(doc.size).replace(/[^а-яА-Яa-zA-Z]/g, '').toLowerCase()
  switch(unit) {
    case 'тб': case 'tb': return size * 1024 * 1024
    case 'гб': case 'gb': return size * 1024
    case 'мб': case 'mb': return size
    case 'кб': case 'kb': return size / 1024
    default: return size
  }
}