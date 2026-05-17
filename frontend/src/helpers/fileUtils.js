export function formatFileSize(size) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getFileExtension(filename) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export function truncateFileName(name, maxLength = 30) {
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength) + '..'
}

export function isAllowedFileType(filename, allowed = ['pdf', 'doc', 'docx']) {
  const ext = getFileExtension(filename)
  return allowed.includes(ext)
}